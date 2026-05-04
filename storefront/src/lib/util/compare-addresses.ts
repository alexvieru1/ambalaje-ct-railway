const ADDRESS_KEYS = [
  "first_name",
  "last_name",
  "address_1",
  "company",
  "postal_code",
  "city",
  "country_code",
  "province",
  "phone",
] as const

export default function compareAddresses(address1: any, address2: any) {
  if (!address1 || !address2) return address1 === address2
  return ADDRESS_KEYS.every((key) => address1[key] === address2[key])
}
