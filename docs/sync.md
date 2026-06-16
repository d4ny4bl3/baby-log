# Online Sync Flow — dokumentace

## Přehled architektury

Appka funguje primárně **offline-first**: veškerá data žijí v lokální SQLite databázi. Sync je volitelný doplněk — uživatel si vytvoří účet a změny se pak průběžně replikují na Django REST backend.

Tok dat je vždy **push → pull**: nejdřív se odešlou lokální změny, pak se stáhnou serverové novinky. Sync nikdy neblokuje UI — všechny chyby jsou tiše zamlčeny a záznamy zůstanou ve stavu `pending`.

```
┌─────────────────────────────────────────┐
│              Mobile (Vue/Capacitor)      │
│                                         │
│  UI → local SQLite ←──── syncStore ─────┼──► Django REST API
│          (pending)    (push → pull)      │
└─────────────────────────────────────────┘
```

---

## Lokální databáze — sync-relevantní sloupce

Každá datová tabulka (`children`, `sleep`, `eat`, `diaper`) má tyto sloupce:

| Sloupec | Typ | Účel |
|---|---|---|
| `id` | TEXT (UUID) | Primární klíč, generovaný na klientovi |
| `updated_at` | INTEGER (ms) | Timestamp poslední změny — rozhoduje o konfliktech |
| `deleted_at` | INTEGER (ms) | Soft delete — NULL = aktivní záznam |
| `sync_status` | TEXT | `'pending'` = čeká na push, `'synced'` = server to zná |
| `version` | INTEGER | Prozatím nepoužíváno |

Tabulka `app_metadata` (klíč–hodnota):
- `last_sync_at` — timestamp (ms) posledního úspěšného pull
- `active_child_id` — aktuálně vybrané dítě v UI

---

## Spuštění aplikace

```
App.vue onMounted
  │
  ├─ authStore.loadToken()
  │    └─ přečte JWT z Capacitor Preferences
  │    └─ nastaví Authorization header na axios instanci
  │
  ├─ syncStore.loadState()
  │    ├─ načte last_sync_at z app_metadata
  │    └─ spočítá počet pending záznamů přes všechny tabulky
  │
  ├─ syncStore.syncNow()          ← okamžitý sync při startu
  │
  └─ setInterval(syncNow, 60 000) ← periodický sync každých 60s
```

---

## Push — odeslání lokálních změn na server

### Kdy se push spouští

1. **Okamžitě po každé uživatelské akci** — po uložení do SQLite se zavolá `syncStore.pushRecord(model, record)` přímo z view/store.
2. **Při spuštění appky (retry)** — `syncNow()` nejprve zavolá `retryPending()`, která projde všechny záznamy se `sync_status = 'pending'` a zkusí je znovu odeslat.

### Průběh pushRecord

```
pushRecord(model, record)
  │
  ├─ user není přihlášen → konec (nic se neodesílá)
  │
  ├─ record.deleted_at je nastaveno?
  │    └─ YES → DELETE /api/v1/{model}/{id}/
  │              (404 = server to neznal → OK, pokračujeme)
  │
  └─ NO → PATCH /api/v1/{model}/{id}/
            ├─ 200 → OK
            └─ 404 → POST /api/v1/{model}/  (server záznam nezná → vytvoříme)
  │
  ├─ úspěch → UPDATE {table} SET sync_status='synced' WHERE id=?
  │           pendingCount--
  │
  └─ chyba sítě/serveru → tiché catch, sync_status zůstane 'pending'
```

### Mapování polí (klient ↔ server)

Backend používá FK pole `child` (ID), lokální DB `child_id`. Konverze:

```js
// Klient → server:  child_id → child
toServerPayload: { child: record.child_id, ...rest }

// Server → klient:  child → child_id
toLocalRecord:   { child_id: record.child, ...rest }
```

Pro `children` není žádná konverze potřeba.

---

## Pull — stažení změn ze serveru

### Endpoint

```
GET /api/v1/sync/pull/?since={last_sync_at_ms}
```

Vrátí všechny záznamy patřící přihlášenému uživateli, kde `updated_at > since`. Při prvním syncu (`last_sync_at = null`) se posílá `since=0` → server pošle vše.

### Odpověď

```json
{
  "server_time": 1747123456789,
  "children": [...],
  "sleeps": [...],
  "eats": [...],
  "diapers": [...]
}
```

### Upsert do lokální DB

Pro každý přijatý záznam se provede atomický upsert:

```sql
INSERT INTO sleep (id, child_id, ...)
VALUES (?, ?, ..., 'synced', 1)
ON CONFLICT(id) DO UPDATE SET
    started_at = excluded.started_at,
    updated_at = excluded.updated_at,
    deleted_at = excluded.deleted_at,
    sync_status = CASE
        WHEN sync_status = 'pending' THEN 'pending'
        ELSE 'synced'
    END
WHERE excluded.updated_at > updated_at
```

Klíčová pravidla:
- **Server vyhrává jen když je novější** (`WHERE excluded.updated_at > updated_at`)
- **Pending záznamy si zachovají stav** — `sync_status` zůstane `'pending'`, takže při příštím retry se push provede
- **Soft delete se replikuje** — `deleted_at` ze serveru přepíše lokální NULL (záznam zmizí z UI)

### Uložení timestampu

Po úspěšném pull se uloží `server_time` do `app_metadata.last_sync_at`. Příští pull pošle tento timestamp jako `since=`.

---

## Conflict resolution — jak se řeší konflikty

Model je **last-write-wins na základě `updated_at`** (ms timestamp).

| Scénář | Výsledek |
|---|---|
| Lokální záznam novější (`local.updated_at ≥ server.updated_at`) | Server data se ignorují |
| Server novější, lokální `synced` | Server data přepíší lokální |
| Server novější, lokální `pending` | Server data přepíší pole, ale `sync_status` zůstane `pending` → příští push odešle lokální verzi zpátky na server |

> **Pozor:** Poslední případ znamená, že pokud server pošle novější data a lokální záznam je `pending`, lokální změny se ztratí a pak se při pushu přepíší zpátky na serveru. Toto je known limitation.

---

## Autentizace a obnova tokenu

### Login flow (LoginView → authStore)

```
authStore.login(email, password)
  → POST /api/v1/auth/token/  { username: email, password }
  ← { access, refresh }
  → setTokens(access, refresh, email)
      → Preferences.set('auth_token', access)
      → Preferences.set('auth_refresh', refresh)
      → api.defaults.headers.Authorization = 'Bearer {access}'
```

Po loginu `LoginView` zavolá `syncStore.syncNow()` a pak přesměruje.

### Token refresh (axios interceptor)

Pokud jakýkoliv request dostane `401`:

```
interceptor
  │
  ├─ original._retry = true  (zamezí nekonečné smyčce)
  ├─ GET Preferences 'auth_refresh'
  ├─ POST /api/v1/auth/token/refresh/ { refresh }
  ├─ úspěch → uložit nový access token, zopakovat původní request
  └─ chyba → authStore.logout() (tiché odhlášení)
```

### Logout

```
authStore.logout()
  → POST /api/v1/auth/logout/ { refresh }  ← blacklistuje refresh token
  → smazat token.value, user.value
  → smazat Authorization header
  → Preferences.remove('auth_token')
  → Preferences.remove('auth_refresh')
```

---

## Pořadí operací v syncNow

```
syncNow()
  │
  ├─ guard: isSyncing = true (zabrání souběžnému spuštění)
  │
  ├─ retryPending()
  │    └─ pro každý model → SELECT * WHERE sync_status='pending'
  │         └─ pushRecord(model, record)  (push → catch tiché)
  │
  ├─ pull()
  │    └─ GET /api/v1/sync/pull/?since=...
  │    └─ upsert všechny záznamy
  │    └─ uložit server_time do app_metadata
  │
  └─ isSyncing = false
```

---

## Backend endpointy (přehled)

| Method | URL | Popis |
|---|---|---|
| `POST` | `/api/v1/auth/register/` | Registrace nového uživatele |
| `POST` | `/api/v1/auth/token/` | Login → vrátí access + refresh JWT |
| `POST` | `/api/v1/auth/token/refresh/` | Obnova access tokenu |
| `POST` | `/api/v1/auth/logout/` | Blacklist refresh tokenu |
| `GET` | `/api/v1/auth/user/` | Info o přihlášeném uživateli |
| `GET/POST` | `/api/v1/children/` | Seznam dětí / vytvoření |
| `GET/PATCH/DELETE` | `/api/v1/children/{id}/` | Detail / úprava / smazání |
| `GET/POST` | `/api/v1/sleep/`, `/eat/`, `/diaper/` | Záznamy |
| `GET/PATCH/DELETE` | `/api/v1/sleep/{id}/` atd. | Detail záznamu |
| `GET` | `/api/v1/sync/pull/?since={ms}` | Pull všech změn od timestampu |

Všechny endpointy (kromě auth) vyžadují `Authorization: Bearer {access_token}`.

Backend provádí soft delete: `perform_destroy` nastaví `deleted_at` timestamp místo smazání řádku.

---

## Known limitations a edge cases

- **Fotky nejsou synced** — `children.photo` je Base64 blob uložený pouze lokálně; sync ho přeskakuje
- **Sdílení mezi partnery** — zatím nepodporováno; každý user vidí jen svá data
- **Conflict při pending + novější server data** — viz sekce Conflict resolution výše
- **Bez sítě** — requesty selžou po 5s timeoutu (nastaven v `axios.js`), záznamy zůstanou `pending`
- **Token expiry** — access token expiruje, interceptor zkusí refresh; pokud i refresh expiroval, proběhne tiché odhlášení
