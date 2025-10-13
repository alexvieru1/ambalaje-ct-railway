"use client"

import { useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ro } from "date-fns/locale"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@lib/components/ui/form"
import { Input } from "@lib/components/ui/input"
import { Textarea } from "@lib/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@lib/components/ui/radio-group"
import { Checkbox } from "@lib/components/ui/checkbox"
import { Button } from "@lib/components/ui/button"
import { Card } from "@lib/components/ui/card"
import { Separator } from "@lib/components/ui/separator"
import { Popover, PopoverTrigger, PopoverContent } from "@lib/components/ui/popover"
import { Calendar } from "@lib/components/ui/calendar"
import { Command, CommandGroup, CommandItem, CommandList } from "@lib/components/ui/command"
import { Alert, AlertDescription, AlertTitle } from "@lib/components/ui/alert"
import { CalendarIcon, Clock, Check } from "lucide-react"

const formSchema = z.object({
  tip: z.enum(["mostre", "consiliere", "vizita", "proiect", "cerinte"]),
  nume: z.string().min(2, "Introduceți un nume valid"),
  email: z.string().email("Email invalid"),
  telefon: z.string().min(8, "Număr de telefon invalid"),
  companie: z.string().optional(),
  oras: z.string().optional(),
  mesaj: z.string().min(5, "Introduceți un mesaj"),
  gdpr: z.boolean().refine((val) => val === true, "Consimțământul este necesar"),
  vizita_data: z.date().optional(),
  vizita_ora: z.string().optional(),
})

export default function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tip: "mostre",
      nume: "",
      email: "",
      telefon: "",
      companie: "",
      oras: "",
      mesaj: "",
      gdpr: false,
    },
  })

  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | undefined>()

  const [openDate, setOpenDate] = useState(false)
  const [openTime, setOpenTime] = useState(false)

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "14:00",
    "14:30",
    "15:00",
    "16:00",
  ] as const

  function isSameDay(a?: Date, b?: Date) {
    if (!a || !b) return false
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  function toMinutes(t: string) {
    const [h, m] = t.split(":" ).map(Number)
    return h * 60 + m
  }

  const now = new Date()
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const isSelectedToday = isSameDay(selectedDate, now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true)
    setSent(null)
    try {
      await new Promise((r) => setTimeout(r, 1000)) // simulate request
      setSent("Mulțumim! Mesajul a fost trimis cu succes.")
      form.reset()
      setSelectedDate(undefined)
      setSelectedTime(undefined)
    } catch {
      setSent("A apărut o eroare. Încercați din nou.")
    } finally {
      setSubmitting(false)
    }
  }

  const tipLabel = useMemo(() => {
    switch (form.watch("tip")) {
      case "mostre":
        return "Solicitare mostre"
      case "consiliere":
        return "Cerere de consiliere"
      case "vizita":
        return "Programare vizită la sediu"
      case "proiect":
        return "Proiect nou de produs"
      default:
        return "Cerințe speciale"
    }
  }, [form.watch("tip")])

  // Update form values on date change
  function handleDateChange(date: Date | undefined) {
    setSelectedDate(date)
    form.setValue("vizita_data", date)
  }

  // Update form values on time change
  function handleTimeChange(time: string | undefined) {
    setSelectedTime(time)
    form.setValue("vizita_ora", time)
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Contact – Ambalaje Constanța</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Spuneți-ne cu ce vă putem ajuta. Completați formularul și revenim rapid cu un răspuns.
      </p>

      <Card className="p-6 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip solicitare</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 justify-items-center"
                    >
                      {[
                        { id: "mostre", label: "Solicitare mostre" },
                        { id: "consiliere", label: "Cerere de consiliere" },
                        { id: "vizita", label: "Programare vizită la sediu" },
                        { id: "proiect", label: "Proiect nou de produs" },
                        { id: "cerinte", label: "Cerințe speciale" },
                      ].map(({ id, label }) => (
                        <div key={id} className="w-full">
                          <RadioGroupItem id={id} value={id} className="peer sr-only" />
                          <label
                            htmlFor={id}
                            className="inline-flex w-full items-center justify-center rounded-md border px-4 py-3 text-sm font-medium cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 peer-data-[state=checked]:bg-[#44b74a] peer-data-[state=checked]:text-white peer-data-[state=checked]:border-transparent"
                          >
                            {label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="nume"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nume și prenume</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Popescu Andrei" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="companie"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Companie (opțional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SC Ambalaje SRL" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="telefon"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="07xx xxx xxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nume@domeniu.ro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="oras"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Oraș (opțional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Constanța" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.watch("tip") === "vizita" && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  name="vizita_data"
                  control={form.control}
                  render={() => (
                    <FormItem>
                      <FormLabel>Data dorită</FormLabel>
                      <Popover open={openDate} onOpenChange={setOpenDate}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-between w-full" onClick={() => setOpenDate((v) => !v)}>
                            {selectedDate ? format(selectedDate, "PPP", { locale: ro }) : "Alege data"}
                            <CalendarIcon className="h-4 w-4 opacity-60" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => { handleDateChange(d); setOpenDate(false) }}
                            disabled={(date) => date < todayStart}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  name="vizita_ora"
                  control={form.control}
                  render={() => (
                    <FormItem>
                      <FormLabel>Interval orar</FormLabel>
                      <Popover open={openTime} onOpenChange={setOpenTime}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-between w-full" onClick={() => setOpenTime((v) => !v)}>
                            {selectedTime || "Alege ora"}
                            <Clock className="h-4 w-4 opacity-60" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-56">
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {timeSlots.map((t) => {
                                  const disabled = isSelectedToday && toMinutes(t) <= nowMinutes
                                  return (
                                    <CommandItem
                                      key={t}
                                      onSelect={() => {
                                        if (disabled) return
                                        handleTimeChange(t)
                                        setOpenTime(false)
                                      }}
                                      className={disabled ? "opacity-50 pointer-events-none" : ""}
                                    >
                                      <Check className={`mr-2 h-4 w-4 ${selectedTime === t ? "opacity-100" : "opacity-0"}`} />
                                      {t}
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              name="mesaj"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesaj</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Descrieți pe scurt solicitarea dumneavoastră." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert className="bg-muted/40">
              <AlertTitle>Protecția datelor</AlertTitle>
              <AlertDescription>
                Folosim datele doar pentru a vă contacta în legătură cu această solicitare.
              </AlertDescription>
            </Alert>

            <FormField
              name="gdpr"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal text-sm">
                    Sunt de acord ca datele mele să fie prelucrate pentru a fi contactat.
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {sent && <p className="text-sm text-green-600">{sent}</p>}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Se trimite..." : `Trimite (${tipLabel})`}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <section className="grid gap-6 md:grid-cols-2 mt-10">
        <Card className="p-6">
          <h2 className="font-semibold mb-2">Date de contact</h2>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Telefon:</strong> 07xx xxx xxx
            </li>
            <li>
              <strong>Email:</strong> contact@ambalaje-constanta.ro
            </li>
            <li>
              <strong>Program:</strong> Luni–Vineri, 09:00–17:00
            </li>
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold mb-2">Adresă & vizite</h2>
          <p className="text-sm">B-dul Exemplu nr. 123, Constanța</p>
          <p className="text-xs text-muted-foreground mt-2">
            Vizitele se fac pe bază de programare („Programare vizită la sediu”).
          </p>
        </Card>
      </section>
    </main>
  )
}