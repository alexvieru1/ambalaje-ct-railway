import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const variantId = req.query.variant_id as string

  if (!variantId) {
    res.status(400).json({ error: "variant_id query parameter is required" })
    return
  }

  const query = req.scope.resolve("query")

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "prices.*"],
    filters: { id: variantId },
  })

  const variant = variants[0]

  if (!variant) {
    res.status(404).json({ error: "Variant not found" })
    return
  }

  // Extract tiered prices grouped by currency
  const prices = (variant.prices ?? []).map((p: any) => ({
    amount: p.amount,
    currency_code: p.currency_code,
    min_quantity: p.min_quantity ?? null,
    max_quantity: p.max_quantity ?? null,
  }))

  res.status(200).json({ variant_id: variantId, prices })
}
