import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Autentificare | Ambalaje Constanța",
  description:
    "Autentifică-te în contul tău pentru a accesa comenzile și a gestiona profilul.",
}

export default function Login() {
  return <LoginTemplate />
}
