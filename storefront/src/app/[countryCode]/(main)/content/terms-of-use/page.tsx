import type { Metadata } from "next"
import { Separator } from "@lib/components/ui/separator"

export const metadata: Metadata = {
  title: "Termeni și Condiții | Ambalaje Constanța",
  description:
    "Citește termenii și condițiile de utilizare ale site-ului Ambalaje Constanța. Află care sunt drepturile și obligațiile utilizatorilor și ale companiei.",
}

export default function TermsOfUsePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Termeni și Condiții de Utilizare</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ultima actualizare: 14 octombrie 2025</p>
      </header>

      <section className="space-y-6">
        <p className="text-muted-foreground">
          Vă rugăm să citiți cu atenție acești Termeni și Condiții înainte de a utiliza site-ul nostru. Prin accesarea sau utilizarea acestui site,
          sunteți de acord cu respectarea prezentelor condiții. Dacă nu sunteți de acord, vă rugăm să nu utilizați site-ul.
        </p>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Informații generale</h2>
          <p className="text-muted-foreground">
            Site-ul <strong>ambalaje-constanta.ro</strong> este operat de Ambalaje Constanța. Toate informațiile publicate pe acest site au caracter informativ și pot fi modificate fără notificare prealabilă.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Drepturi de proprietate intelectuală</h2>
          <p className="text-muted-foreground">
            Conținutul site-ului (texte, imagini, logo-uri, design, structura paginilor, cod sursă) este protejat de legislația privind drepturile de autor.
            Este interzisă copierea, distribuirea, modificarea sau publicarea conținutului fără acordul scris al Ambalaje Constanța.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Utilizarea site-ului</h2>
          <p className="text-muted-foreground">
            Utilizatorul se obligă să folosească site-ul doar în scopuri legale, fără a afecta integritatea, funcționalitatea sau securitatea acestuia.
            Este interzisă introducerea de coduri malițioase, colectarea de date fără consimțământ sau utilizarea neautorizată a conținutului.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Comenzi și contracte</h2>
          <p className="text-muted-foreground">
            Prin plasarea unei comenzi pe site, utilizatorul confirmă că a citit și acceptat Termenii și Condițiile.
            Contractul dintre Ambalaje Constanța și client este considerat încheiat doar după confirmarea comenzii prin email sau telefonic.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Prețuri și disponibilitate</h2>
          <p className="text-muted-foreground">
            Toate prețurile afișate sunt exprimate în RON și includ TVA, dacă nu se specifică altfel.
            Ambalaje Constanța își rezervă dreptul de a modifica prețurile, stocurile sau caracteristicile produselor fără notificare prealabilă.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Politica de retur</h2>
          <p className="text-muted-foreground">
            Clienții pot returna produsele achiziționate în termen de 14 zile calendaristice de la primirea coletului, conform legislației în vigoare.
            Produsele trebuie returnate în ambalajul original, fără urme de utilizare. Costurile de transport pot fi suportate de client, dacă nu este altfel prevăzut.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Limitarea răspunderii</h2>
          <p className="text-muted-foreground">
            Ambalaje Constanța nu poate fi făcută responsabilă pentru eventuale erori de afișare, indisponibilitatea temporară a site-ului sau pierderi indirecte rezultate din utilizarea informațiilor de pe site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Protecția datelor personale</h2>
          <p className="text-muted-foreground">
            Informațiile despre protecția datelor sunt disponibile în secțiunea <a href="/content/privacy-policy" className="underline">Politica de Confidențialitate</a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Legea aplicabilă</h2>
          <p className="text-muted-foreground">
            Prezentii Termeni și Condiții sunt guvernați de legislația română. Orice dispută va fi soluționată de instanțele competente din Constanța, România.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Contact</h2>
          <p className="text-muted-foreground">
            Pentru orice întrebări legate de Termenii și Condițiile de utilizare, ne puteți contacta la:
          </p>
          <address className="not-italic text-muted-foreground">
            Ambalaje Constanța<br />
            B-dul Exemplu nr. 123, Constanța<br />
            Email: <a href="mailto:contact@ambalaje-constanta.ro" className="underline">contact@ambalaje-constanta.ro</a><br />
            Telefon: 07xx xxx xxx
          </address>
        </section>
      </section>
    </main>
  )
}