import type { Metadata } from "next"
import ContactForm from "./contact-form"

export const metadata: Metadata = {
  title: "Contact | Ambalaje Constanța",
  description:
    "Trimite o solicitare pentru mostre, consiliere sau proiecte noi de ambalaje.",
  openGraph: {
    title: "Contact | Ambalaje Constanța",
    description:
      "Contactează-ne pentru mostre, consiliere sau proiecte noi de ambalaje.",
    type: "website",
    locale: "ro_RO",
    siteName: "Ambalaje Constanța",
    images: ["/images/logo.png"],
  },
}

export default function Page() {
  return <ContactForm />
}