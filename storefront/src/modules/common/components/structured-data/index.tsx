import { getBaseURL } from "@lib/util/env"

export default function StructuredData() {
  const baseUrl = getBaseURL()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#organization`,
    name: "Ambalaje Constanța",
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    image: `${baseUrl}/images/team.png`,
    description:
      "Magazin de ambalaje pentru cofetării, patiserii și afaceri. Cutii de carton, pungi, folie stretch și multe altele.",
    telephone: "+40722631611",
    email: "office@ambalajeconstanta.ro",
    address: {
      "@type": "PostalAddress",
      streetAddress: "B-dul Aurel Vlaicu, 163",
      addressLocality: "Constanța",
      addressCountry: "RO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 44.1598,
      longitude: 28.6348,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
    sameAs: [
      "https://www.facebook.com/ambalajeconstanta",
      "https://www.instagram.com/ambalaje.constanta",
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
