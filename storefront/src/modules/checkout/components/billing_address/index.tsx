// ✅ Updated `billing_address/index.tsx`
import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import React, { useState } from "react"
import CountrySelect from "../country-select"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [entityType, setEntityType] = useState<"individual" | "company">("individual")

  const [formData, setFormData] = useState<any>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code": cart?.billing_address?.country_code || "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
    "metadata.company_name": cart?.metadata?.company_name || "",
    "metadata.company_cui": cart?.metadata?.company_cui || "",
    "metadata.company_j": cart?.metadata?.company_j || "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev : any) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <>
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
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Nume"
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Adresă"
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Cod poștal"
          name="billing_address.postal_code"
          autoComplete="postal-code"
          value={formData["billing_address.postal_code"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Oraș"
          name="billing_address.city"
          autoComplete="address-level2"
          value={formData["billing_address.city"]}
          onChange={handleChange}
          required
        />
        <CountrySelect
          name="billing_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required
        />
        <Input
          label="Județ / Provincie"
          name="billing_address.province"
          autoComplete="address-level1"
          value={formData["billing_address.province"]}
          onChange={handleChange}
        />
        <Input
          label="Telefon"
          name="billing_address.phone"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
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

export default BillingAddress
