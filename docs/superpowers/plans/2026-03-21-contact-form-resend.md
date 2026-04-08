# Contact Form Resend Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing storefront contact form to send emails to `office@ambalajeconstanta.ro` via Resend.

**Architecture:** Next.js API route receives form POST, validates with Zod, sends plain-text email via Resend SDK. No backend changes. Storefront-only.

**Tech Stack:** Next.js 14 API routes, Zod, Resend SDK, TypeScript

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `storefront/src/app/api/contact/route.ts` | API route: validate input, send email via Resend |
| Modify | `storefront/src/app/[countryCode]/(main)/contact/contact-form.tsx` | Wire form submission to API, add error styling |
| — | `storefront/package.json` | Add `resend` dependency |

---

## Chunk 1: API Route and Form Integration

### Task 1: Install Resend dependency

- [ ] **Step 1: Install resend in storefront**

```bash
cd storefront && pnpm add resend
```

- [ ] **Step 2: Verify installation**

```bash
cd storefront && pnpm list resend
```

Expected: `resend` version listed (e.g., `resend 4.x.x`)

- [ ] **Step 3: Commit**

```bash
git add storefront/package.json storefront/pnpm-lock.yaml
git commit -m "chore: add resend dependency to storefront"
```

---

### Task 2: Create the contact API route

**Files:**
- Create: `storefront/src/app/api/contact/route.ts`

**Reference:** Existing API route pattern at `storefront/src/app/api/healthcheck/route.ts` uses `NextRequest`/`NextResponse`.

**Reference:** Spec at `docs/superpowers/specs/2026-03-21-contact-form-resend-design.md`

- [ ] **Step 1: Create the API route file**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { z } from "zod"

const fromEmail = process.env.RESEND_FROM_EMAIL
if (!process.env.RESEND_API_KEY || !fromEmail) {
  throw new Error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variable")
}

const resend = new Resend(process.env.RESEND_API_KEY)

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
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd storefront && npx tsc --noEmit src/app/api/contact/route.ts 2>&1 || true
```

Check for TypeScript errors. If `tsc` can't resolve paths due to Next.js config, that's OK — the dev server will catch real issues.

- [ ] **Step 3: Commit**

```bash
git add storefront/src/app/api/contact/route.ts
git commit -m "feat: add contact form API route with Resend integration"
```

---

### Task 3: Wire the contact form to the API

**Files:**
- Modify: `storefront/src/app/[countryCode]/(main)/contact/contact-form.tsx`

**What changes:**
1. Replace the simulated `setTimeout` with a `fetch` call to `/api/contact`
2. Serialize `vizita_data` (Date) as ISO string before sending
3. Omit `gdpr` from the payload (client-side gate only)
4. Add distinct error styling (red) vs success (green)

- [ ] **Step 1: Update the `onSubmit` function**

Replace lines 98-111 (the `onSubmit` function body) with:

```typescript
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true)
    setSent(null)
    setError(null)
    try {
      const { gdpr, vizita_data, ...rest } = values
      const payload = {
        ...rest,
        vizita_data: vizita_data ? vizita_data.toISOString() : undefined,
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? "Eroare la trimiterea mesajului.")
      }

      setSent("Mulțumim! Mesajul a fost trimis cu succes.")
      form.reset()
      setSelectedDate(undefined)
      setSelectedTime(undefined)
    } catch (e) {
      setError(e instanceof Error ? e.message : "A apărut o eroare. Încercați din nou.")
    } finally {
      setSubmitting(false)
    }
  }
```

- [ ] **Step 2: Add `error` state variable**

After line 60 (`const [sent, setSent] = useState<string | null>(null)`), add:

```typescript
  const [error, setError] = useState<string | null>(null)
```

- [ ] **Step 3: Update the success/error display in the JSX**

Replace line 365 (`{sent && <p className="text-sm text-green-600">{sent}</p>}`) with:

```tsx
              {sent && <p className="text-sm text-green-600">{sent}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
```

- [ ] **Step 4: Verify the storefront dev server starts without errors**

```bash
cd storefront && pnpm dev
```

Open the contact page in browser, check no console errors.

- [ ] **Step 5: Manual test — submit the contact form**

1. Go to the contact page in the browser
2. Fill in all required fields
3. Submit the form
4. Check that the success message appears in green
5. Check `office@ambalajeconstanta.ro` inbox for the email
6. Verify the email contains all submitted fields and the reply-to is the customer's email

- [ ] **Step 6: Manual test — verify error handling**

Test with the storefront running:

```bash
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"tip":"invalid"}'
```

Expected: `400` response with `{ "error": "Date invalide. Verificați formularul." }`

- [ ] **Step 7: Commit**

```bash
git add storefront/src/app/[countryCode]/(main)/contact/contact-form.tsx
git commit -m "feat: wire contact form to Resend API endpoint"
```

---

### Task 4: Configure Railway environment

- [ ] **Step 1: Add env vars to Railway storefront service**

Ensure the following environment variables are set in the Railway dashboard for the **storefront** service:

- `RESEND_API_KEY` — same value as in `.env.local`
- `RESEND_FROM_EMAIL` — same value as in `.env.local`

Without these, the contact form will fail in production with a startup error.
