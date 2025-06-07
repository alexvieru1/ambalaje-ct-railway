import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"
import { getRegion } from "@lib/data/regions"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Adrese",
  description: "Gestionează adresele tale de livrare.",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await getCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Adrese de livrare</h1>
        <p className="text-base-regular">
          Vizualizează și actualizează adresele tale de livrare. Poți adăuga oricâte adrese dorești. Acestea vor fi disponibile la finalizarea comenzii.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
