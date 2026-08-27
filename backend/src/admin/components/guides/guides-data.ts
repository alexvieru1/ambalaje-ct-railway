import type { Guide } from "./types"

/**
 * Guide content.
 *
 * Every button label quoted here was taken from the Romanian locale actually
 * shipped in this build, so it matches what is on screen. Where Medusa's
 * Romanian is poor ("Creați împlinire" for Create fulfilment, "Mâner" for
 * Handle), the label is still quoted verbatim and explained in `detail` —
 * a guide that renames things is a guide you cannot follow.
 */

export const CAPTURE_PAYMENT_GUIDE: Guide = {
  id: "capture-payment",
  icon: "💳",
  title: "Încasarea plății pentru o comandă",
  summary:
    "La plata cu cardul, banii sunt doar rezervați până îi încasați manual. Acești pași vă duc de la comandă nouă la bani încasați și colet expediat.",
  steps: [
    {
      id: "open",
      title: "Deschideți comanda din meniul „Comenzi”",
      detail: "Comenzile noi apar sus. Dați clic pe rândul comenzii pentru a o deschide.",
    },
    {
      id: "check-status",
      title: "Uitați-vă la secțiunea „Plăți” și citiți starea plății",
      detail:
        "„Autorizat” înseamnă că banii sunt rezervați pe cardul clientului, dar NU au ajuns încă la dumneavoastră. „Capturat” înseamnă că au fost încasați.",
      warning:
        "O comandă „Autorizat” nu este o comandă plătită. Dacă nu capturați plata, rezervarea expiră după câteva zile și banii se întorc la client.",
    },
    {
      id: "verify",
      title: "Verificați comanda înainte de a încasa",
      detail:
        "Confirmați că aveți produsele pe stoc și că adresa de livrare este completă. Este mult mai simplu să anulați acum decât să restituiți banii după.",
    },
    {
      id: "capture",
      title: "Apăsați butonul „Capturați plata”",
      detail:
        "Se află în secțiunea „Plăți”. Butonul apare doar dacă plata nu a fost deja capturată sau anulată — dacă nu îl vedeți, plata este deja încasată.",
    },
    {
      id: "confirm",
      title: "Confirmați suma în fereastra care apare",
      detail: "Veți vedea mesajul „Plata de … va fi capturat”. Verificați suma, apoi confirmați.",
    },
    {
      id: "verify-captured",
      title: "Verificați că starea a devenit „Capturat”",
      detail: "Dacă starea nu s-a schimbat, reîncărcați pagina înainte de a încerca din nou.",
      warning:
        "Nu apăsați de mai multe ori dacă pare că nu s-a întâmplat nimic. Reîncărcați întâi pagina și verificați starea.",
    },
    {
      id: "fulfill",
      title: "Pregătiți coletul: apăsați „Creați împlinire”",
      detail:
        "Este traducerea Medusa pentru „creează livrarea”. Alegeți locația din care trimiteți și bifați articolele incluse în colet.",
    },
    {
      id: "ship",
      title: "După ce coletul a plecat, apăsați „Marcați ca fiind expediat”",
      detail:
        "Aici adăugați numărul AWB, dacă îl aveți. Clientul poate fi notificat automat.",
    },
  ],
}

export const CREATE_PRODUCT_GUIDE: Guide = {
  id: "create-product",
  icon: "📦",
  title: "Adăugarea unui produs cu variante",
  summary:
    "Un produs cu variante înseamnă un articol cu mai multe mărimi sau modele — de exemplu o cutie în 25, 30 și 40 cm. Creați produsul o dată, cu câte o variantă pentru fiecare mărime.",
  steps: [
    {
      id: "start",
      title: "Meniul „Produse” → butonul de creare produs",
      detail:
        "Formularul are patru pași, afișați sus: „Detalii”, „Organiza”, „Variante” și „Truse de inventar”. Treceți prin ei cu butonul de continuare.",
    },
    {
      id: "details",
      title: "Pasul „Detalii”: titlul, descrierea și pozele",
      detail:
        "Titlul este ce vede clientul în magazin. Câmpul „Mâner” este traducerea greșită a Medusa pentru „handle” — este adresa produsului pe site; lăsați-l să se completeze singur.",
    },
    {
      id: "organize",
      title: "Pasul „Organiza”: categorie și canal de vânzare",
      detail:
        "Dacă nu bifați niciun canal de vânzare, produsul nu apare în magazin, chiar dacă este publicat.",
      warning:
        "Acesta este cel mai frecvent motiv pentru care un produs nou „nu se vede pe site”.",
    },
    {
      id: "options",
      title: "Pasul „Variante”: adăugați întâi opțiunea",
      detail:
        "O opțiune este caracteristica după care diferă produsul — de exemplu „Mărime”, cu valorile 25, 30, 40. După ce o completați, variantele se generează singure, câte una pentru fiecare valoare.",
    },
    {
      id: "sku",
      title: "Pentru fiecare variantă, puneți la SKU codul din SmartBill",
      detail:
        "SKU-ul trebuie să fie identic cu codul produsului din SmartBill (gestiunea DEPOZIT) — de exemplu 1215. Doar așa se sincronizează stocul automat.",
      warning:
        "Fără SKU-ul corect, produsul rămâne pe stoc 0 și nu poate fi cumpărat. Nu inventați coduri și nu adăugați cifre în plus.",
    },
    {
      id: "inventory",
      title: "Pasul „Truse de inventar”: lăsați gestionarea stocului activă",
      detail:
        "Așa preia produsul cantitatea din SmartBill la următoarea sincronizare.",
    },
    {
      id: "publish",
      title: "Salvați, apoi puneți starea pe „Publicat”",
      detail:
        "Produsul nou se salvează ca „Proiect” (ciornă) și nu este vizibil în magazin până nu îl publicați.",
    },
    {
      id: "prices",
      title: "Mergeți la „Setări Produse” pentru prețuri și ambalaj",
      detail:
        "Acolo setați prețurile pe tranșe (1–9, 10–24, 25+) și opțiunile de ambalaj. Produsul nu se poate cumpăra fără preț.",
    },
    {
      id: "verify",
      title: "Verificați în „Verificare SmartBill” că produsul s-a corelat",
      detail:
        "Dacă apare în listă la „Lipsă în SmartBill”, SKU-ul nu se potrivește. Pagina vă propune codul corect.",
    },
  ],
}

export const STOCK_TROUBLESHOOTING_GUIDE: Guide = {
  id: "stock-missing",
  icon: "🔍",
  title: "Un produs nu apare pe stoc",
  summary:
    "Când un produs arată stoc 0 sau nu poate fi adăugat în coș, aproape întotdeauna este una dintre aceste patru cauze.",
  steps: [
    {
      id: "audit",
      title: "Deschideți „Setări” → „Verificare SmartBill”",
      detail:
        "Pagina arată exact produsele care nu se potrivesc cu SmartBill și de ce.",
    },
    {
      id: "sku",
      title: "Verificați dacă produsul apare la „Fără SKU” sau „Lipsă în SmartBill”",
      detail:
        "Dacă da, codul lipsește sau este greșit. Pagina propune codurile potrivite din SmartBill; alegeți-l pe cel corect.",
    },
    {
      id: "taken",
      title: "Dacă sugestia scrie „indisponibil”, codul e folosit de alt produs",
      detail:
        "Înseamnă că două produse din magazin trimit la același articol din SmartBill. Trebuie decis dacă sunt același lucru (și se șterge unul) sau dacă e nevoie de un cod separat în SmartBill.",
    },
    {
      id: "smartbill",
      title: "Verificați cantitatea în SmartBill, în gestiunea DEPOZIT",
      detail:
        "Magazinul folosește doar gestiunea DEPOZIT. Stocul din MAGAZIN nu se vede pe site.",
    },
    {
      id: "channel",
      title: "Verificați că produsul are un canal de vânzare bifat și e „Publicat”",
      detail:
        "Un produs pe stoc, dar nepublicat sau fără canal de vânzare, tot nu apare în magazin.",
    },
  ],
}

export const GUIDES: Guide[] = [
  CAPTURE_PAYMENT_GUIDE,
  CREATE_PRODUCT_GUIDE,
  STOCK_TROUBLESHOOTING_GUIDE,
]
