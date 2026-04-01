import { Metadata } from "next"
import Image from "next/image"
import { Separator } from "@lib/components/ui/separator"
import {
  IconTruckDelivery,
  IconLeaf,
  IconUsers,
  IconTargetArrow,
  IconBuildingWarehouse,
  IconMapPin,
} from "@tabler/icons-react"

export const metadata: Metadata = {
  title: "Despre Noi | Ambalaje Constanța",
  description:
    "Află mai multe despre echipa Ambalaje Constanța, valorile noastre și angajamentul față de calitate și sustenabilitate.",
  openGraph: {
    title: "Despre Noi | Ambalaje Constanța",
    description:
      "Echipa Ambalaje Constanța — soluții de ambalare de calitate pentru afaceri din toată țara.",
    type: "website",
    locale: "ro_RO",
    siteName: "Ambalaje Constanța",
    images: ["/images/team.png"],
  },
}

const stats = [
  { value: "10+", label: "Ani de experiență" },
  { value: "5000+", label: "Clienți mulțumiți" },
  { value: "15000+", label: "Comenzi livrate" },
  { value: "500+", label: "Produse în stoc" },
]

const values = [
  {
    icon: IconLeaf,
    title: "Sustenabilitate",
    description:
      "Ne angajăm să oferim soluții de ambalare prietenoase cu mediul, reducând impactul asupra naturii.",
  },
  {
    icon: IconTargetArrow,
    title: "Calitate",
    description:
      "Fiecare produs trece prin standarde riguroase de calitate pentru a asigura satisfacția clienților.",
  },
  {
    icon: IconUsers,
    title: "Parteneriat",
    description:
      "Construim relații pe termen lung bazate pe încredere, transparență și respect reciproc.",
  },
  {
    icon: IconTruckDelivery,
    title: "Promptitudine",
    description:
      "Livrare rapidă și fiabilă, pentru că știm cât de important este timpul în afacerea ta.",
  },
]

export default function DespreNoiPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0">
          <Image
            src="/images/team.png"
            alt="Echipa Ambalaje Constanța"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-24 md:py-32 max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Despre Noi
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Suntem o echipă dedicată oferirii de soluții de ambalare de calitate
            pentru afaceri din Constanța și din toată țara.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#44b74a]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
            {stats.map((stat) => (
              <div key={stat.label} className="py-6 md:py-8 text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-white/80 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="container mx-auto px-6 py-16 md:py-20 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full rounded-xl bg-[#44b74a]/10" />
            <Image
              src="/images/team.png"
              alt="Echipa Ambalaje Constanța"
              width={600}
              height={400}
              className="relative rounded-xl object-cover shadow-lg w-full"
            />
          </div>
          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-ui-fg-base">
              Cine suntem
            </h2>
            <Separator className="w-16 h-1 bg-[#44b74a] rounded-full" />
            <p className="text-muted-foreground leading-relaxed">
              Cu o experiență solidă în domeniul distribuției și producției de
              ambalaje, ne mândrim cu o rețea de parteneri și clienți din toată
              țara. Credem în inovație, profesionalism și respect pentru mediul
              înconjurător.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              De la cutii de carton și folie stretch, până la ambalaje alimentare
              și pungi personalizate — oferim soluții complete pentru orice tip
              de afacere.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconBuildingWarehouse
                  size={20}
                  stroke={1.5}
                  className="text-[#44b74a]"
                />
                Depozit propriu
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconMapPin
                  size={20}
                  stroke={1.5}
                  className="text-[#44b74a]"
                />
                Constanța, România
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50">
        <div className="container mx-auto px-6 py-16 md:py-20 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ui-fg-base mb-4">
              Valorile noastre
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Principiile care ne ghidează în fiecare zi și ne ajută să oferim
              cele mai bune servicii clienților noștri.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#44b74a]/10 mb-4">
                  <Icon size={24} stroke={1.5} className="text-[#44b74a]" />
                </div>
                <h3 className="font-semibold text-ui-fg-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-6 py-16 md:py-20 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl border bg-card p-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#44b74a]/10 mb-4">
              <IconTargetArrow
                size={20}
                stroke={1.5}
                className="text-[#44b74a]"
              />
            </div>
            <h3 className="text-xl font-semibold text-ui-fg-base mb-3">
              Misiunea noastră
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Să oferim ambalaje de calitate superioară la prețuri competitive,
              contribuind la succesul afacerilor clienților noștri. Ne dedicăm
              să fim partenerul de încredere pentru orice nevoie de ambalare.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#44b74a]/10 mb-4">
              <IconLeaf
                size={20}
                stroke={1.5}
                className="text-[#44b74a]"
              />
            </div>
            <h3 className="text-xl font-semibold text-ui-fg-base mb-3">
              Viziunea noastră
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Dorim să devenim principalul furnizor regional de ambalaje,
              recunoscut pentru calitate, prețuri corecte și un serviciu
              orientat către nevoile reale ale clienților noștri.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
