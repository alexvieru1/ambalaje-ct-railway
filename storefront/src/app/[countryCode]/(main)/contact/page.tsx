import type { Metadata } from "next"
import ContactForm from "./contact-form"

export const metadata: Metadata = {
  title: "Contact | Ambalaje Constanța",
  description: "Trimite o solicitare pentru mostre, consiliere sau proiecte noi de ambalaje.",
}

export default function Page() {
  return <ContactForm />
}