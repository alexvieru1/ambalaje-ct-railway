// ✅ Updated `billing_address/index.tsx` and `shipping-address/index.tsx` with individual/company toggle
import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import React, { useState, useEffect, useMemo } from "react"
import CountrySelect from "../country-select"
import AddressSelect from "../address-select"
import { mapKeys } from "lodash"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [entityType, setEntityType] = useState<"individual" | "company">(
    (cart?.metadata?.entity_type as "individual" | "company") || "individual"
  )

  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
    "metadata.company_name": cart?.metadata?.company_name || "",
    "metadata.company_cui": cart?.metadata?.company_cui || "",
    "metadata.company_j": cart?.metadata?.company_j || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Salut ${customer.first_name}, dorești să folosești una dintre adresele tale salvate?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="entityType"
            value="individual"
            checked={entityType === "individual"}
            onChange={() => setEntityType("individual")}
          />
          Persoană fizică
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="entityType"
            value="company"
            checked={entityType === "company"}
            onChange={() => setEntityType("company")}
          />
          Firmă
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prenume"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Nume"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Adresă"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Companie"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
        />
        <Input
          label="Cod poștal"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Oraș"
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
        />
        <CountrySelect
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["shipping_address.country_code"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Județ / Provincie"
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"]}
          onChange={handleChange}
        />
      </div>
      <div className="my-8">
        <Checkbox
          label="Adresa de facturare este aceeași cu cea de livrare"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Telefon"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
        />

        {entityType === "company" && (
          <>
            <Input
              label="Nume Firmă"
              name="metadata.company_name"
              value={formData["metadata.company_name"]}
              onChange={handleChange}
              required
            />
            <Input
              label="CUI Firmă"
              name="metadata.company_cui"
              value={formData["metadata.company_cui"]}
              onChange={handleChange}
              required
            />
            <Input
              label="J Firmă"
              name="metadata.company_j"
              value={formData["metadata.company_j"]}
              onChange={handleChange}
              required
            />
          </>
        )}
      </div>
    </>
  )
}

export default ShippingAddress
