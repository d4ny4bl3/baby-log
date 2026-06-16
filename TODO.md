# TODO – Baby Log

## Záznamy a sledování

- [x] **Úprava záznamu** – možnost editovat existující záznam (čas, množství), nejen smazat
- [ ] **Poznámky k záznamu** – volitelný textový popis u každého záznamu (např. "kojení, levá strana")
- [~] **Typ krmení** – rozlišení: kojení / lahvička / přikrm; u kojení volitelně délka
  - ✅ DB migrace `0002_eat_type.sql`, výběr typu (lahvička / příkrm) v EventModal + EatForm, množství jen u lahvičky
  - ❌ kojení (breast) zatím chybí
  - `note TEXT` zůstane pro volný text
- [x] **Typ pleny** – rozlišení: mokrá / špinavá / smíšená (`wet`/`dirty`)
  - DB sloupec existuje, DiaperForm s pill výběrem, diaperTypeLabel util, zobrazeno v timeline
- [ ] **Vážení a měření** – záznamy výšky a váhy s historií a grafem (v detailu dítěte, ne na Home)

## Architektura formulářů

- [x] **Formulářové komponenty** – extrahovat do `SleepForm.vue`, `EatForm.vue`, `DiaperForm.vue`; použít v EventModal (Home) i v bottom sheetu (Overview/edit)
- [~] **Nahradit EventModal Teleportem** – IonModal měl problémy se z-indexem v Ionic stacking contextu; Teleport renderuje přímo do `body` a obchází to; sjednotit oba bottom sheety (Home + Overview) na stejný pattern
  - ✅ DayTimeline (Overview) používá Teleport ev-sheet
  - ❌ EventModal (Home) stále používá IonModal

## UX / Navigace

- [x] **Editace záznamu z timeline** – tlačítko Upravit v ev-sheet (Teleport), po stisku se sheet rozšíří o formulář s předvyplněnými daty; DB UPDATE funkce pro sleep/eat/diaper (updateSleep / updateDiaper / updateEat)
- [x] **Přidat záznam zpětně** – z přehledu (Overview) přímo přidat událost k vybranému dni
- [ ] **Swipe to delete** – v seznamu událostí swipe doleva pro rychlé smazání
- [ ] **Onboarding tip** – při prvním spuštění krátký průvodce hlavní obrazovkou

## Statistiky a přehledy

- [?] **Průměrná délka spánku** – zobrazit v Overview (denní průměr za posledních 7/30 dní)
- [ ] **Přehled po týdnech** – přepínač den / týden v Overview
- [ ] **Export dat** – export do CSV nebo PDF pro pediatra

## Správa dětí

- [x] **Fotka dítěte** – nahrání avatara místo písmena v kruhu
- [ ] **Milníky** – záznamy důležitých momentů (první úsměv, první slovo, první zub…)

## Technické

- [ ] **Záloha a obnova** – export/import celé databáze (JSON nebo SQLite soubor)
- [ ] **Tmavý režim** – respektovat systémové nastavení dark mode
- [x] **Verze v About** – dynamicky načítat verzi z `build.gradle`



## Synchronizace s backendem

Sync je volitelný — appka funguje plně offline. Uživatel si může vytvořit účet a zapnout sync.

### Stav

Sync funguje end-to-end: push, pull, retry pending, interval, soft-delete propagace.

### Fáze 1 – Účet a aktivace syncu ✅

- [x] **View "Účet"** – přihlášený/nepřihlášený stav, stav syncu, pending count, poslední sync, Synchronizovat nyní, Odhlásit se
- [x] **View "Přihlášení"** – formulář e-mail + heslo, JWT token, redirect po přihlášení
- [x] **View "Registrace"** – formulář jméno (nepovinné) + e-mail + heslo, redirect po registraci
- [x] **První sync** – po přihlášení/registraci `syncNow()`: push pending → pull since=0

### Fáze 2 – Per-record sync ✅

- [x] **Push při vytvoření záznamu** – `retryPending()` po každém insertu, PATCH/POST per-record
- [x] **Push při úpravě záznamu** – `sync_status = 'pending'` po update, `retryPending()` po uložení
- [x] **Soft delete** – `deleted_at` + `updated_at` nastaven lokálně i na serveru, propaguje se na druhý přístroj
- [x] **Retry pending záznamů** – `retryPending()` při startu i po každém záznamu

### Fáze 3 – Pull ✅

- [x] **Pořadí: push → pull** – `syncNow()` vždy retryPending → pull
- [x] **Pull při spuštění** – `App.vue` volá `syncNow()` v `onMounted`
- [x] **Interval pull** – `setInterval` každých 60s v `App.vue`
- [x] **Uložení `last_sync_at`** – ukládá se do `app_metadata` po každém úspěšném pull

### Fáze 4 – Backend ✅

- [x] **Modely** – `Child`, `Sleep`, `Eat`, `Diaper` + Django auth (User)
- [x] **API endpointy** – `ModelViewSet` pro každý model, soft-delete v `perform_destroy`
- [x] **Sync pull endpoint** – `/api/v1/sync/pull/?since=` vrací záznamy včetně soft-deleted
- [x] **Sync push** – per-record PATCH/POST/DELETE (místo bulk endpointu)
- [x] **Auth** – JWT přes `djangorestframework-simplejwt`, refresh + blacklist při odhlášení

### Účet – zbývá

- [ ] **Zapomenuté heslo** – reset přes e-mail (Django email backend + token)
- [ ] **Změna hesla** – formulář v AccountView (staré + nové heslo)

### Odolnost vůči výpadku serveru

- [x] Fire-and-forget – `pushRecord` má try/catch, `syncNow` nezahazuje výjimku do UI
- [x] Timeout – axios nastaven na 5s
- [x] 401 handler – interceptor zkusí refresh token, při selhání odhlásí uživatele
- [x] Chybová hláška v AccountView při nedostupném serveru
- [ ] **Bez sítě** – před pokusem o sync zkontrolovat `Network.getStatus()` z Capacitor



## Bezpečnost před nasazením

Výsledek security review backendu. Priorita: nejdřív 🔴, pak 🟠.

### 🔴 Kritické

- [x] **IDOR – zápis cizích dat** – `SleepViewSet`/`EatViewSet`/`DiaperViewSet` (`baby/views.py`) při create/update neověřují, že `child` patří přihlášenému uživateli. Útočník s tokenem může POST/PATCH se cizím `child` ID zapsat záznam do cizího účtu.
  - ✅ `ChildOwnedSerializer.get_fields` omezuje `child` queryset na děti uživatele (cizí ID → 400, bez úniku existence)

### 🟠 Vysoké

- [x] **HTTPS / security hlavičky v produkci** – `core/settings/production.py` nemá `SECURE_SSL_REDIRECT`, `SECURE_PROXY_SSL_HEADER`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_HSTS_SECONDS` (+ subdomains/preload)
  - ✅ Přidán proxy/SSL redirect, secure cookies, HSTS; CORS → `CORS_ALLOWED_ORIGINS` (app origins), CSRF `https://babylog.cz`
  - ⚠️ Na serveru: `.env` `ALLOWED_HOSTS=babylog.cz` + `DEBUG=False`, nginx `X-Forwarded-Proto`, ověřit `manage.py check --deploy`
- [x] **Rate limiting / throttling** – řeší **fail2ban** na serveru (jail na `/api/v1/auth/`, ban na firewallu). DRF throttling nepřidáván (redundantní)

### 🟡 Střední

- [ ] **Validátory hesla při registraci** – `RegisterView.create_user` (`accounts/views.py`) obchází `AUTH_PASSWORD_VALIDATORS`; heslo `1` projde. Volat `validate_password()` před vytvořením uživatele
- [ ] **Enumerace účtů** – hláška „account with this email already exists" prozradí existující e-maily; zvážit neutrální odpověď
- [ ] **`photo` bez limitu velikosti** – `TextField` (base64) bez omezení = nafouknutá DB / DoS. Validovat max. délku v serializeru, příp. `DATA_UPLOAD_MAX_MEMORY_SIZE`

### 🟢 Drobnosti

- [x] **`CORS_ORIGIN_WHITELIST` → `CORS_ALLOWED_ORIGINS`** – přejmenováno v production.py (dev.py má pořád starý alias, ale dev-only, neřeším)
- [x] **Refresh token rotace** – `ROTATE_REFRESH_TOKENS` + `BLACKLIST_AFTER_ROTATION` zapnuto; mobil ukládá nový refresh token v axios interceptoru
