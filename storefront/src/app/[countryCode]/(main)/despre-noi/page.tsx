import { Metadata } from "next"
import Image from "next/image"
import { Separator } from "@lib/components/ui/separator"
import { Card, CardHeader, CardTitle, CardContent } from "@lib/components/ui/card"
import { Badge } from "@lib/components/ui/badge"

export const metadata: Metadata = {
  title: "Despre Noi | Ambalaje Constanța",
  description: "Află mai multe despre echipa Ambalaje Constanța, valorile noastre și angajamentul față de calitate și sustenabilitate.",
}

export default function DespreNoiPage() {
  return (
    <section className="container mx-auto px-6 py-16 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Despre Noi</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Suntem o echipă dedicată oferirii de soluții sustenabile și de calitate în domeniul ambalajelor.
          Misiunea noastră este să sprijinim afacerile locale și naționale prin produse prietenoase cu mediul și servicii de încredere.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
        <div>
          <Image
            src="/images/team.png"
            alt="Echipa Ambalaje Constanța"
            width={600}
            height={400}
            className="rounded-md object-cover shadow-md"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Cine suntem</h2>
          <p className="text-muted-foreground">
            Cu o experiență solidă în domeniul distribuției și producției de ambalaje, ne mândrim cu o rețea de parteneri și clienți din toată țara.
            Credem în inovație, profesionalism și respect pentru mediul înconjurător.
          </p>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Sustenabilitate</Badge>
            <Badge variant="secondary">Inovație</Badge>
            <Badge variant="secondary">Calitate</Badge>
            <Badge variant="secondary">Profesionalism</Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Misiunea noastră</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Să oferim ambalaje sustenabile care contribuie la protejarea mediului și sprijină dezvoltarea responsabilă a afacerilor.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Valorile noastre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Ne bazăm activitatea pe încredere, calitate și parteneriate pe termen lung. Fiecare client este parte din povestea noastră.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Viziunea noastră</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Dorim să devenim principalul furnizor regional de ambalaje ecologice și inovatoare, contribuind la un viitor mai curat.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}