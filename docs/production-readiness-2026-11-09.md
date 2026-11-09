# Pregătire pentru lansare: jurnal 9 noiembrie 2026

Acest document descrie ce s-a verificat și ce s-a schimbat pe 9 noiembrie 2026
pentru lansarea în producție a www.ambalajeconstanta.ro: în cod, în Railway și
în DNS/cPanel. Mai descrie cele două incidente ale zilei și ce rămâne de făcut.

---

## Rezumat

| Zonă | Înainte | După |
|---|---|---|
| Node runtime | 20.x (vulnerabil la CVE-2026-111497) | 22.23.4 pe Backend și pe Storefront |
| `robots.txt` / `sitemap.xml` | Nu existau (pagina HTML 404) | Generate de Next.js; sitemap cu 79 de URL-uri (toate produsele și categoriile) |
| `ambalajeconstanta.ro` (fără www) | 404 pe HTTPS și redirect stricat pe HTTP | 301 spre `https://www.ambalajeconstanta.ro/<cale>` |
| Datele firmei pe site | Lipseau; politica de confidențialitate avea date de șablon | LEO & LORY SRL, CIF RO7307488, sediu social, în footer și în paginile legale |
| Meilisearch în backend | Dezactivat (variabila avea alt nume) | Activ: produsele se indexează |
| Bucket MinIO | Imaginea `minio/minio` dispăruse de pe Docker Hub; un restart ar fi scos toate imaginile de pe site | `pgsty/minio:RELEASE.2026-08-04T00-00-00Z`, cu aceleași date |
| Versiuni `@medusajs/*` | `"latest"` | Fixate pe `2.6.1` |
| Environment-ul `pr-2` din Railway | Rămas după PR #2 | Șters (PR închis) |

---

## Modificări în cod (pe `main`)

| Commit | Ce face |
|---|---|
| `eca7e79`, `5774f26` | Node 22.23.4 (fix pentru CVE-2026-111497). Build-ul storefront-ului nu mai cade dacă backend-ul răspunde cu eroare la build. |
| `bb34b22` | `@medusajs/*` fixate pe `2.6.1` în `backend/package.json`. În lockfile s-au schimbat doar liniile `specifier`. |
| `07a0905` | `robots.txt` și `sitemap.xml` ca rute native Next.js (`storefront/src/app/robots.ts`, `storefront/src/app/sitemap.ts`). Middleware-ul nu mai redirecționează aceste fișiere și nici fișierele statice. Am șters `next-sitemap`. |
| `1192990` | Datele firmei stau acum într-un singur loc, `storefront/src/lib/company.ts`, și apar în footer, Termeni și Confidențialitate. Am înlocuit adresa de șablon și emailul de pe domeniul greșit (`contact@ambalaje-constanta.ro`) cu `office@ambalajeconstanta.ro`. |

### De ce nu exista `robots.txt`

`pnpm build` din storefront rulează `launch-storefront build`, care execută doar
`next build`. Scriptul `postbuild:next` (`next-sitemap`) nu rula niciodată în
producție, iar fișierele din `public/` erau generate local și ignorate de git.
Mai mult, matcher-ul din middleware intercepta `/robots.txt` și îl redirecționa
spre `/ro/robots.txt`, unde se afișa pagina 404.

### Sitemap

- Conține 8 pagini statice plus fiecare produs și categorie, sub `/ro/produse/<handle>`.
- Se regenerează cel mult o dată pe oră (`revalidate = 3600`), deci produsele noi apar fără redeploy.
- Dacă backend-ul nu răspunde, sitemap-ul conține măcar paginile statice.
- Domeniul vine din `NEXT_PUBLIC_BASE_URL` (în producție: `https://www.ambalajeconstanta.ro`).

---

## Modificări în Railway (production)

### Variabile adăugate

| Serviciu | Variabilă | Valoare | Motiv |
|---|---|---|---|
| Backend | `MEILISEARCH_ADMIN_KEY` | `${{MEILISEARCH_MASTER_KEY}}` | Codul citește `MEILISEARCH_ADMIN_KEY`, dar în Railway exista doar `MEILISEARCH_MASTER_KEY`, deci plugin-ul de căutare nu se încărca. |
| Backend | `BACKEND_PUBLIC_URL` | `https://admin.ambalajeconstanta.ro` | Fără ea, backend-ul folosea domeniul `*.up.railway.app`. |
| Storefront | `NEXT_PUBLIC_DEFAULT_REGION` | `ro` | Valoarea implicită din cod era `us`. |
| Storefront | `NEXT_PUBLIC_FEATURE_SEARCH_ENABLED` | `true` | Fără ea, bara de căutare era ascunsă. |

### Variabilă ștearsă

- Bucket: `MINIO_BROWSER_REDIRECT_URL`. Se rezolva la `https://` fără domeniu și bloca pornirea noului MinIO (vezi incidentul 2).

### Bucket: schimbarea imaginii MinIO

- **Problema:** repo-ul `minio/minio` a dispărut de pe Docker Hub (404), `quay.io/minio/minio` cere autentificare, iar repo-ul MinIO de pe GitHub e arhivat. Containerul din producție mergea doar din imaginea descărcată în iunie. La orice restart sau mutare pe alt host, n-ar mai fi pornit, iar toate imaginile produselor ar fi dispărut de pe site.
- **De ce nu Railway Storage Buckets:** sunt doar private, fără citire publică. Ar fi fost nevoie de un proxy pentru imagini și de rescrierea URL-urilor imaginilor în baza de date.
- **Soluția:** `pgsty/minio:RELEASE.2026-08-04T00-00-00Z`, un fork comunitar întreținut, cu versiuni fixe. Imaginea e compatibilă: același entrypoint, rulează ca root, are `/bin/sh` și folosește `/data`. Volumul, cheile, URL-urile și start command-ul au rămas neschimbate.
- **Testul de dinainte (local, cu Docker):** am scris date cu MinIO 2025.07 (`bitnamilegacy/minio:2025.7.23`) și am pornit imaginea nouă pe același volum, cu start command-ul exact din Railway. Datele vechi s-au citit, accesul public pe `medusa-media` s-a păstrat, iar upload-ul nou a mers.
- **Rezultatul în producție:** deploy-ul a fost `SUCCESS`, health `200`, iar imaginile produselor răspund `200`, atât direct din bucket, cât și prin Next.js.

### Deploy-uri

Backend și Storefront au fost redeploy-ate prin push pe `main` (Node 22, variabile noi, robots/sitemap, datele firmei). Toate deploy-urile s-au încheiat cu `SUCCESS`.

### Environment-ul `pr-2`

A fost creat automat de Railway pentru PR #2 și conținea copii ale tuturor serviciilor. L-am șters prin închiderea PR-ului; Railway a eliminat atunci environment-ul automat (vezi incidentul 1).

---

## DNS și cPanel

Zona DNS e la cyberfolks.ro (cPanel). **Recordurile DNS nu au fost modificate.**

- Emailul depinde de recordul A al domeniului (`188.213.21.204`): MX-ul are ca destinație `ambalajeconstanta.ro`, iar `mail.` e un CNAME spre domeniu. Dacă recordul A ar fi mutat pe Railway, emailul ar înceta să funcționeze. Nici nu se poate face corect, pentru că Railway cere CNAME pe domeniul fără `www`.
- Redirect-ul vechi din cPanel era greșit: pe HTTP trimitea la `https://www.ambalajeconstanta.ro/$1`, cu `$1` scris literal, iar pe HTTPS nu se aplica deloc (404).
- L-am șters din **Domains → Redirects** și l-am înlocuit cu o regulă în `public_html/.htaccess`:

```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^ambalajeconstanta\.ro$ [NC]
RewriteRule ^(.*)$ https://www.ambalajeconstanta.ro/$1 [R=301,L]
```

- **Verificare după schimbare:** HTTP și HTTPS pe domeniul fără `www` dau 301 spre `www`, cu calea păstrată, într-un singur redirect. SMTP (25), IMAPS (993), webmail și cPanel funcționează în continuare.

### Recorduri de email: nu se modifică

Recordul A al domeniului, MX, `mail` (CNAME), SPF (TXT pe domeniu), `default._domainkey`, `_dmarc`, `resend._domainkey`, `send.` (MX și TXT, pentru Resend).

---

## Incidente

### 1. Aproape ștergerea serviciilor din producție (evitată)

- **Ce s-a întâmplat:** ca să șterg `pr-2`, am lăsat agentul Railway să pregătească ștergerea fiecărui serviciu și volum din acel environment. Patch-ul folosea **aceleași ID-uri de servicii și volume ca producția**, iar ce ar fi afectat nu era clar. Producția nu avea backup-uri.
- **Cum s-a rezolvat:** am apăsat Cancel și Discard, apoi am închis PR #2, iar Railway a șters automat environment-ul de PR. Producția nu a fost atinsă.
- **Lecția:** un environment se șterge **întreg**, din setările proiectului sau prin închiderea PR-ului. Nu se șterg servicii sau volume individual dintr-un environment care are aceleași ID-uri ca producția.

### 2. Imaginile produselor indisponibile ~5 minute (11:25–11:30)

- **Ce s-a întâmplat:** după schimbarea imaginii MinIO, containerul nou a pornit în buclă cu `FATAL Invalid MINIO_BROWSER_REDIRECT_URL value in environment variable: scheme appears with empty host`. Variabila venea din template-ul Railway inițial și se rezolva la un URL fără domeniu. Versiunea veche de MinIO o ignora, cea nouă o validează.
- **Cum s-a rezolvat:** am șters variabila, iar MinIO a pornit imediat. Datele nu au fost afectate, pentru că MinIO se oprește la validarea config-ului înainte să atingă volumul.
- **Lecția:** testul local a acoperit volumul și cheile, dar nu toate variabilele serviciului din producție. La o schimbare viitoare de imagine, verifică toate variabilele `MINIO_*`. Nu există rollback la imaginea veche, pentru că ea nu mai poate fi descărcată.

---

## Ce rămâne de făcut

### Înainte de lansare

- [ ] **Stripe live.** `STRIPE_API_KEY` = `sk_live_…` și `NEXT_PUBLIC_STRIPE_KEY` = `pk_live_…`. Webhook-ul `https://admin.ambalajeconstanta.ro/hooks/payment/stripe_stripe`, cu secretul live în `STRIPE_WEBHOOK_SECRET`. Atenție: după ce schimbi `NEXT_PUBLIC_STRIPE_KEY`, Storefront-ul are nevoie de redeploy.
- [ ] **Medusa admin.** În regiunea RO, providerii de plată (Stripe și/sau ramburs) și de livrare sunt activi; produsele demo sunt șterse, dacă mai există.
- [ ] **SmartBill.** `SMARTBILL_SYNC_DRY_RUN=false`, `SMARTBILL_SYNC_ENABLED=true`.
- [ ] **Nr. Reg. Com.** Se completează în `storefront/src/lib/company.ts` (`tradeRegisterNumber`) și apare automat în footer.
- [ ] **Emailul de contact.** Confirmă că `office@ambalajeconstanta.ro` e corect.
- [ ] **Upload în producție.** Încarcă din admin o imagine nouă la un produs și verifică că apare pe site.
- [ ] **Comandă de test cap-coadă.** Plată reală, apoi refund. Verifici emailul de confirmare (Resend), comanda în admin și sincronizarea stocului în SmartBill.
- [ ] **Backup manual al bazei de date** (vezi mai jos).

### După lansare

- [ ] Google Search Console: adaugă proprietatea și trimite `https://www.ambalajeconstanta.ro/sitemap.xml`.
- [ ] Google Analytics: setează `NEXT_PUBLIC_GA_MEASUREMENT_ID` pe Storefront, apoi redeploy. Consent mode e deja implementat.
- [ ] Formularul de retragere (anexa din OUG 34/2014) și o pagină „Livrare”.
- [ ] Cele 7 erori TypeScript ascunse de `typescript.ignoreBuildErrors` în `storefront/next.config.js`.
- [ ] Ștergerea domeniilor S3 demo din `storefront/next.config.js`, după ce confirmi că nu mai există produse demo.
- [ ] Ștergerea variabilelor nefolosite: `MEILISEARCH_API_KEY` (Storefront), `TEMPLATE_REPORTER_URL` (Backend). Pentru `MEDUSA_ADMIN_PASSWORD`, schimbă întâi parola contului de admin.
- [ ] „PR Environments” din setările proiectului Railway: dezactivează-le, ca să nu mai apară environment-uri de PR cu copii ale serviciilor.
- [ ] Branch-ul vechi `chore/pnpm-standardize` de pe GitHub: decide dacă mai e necesar.

### Bifat

- [x] Domeniul Resend e verificat (confirmat de Alex).

---

## Runbook

### Backup manual Postgres (planul Hobby nu are backup-uri automate)

```bash
brew install libpq && brew link --force libpq   # o singură dată
cd ~/Coding/ambalaje-ct-railway && railway login && railway link   # ambalaje-ct / production
railway run --service Postgres -- sh -c 'pg_dump "$DATABASE_PUBLIC_URL" -Fc -f ~/ambalaje-backup-$(date +%F).dump'
```

Fă un backup înainte de orice operație riscantă pe baza de date, pe bucket sau pe infrastructură.

### Verificări rapide după deploy

```bash
S=https://www.ambalajeconstanta.ro
curl -s -o /dev/null -w '%{http_code}\n' $S/ro                                   # 200
curl -s $S/robots.txt | head -3                                                  # text, nu HTML
curl -s $S/sitemap.xml | grep -c '<loc>'                                         # ~79+
curl -s -o /dev/null -w '%{http_code}\n' https://admin.ambalajeconstanta.ro/health          # 200
curl -s -o /dev/null -w '%{http_code}\n' https://bucket-production-8eda.up.railway.app/minio/health/ready  # 200
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://ambalajeconstanta.ro/      # 301 -> www
```

### Reguli pentru serviciul Bucket (MinIO)

- Imaginea e fixată pe `pgsty/minio:RELEASE.2026-08-04T00-00-00Z`. Nu folosi `latest`.
- Dacă schimbi imaginea, testează întâi pe o copie a datelor. Nu există rollback la `minio/minio`.
- Variabilele `MINIO_*` trebuie să aibă valori valide; noul MinIO refuză să pornească altfel.
