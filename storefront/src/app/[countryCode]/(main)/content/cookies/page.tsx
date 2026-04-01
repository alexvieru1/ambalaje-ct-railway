import type { Metadata } from "next"
import { Separator } from "@lib/components/ui/separator"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@lib/components/ui/card"

export const metadata: Metadata = {
  title: "Politica de Cookies | Ambalaje Constanța",
  description:
    "Află ce cookie-uri folosim, de ce le folosim și cum le poți gestiona.",
  openGraph: {
    title: "Politica de Cookies | Ambalaje Constanța",
    description: "Află ce cookie-uri folosim și cum le poți gestiona.",
    type: "website",
    locale: "ro_RO",
    siteName: "Ambalaje Constanța",
  },
}

export default function CookiesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Politica de Cookies
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ultima actualizare: 1 aprilie 2026
        </p>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Pe scurt</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Folosim cookie-uri strict necesare pentru funcționarea site-ului și,
          doar cu acordul tău, cookie-uri de analiză pentru a înțelege cum este
          utilizat site-ul. Poți modifica preferințele oricând.
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <section className="space-y-10 text-sm leading-relaxed text-muted-foreground">
        <div id="ce-sunt">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            1. Ce sunt cookie-urile?
          </h2>
          <p>
            Cookie-urile sunt fișiere mici de text stocate pe dispozitivul tău
            atunci când vizitezi un site web. Acestea permit site-ului să
            rețină informații despre vizita ta (cum ar fi preferințele de
            limbă, produsele din coș etc.), făcând navigarea mai ușoară și
            mai eficientă.
          </p>
        </div>

        <div id="tipuri">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            2. Ce tipuri de cookie-uri folosim?
          </h2>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold text-foreground mb-1">
                Cookie-uri strict necesare
              </h3>
              <p>
                Aceste cookie-uri sunt esențiale pentru funcționarea site-ului.
                Fără ele, site-ul nu poate funcționa corect. Exemple: sesiunea
                de utilizator, coșul de cumpărături, preferința de cookies.
              </p>
              <p className="mt-1 text-xs">
                <strong>Bază legală:</strong> Interes legitim (Art. 6 alin. 1
                lit. f GDPR)
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold text-foreground mb-1">
                Cookie-uri de analiză (Google Analytics)
              </h3>
              <p>
                Aceste cookie-uri ne ajută să înțelegem cum interacționează
                vizitatorii cu site-ul, colectând informații anonime despre
                paginile vizitate, timpul petrecut pe site și alte date
                statistice.
              </p>
              <p className="mt-1 text-xs">
                <strong>Bază legală:</strong> Consimțământ (Art. 6 alin. 1
                lit. a GDPR)
              </p>
              <p className="mt-1 text-xs">
                <strong>Furnizor:</strong> Google LLC — <strong>Durată:</strong>{" "}
                până la 2 ani
              </p>
            </div>
          </div>
        </div>

        <div id="gestionare">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            3. Cum poți gestiona cookie-urile?
          </h2>
          <p>
            La prima vizită pe site-ul nostru, îți cerem acordul pentru
            cookie-urile non-esențiale printr-un banner. Poți alege să accepți
            sau să refuzi. Poți modifica preferințele oricând ștergând
            cookie-urile din browser:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Chrome:</strong> Setări &gt; Confidențialitate și
              securitate &gt; Cookie-uri
            </li>
            <li>
              <strong>Firefox:</strong> Setări &gt; Confidențialitate și
              securitate &gt; Cookie-uri și date de site
            </li>
            <li>
              <strong>Safari:</strong> Preferințe &gt; Confidențialitate &gt;
              Gestionare date site web
            </li>
            <li>
              <strong>Edge:</strong> Setări &gt; Cookie-uri și permisiuni
              site
            </li>
          </ul>
        </div>

        <div id="google-analytics">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            4. Google Analytics
          </h2>
          <p>
            Utilizăm Google Analytics 4, un serviciu de analiză web furnizat
            de Google LLC. Datele sunt anonimizate și transmise către servere
            Google. Google poate utiliza aceste date conform propriei politici
            de confidențialitate. Poți dezactiva urmărirea Google Analytics
            instalând{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#44b74a] transition-colors"
            >
              extensia oficială de browser Google Analytics Opt-out
            </a>
            .
          </p>
        </div>

        <div id="modificari">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            5. Modificări ale acestei politici
          </h2>
          <p>
            Ne rezervăm dreptul de a actualiza această politică. Orice
            modificare va fi publicată pe această pagină cu o nouă dată de
            actualizare.
          </p>
        </div>

        <div id="contact">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            6. Contact
          </h2>
          <p>
            Pentru orice întrebări legate de cookie-uri sau de prelucrarea
            datelor personale, ne poți contacta la:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <strong>Email:</strong> office@ambalajeconstanta.ro
            </li>
            <li>
              <strong>Telefon:</strong> 0722 631 611
            </li>
            <li>
              <strong>Adresă:</strong> B-dul Aurel Vlaicu, 163, Constanța
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
