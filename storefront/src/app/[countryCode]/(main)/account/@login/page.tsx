import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Logare | Ambalaje Contanța",
  description: "Loghează-te în contul tău Ambalaje Constanța",
}

export default function Login() {
  return <LoginTemplate />
}
