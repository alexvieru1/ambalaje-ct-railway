import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { z } from "zod"

const contactSchema = z.object({
  tip: z.enum(["mostre", "consiliere", "vizita", "proiect", "cerinte"]),
  nume: z.string().min(2).max(100),
  email: z.string().email().max(254),
  telefon: z.string().min(8).max(20),
  companie: z.string().max(200).optional(),
  oras: z.string().max(100).optional(),
  mesaj: z.string().min(5).max(2000),
  vizita_data: z.string().optional(),
  vizita_ora: z.string().optional(),
})

const tipLabels: Record<string, string> = {
  mostre: "Solicitare mostre",
  consiliere: "Cerere de consiliere",
  vizita: "Programare vizită la sediu",
  proiect: "Proiect nou de produs",
  cerinte: "Cerințe speciale",
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !fromEmail) {
    console.error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variable")
    return NextResponse.json(
      { error: "Eroare de configurare server." },
      { status: 500 }
    )
  }

  const resend = new Resend(apiKey)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = contactSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide. Verificați formularul." },
      { status: 400 }
    )
  }

  const data = result.data
  const tipLabel = tipLabels[data.tip] ?? data.tip

  let emailBody = `Tip solicitare: ${tipLabel}\n\n`
  emailBody += `Nume: ${data.nume}\n`
  emailBody += `Email: ${data.email}\n`
  emailBody += `Telefon: ${data.telefon}\n`
  if (data.companie) emailBody += `Companie: ${data.companie}\n`
  if (data.oras) emailBody += `Oraș: ${data.oras}\n`

  if (data.tip === "vizita" && (data.vizita_data || data.vizita_ora)) {
    emailBody += `\n`
    if (data.vizita_data) {
      const d = new Date(data.vizita_data)
      emailBody += `Data vizită: ${d.toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}\n`
    }
    if (data.vizita_ora) emailBody += `Ora vizită: ${data.vizita_ora}\n`
  }

  emailBody += `\nMesaj:\n${data.mesaj}\n`

  try {
    await resend.emails.send({
      from: fromEmail,
      to: "office@ambalajeconstanta.ro",
      replyTo: data.email,
      subject: `Solicitare nouă: ${tipLabel}`,
      text: emailBody,
    })
  } catch (error) {
    console.error("Resend error:", error)
    return NextResponse.json(
      { error: "Eroare la trimiterea mesajului. Încercați din nou." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
