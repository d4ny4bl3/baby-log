# Server Setup — Baby Log

**Doména:** babylog.cz
**Klient:** mobilní aplikace (Capacitor) — backend nemá webový frontend
**Datum:** červen 2026

> Cesty níže předpokládají deploy do `/home/danis/baby-log` a uživatele `danis` — uprav podle svého serveru.

---

## Architektura

```
Mobilní app (Capacitor)
   │
   ▼ https://babylog.cz
┌─────────────────────────────┐
│  nginx (systémová služba)   │  /etc/nginx/sites-available/babylog.conf
│  static z disku             │  /home/danis/baby-log/static/
└──────────┬──────────────────┘
           │ proxy_pass 127.0.0.1:8000
           ▼
┌─────────────────────────────┐
│  babylog-backend            │  Docker kontejner
│  Django 6 + Gunicorn        │  127.0.0.1:8000 → 8000/tcp
│  python:3.12-slim           │
└──────────┬──────────────────┘
           │ (síť: internal)
           ▼
┌─────────────────────────────┐
│  baby-log-db-1              │  Docker kontejner
│  postgres:16                │  5432/tcp (interní)
└─────────────────────────────┘
```

Nginx běží jako systémová služba (ne v Dockeru) a proxuje na backend přes TCP na localhostu.
Backend při startu zapíše `collectstatic` do bind-mountovaného `./static`, odkud je nginx čte přímo (potřebuje to jen Django admin).

---

## Docker

### Kontejnery

| Jméno | Image | Porty |
|---|---|---|
| `babylog-backend` | `baby-log-backend` | `127.0.0.1:8000:8000` |
| `baby-log-db-1` | `postgres:16` | `5432/tcp` (interní) |

Oba kontejnery mají `restart: always`.

### Sítě

| Síť | Driver | Účel |
|---|---|---|
| `baby-log_internal` | bridge | Backend ↔ db |

### Volumes

| Volume | Typ | Účel |
|---|---|---|
| `baby-log_postgres_data` | named | Data PostgreSQL |
| `./static` | bind mount | Django collectstatic → nginx (admin static) |

### `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16
    restart: always
    env_file: ./backend/.env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal

  backend:
    build: ./backend
    restart: always
    container_name: babylog-backend
    depends_on:
      - db
    env_file: ./backend/.env
    ports:
      - "127.0.0.1:8000:8000"
    volumes:
      - ./static:/app/staticfiles
    networks:
      - internal

networks:
  internal:

volumes:
  postgres_data:
```

---

## Nginx

Nginx běží jako systémová služba: `systemctl status nginx`

### Konfigurace

| Soubor | Účel |
|---|---|
| `/etc/nginx/sites-available/babylog.conf` | Vhost pro babylog.cz |
| `/etc/nginx/sites-enabled/babylog.conf` | Symlink → sites-available (aktivní) |

### `/etc/nginx/sites-available/babylog.conf`

```nginx
# HTTP → redirect na HTTPS (+ ACME challenge pro Let's Encrypt)
server {
    listen 80;
    server_name babylog.cz;

    location /.well-known/acme-challenge/ {
        root /home/danis/baby-log/acme;
    }
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl;
    http2 on;
    server_name babylog.cz;

    ssl_certificate     /etc/letsencrypt/live/babylog.cz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/babylog.cz/privkey.pem;

    # Security headers (HSTS řeší i Django, tady jako pojistka)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    client_max_body_size 5m;   # base64 fotky dětí

    location /static/ {
        alias /home/danis/baby-log/static/;
        expires 30d;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> `X-Forwarded-Proto $scheme` je nutné — Django `SECURE_SSL_REDIRECT` a `SECURE_PROXY_SSL_HEADER` na něm závisí, jinak vznikne redirect smyčka.

### Oprávnění

Nginx běží jako `www-data` a musí přečíst `./static`:

```bash
chmod o+x /home/danis
chmod o+x /home/danis/baby-log
chmod -R o+rX /home/danis/baby-log/static
```

---

## SSL / TLS

- Certifikát: **Let's Encrypt** pro `babylog.cz`
- Umístění: `/etc/letsencrypt/live/babylog.cz/` (`fullchain.pem`, `privkey.pem`)
- Vydání: `certbot certonly --webroot -w /home/danis/baby-log/acme -d babylog.cz`

---

## Zabezpečení serveru

| Vrstva | Nástroj | Stav |
|---|---|---|
| Firewall | UFW | porty 22, 80, 443 |
| SSH | klíče, root zakázán, hesla zakázána | ✓ |
| Brute-force SSH | fail2ban (jail: sshd) | ✓ |
| Brute-force login API | fail2ban (jail na `/api/v1/auth/`, status 401) | nastavit |
| Automatické aktualizace | unattended-upgrades | ✓ |
| HTTPS hlavičky | Django + nginx | ✓ |
| PostgreSQL | neexponován mimo Docker | ✓ |

### fail2ban jail na login API

Filter `/etc/fail2ban/filter.d/babylog-auth.conf`:

```
[Definition]
failregex = ^<HOST> .* "POST /api/v1/auth/token/ HTTP/[\d.]+" 401
ignoreregex =
```

Jail `/etc/fail2ban/jail.d/babylog.conf` (čte nginx access log):

```
[babylog-auth]
enabled  = true
port     = http,https
filter   = babylog-auth
logpath  = /var/log/nginx/access.log
maxretry = 10
findtime = 60
bantime  = 3600
```

---

## Backend — Dockerfile & entrypoint

### `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN addgroup --system app && adduser --system --ingroup app app \
    && mkdir -p /app/staticfiles \
    && chown -R app:app /app
RUN chmod +x /app/entrypoint.sh
USER app
EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]
```

### `backend/entrypoint.sh`

Spouští se při každém startu kontejneru:

```sh
#!/bin/sh
set -e
python manage.py migrate --noinput
python manage.py collectstatic --noinput
exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3}
```

`migrate` aplikuje i tabulky `token_blacklist` (refresh token rotace/logout).
`core.wsgi` má v defaultu `DJANGO_SETTINGS_MODULE=core.settings.production`.

---

## Nasazení

```bash
cd /home/danis/baby-log
docker compose up -d --build
```

### Obnova SSL certifikátu

```bash
certbot renew
sudo systemctl reload nginx
```

---

## Struktura adresářů

```
/home/danis/baby-log/
├── docker-compose.yml
├── static/                      # Django collectstatic (bind mount, admin static)
├── acme/                        # Let's Encrypt webroot challenge
└── backend/
    ├── Dockerfile
    ├── entrypoint.sh
    ├── .dockerignore
    └── .env                     # secrets (SECRET_KEY, DATABASE_URL, POSTGRES_*)

/etc/nginx/sites-available/babylog.conf
/etc/nginx/sites-enabled/babylog.conf → ../sites-available/babylog.conf
/etc/letsencrypt/live/babylog.cz/     # fullchain.pem, privkey.pem
/etc/fail2ban/filter.d/babylog-auth.conf
/etc/fail2ban/jail.d/babylog.conf
```
