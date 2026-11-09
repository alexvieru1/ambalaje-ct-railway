/**
 * Legal identification of the merchant, shown in the footer and legal pages
 * (required for online shops by Legea 365/2002 art. 5 and OG 21/1992).
 * Keep this the single source of truth for company details.
 */
export interface CompanyInfo {
  /** Brand name used on the site. */
  brandName: string
  /** Registered legal name. */
  legalName: string
  /** Fiscal code (CIF/CUI); the RO prefix marks a VAT payer. */
  cif: string
  /** Trade register number (Nr. Reg. Com.), e.g. J13/1234/1995. Empty until provided. */
  tradeRegisterNumber: string
  /** Registered office (sediu social). */
  registeredOffice: string
  /** Where customers can find us. */
  address: string
  email: string
  phone: string
  /** Public domain of the shop, without protocol. */
  domain: string
}

const ADDRESS = "B-dul Aurel Vlaicu, nr. 163, Constanța"

export const COMPANY: CompanyInfo = {
  brandName: "Ambalaje Constanța",
  legalName: "LEO & LORY SRL",
  cif: "RO7307488",
  tradeRegisterNumber: "",
  registeredOffice: ADDRESS,
  address: ADDRESS,
  email: "office@ambalajeconstanta.ro",
  phone: "0722 631 611",
  domain: "www.ambalajeconstanta.ro",
}
