import {
  IconTruckDelivery,
  IconShieldCheck,
  IconRefresh,
  IconGiftCard,
} from "@tabler/icons-react"

const values = [
  {
    icon: IconTruckDelivery,
    title: "Livrare rapidă",
    description: "Prin curier, direct la ușa ta",
  },
  {
    icon: IconShieldCheck,
    title: "Plăți securizate",
    description: "Tranzacții protejate 100%",
  },
  {
    icon: IconRefresh,
    title: "Retur în 14 zile",
    description: "Returnare simplă și rapidă",
  },
  {
    icon: IconGiftCard,
    title: "Livrare gratuită",
    description: "La comenzi de peste 500 RON",
  },
]

export default function CoreValues() {
  return (
    <section className="content-container py-12">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-10 sm:gap-6">
        {values.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-center text-center gap-3"
          >
            <Icon size={40} stroke={1.5} color="#44b74a" />
            <div>
              <p className="text-sm font-semibold text-ui-fg-base">{title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
