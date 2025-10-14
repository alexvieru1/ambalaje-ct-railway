import type { Metadata } from "next"
import { Separator } from "@lib/components/ui/separator"
import { Card, CardHeader, CardTitle, CardContent } from "@lib/components/ui/card"

export const metadata: Metadata = {
  title: "Politica de Confidențialitate | Ambalaje Constanța",
  description:
    "Află cum colectăm, folosim și protejăm datele tale personale pe site-ul Ambalaje Constanța.",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Politica de Confidențialitate</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ultima actualizare: 14 octombrie 2025</p>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Pe scurt</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Această politică explică ce date colectăm, de ce, cum le folosim și ce drepturi aveți.
          Se aplică vizitatorilor site-ului și clienților Ambalaje Constanța.
        </CardContent>
      </Card>

      <nav className="mb-10 grid gap-2 text-sm">
        <a href="#cine-suntem" className="hover:underline">1. Cine suntem</a>
        <a href="#ce-date-colectam" className="hover:underline">2. Ce date colectăm</a>
        <a href="#cum-folosim" className="hover:underline">3. Cum folosim datele</a>
        <a href="#temei-legal" className="hover:underline">4. Temei legal</a>
        <a href="#durata-stocare" className="hover:underline">5. Durata de stocare</a>
        <a href="#partajare" className="hover:underline">6. Partajarea datelor</a>
        <a href="#transferuri" className="hover:underline">7. Transferuri internaționale</a>
        <a href="#drepturi" className="hover:underline">8. Drepturile dvs.</a>
        <a href="#cookie" className="hover:underline">9. Cookie-uri</a>
        <a href="#securitate" className="hover:underline">10. Securitate</a>
        <a href="#minori" className="hover:underline">11. Minori</a>
        <a href="#modificari" className="hover:underline">12. Modificări</a>
        <a href="#contact" className="hover:underline">13. Contact</a>
      </nav>

      <Separator className="mb-10" />

      <section id="cine-suntem" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">1. Cine suntem</h2>
        <p className="text-muted-foreground">
          Ambalaje Constanța (denumită în continuare „noi”) operează site-ul ambalaje-constanta.ro (denumit „Site-ul”).
          Suntem operator de date conform Regulamentului (UE) 2016/679 (GDPR).
        </p>
        <p className="text-muted-foreground">
          Date de contact operator: B-dul Exemplu nr. 123, Constanța • Email: contact@ambalaje-constanta.ro • Telefon: 07xx xxx xxx.
        </p>
      </section>

      <section id="ce-date-colectam" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">2. Ce date colectăm</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>Identificare: nume, prenume, companie, funcție.</li>
          <li>Contact: email, telefon, oraș/adresă de livrare/facturare.</li>
          <li>Comercial: produse vizualizate, comenzi, metode de plată (parțial mascate), retururi.</li>
          <li>Tehnice: IP, tip dispozitiv/navigator, pagini vizitate, preferințe (prin cookie-uri).</li>
          <li>Comunicații: mesaje prin formulare (ex. Contact, Solicitare mostre), recenzii.</li>
        </ul>
      </section>

      <section id="cum-folosim" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">3. Cum folosim datele</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>Procesare comenzi: creare cont, livrare, emitere documente fiscale, servicii suport.</li>
          <li>Răspuns la solicitări: mostre, consiliere, programări vizite, proiecte noi, cerințe speciale.</li>
          <li>Îmbunătățirea Site-ului și a serviciilor (analiză trafic, feedback clienți).</li>
          <li>Comunicări de marketing (numai cu consimțământul dvs.).</li>
          <li>Respectarea obligațiilor legale (contabile, fiscale, garanții).</li>
        </ul>
      </section>

      <section id="temei-legal" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">4. Temei legal</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>Executarea contractului (art. 6(1)(b) GDPR) – pentru comenzi și servicii.</li>
          <li>Interes legitim (art. 6(1)(f)) – prevenire fraude, securitate, îmbunătățiri.</li>
          <li>Consimțământ (art. 6(1)(a)) – newsletter/marketing sau anumite cookie-uri.</li>
          <li>Obligație legală (art. 6(1)(c)) – evidențe contabile/fiscale.</li>
        </ul>
      </section>

      <section id="durata-stocare" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">5. Durata de stocare</h2>
        <p className="text-muted-foreground">
          Păstrăm datele cât timp este necesar pentru scopurile menționate sau cât impune legea.
          De exemplu, documentele fiscale se păstrează conform termenelor legale aplicabile.
        </p>
      </section>

      <section id="partajare" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">6. Partajarea datelor</h2>
        <p className="text-muted-foreground">
          Putem partaja datele cu furnizori de servicii (curierat, plăți, găzduire, suport tehnic), exclusiv pentru
          îndeplinirea serviciilor noastre și pe baza unor acorduri de prelucrare. Nu vindem datele dvs.
        </p>
      </section>

      <section id="transferuri" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">7. Transferuri internaționale</h2>
        <p className="text-muted-foreground">
          Dacă transferăm date în afara SEE, vom aplica garanții adecvate (ex. Clauze Contractuale Standard) și vă vom informa conform legii.
        </p>
      </section>

      <section id="drepturi" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">8. Drepturile dvs.</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>Drept de acces, rectificare, ștergere („dreptul de a fi uitat”).</li>
          <li>Restricționare sau opoziție la prelucrare, inclusiv pentru marketing direct.</li>
          <li>Portabilitatea datelor.</li>
          <li>Retragerea consimțământului (nu afectează prelucrările anterioare).</li>
          <li>Plângere la ANSPDCP – <a className="underline" href="https://www.dataprotection.ro/" target="_blank" rel="noreferrer">dataprotection.ro</a>.</li>
        </ul>
        <p className="text-muted-foreground">Pentru exercitarea drepturilor, vedeți secțiunea „Contact”.</p>
      </section>

      <section id="cookie" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">9. Cookie-uri</h2>
        <p className="text-muted-foreground">
          Folosim cookie-uri necesare pentru funcționarea Site-ului și, cu acordul dvs., cookie-uri de analiză/marketing.
          Puteți gestiona preferințele din setările browserului sau prin bannerul de consimțământ (unde este disponibil).
        </p>
      </section>

      <section id="securitate" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">10. Securitate</h2>
        <p className="text-muted-foreground">
          Implementăm măsuri tehnice și organizatorice adecvate pentru a proteja datele personale împotriva accesului neautorizat,
          pierderii sau distrugerii.
        </p>
      </section>

      <section id="minori" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">11. Minori</h2>
        <p className="text-muted-foreground">
          Site-ul nu se adresează persoanelor sub 16 ani. Nu colectăm intenționat date despre minori.
        </p>
      </section>

      <section id="modificari" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">12. Modificări ale politicii</h2>
        <p className="text-muted-foreground">
          Putem actualiza periodic această politică. Cea mai nouă versiune va fi disponibilă pe această pagină,
          cu data ultimei actualizări afișată mai sus.
        </p>
      </section>

      <section id="contact" className="space-y-4">
        <h2 className="text-2xl font-semibold">13. Contact</h2>
        <p className="text-muted-foreground">
          Pentru întrebări sau pentru a vă exercita drepturile conform GDPR, ne puteți contacta la:
        </p>
        <address className="not-italic text-muted-foreground">
          Ambalaje Constanța<br />
          B-dul Exemplu nr. 123, Constanța<br />
          Email: <a className="underline" href="mailto:contact@ambalaje-constanta.ro">contact@ambalaje-constanta.ro</a><br />
          Telefon: 07xx xxx xxx
        </address>
      </section>
    </main>
  )
}