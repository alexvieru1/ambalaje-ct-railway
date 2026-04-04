import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET  /admin/fix-variant-options
 *   → Returns a report of all product options and their current titles.
 *
 * POST /admin/fix-variant-options
 *   → Renames all product option titles to "Mărime (cm)" if they differ.
 *     Variants and prices are untouched — only the option label changes.
 */

const TARGET_TITLE = "Mărime (cm)"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "options.id",
      "options.title",
      "options.values.id",
      "options.values.value",
    ],
  })

  const report = products.map((p: any) => ({
    product_id: p.id,
    product_title: p.title,
    options: (p.options ?? []).map((o: any) => ({
      option_id: o.id,
      current_title: o.title,
      needs_rename: o.title !== TARGET_TITLE,
      values: (o.values ?? []).map((v: any) => v.value),
    })),
  }))

  const needsFix = report.filter((p: any) =>
    p.options.some((o: any) => o.needs_rename)
  )

  res.status(200).json({
    target_title: TARGET_TITLE,
    total_products: report.length,
    products_needing_fix: needsFix.length,
    report,
  })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productService = req.scope.resolve("product")

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "options.id", "options.title"],
  })

  const updated: { product_id: string; product_title: string; option_id: string; old_title: string }[] = []
  const errors: { product_id: string; error: string }[] = []

  for (const product of products) {
    for (const option of product.options ?? []) {
      if (option.title === TARGET_TITLE) continue

      try {
        await productService.updateProductOptions(option.id, {
          title: TARGET_TITLE,
        })
        updated.push({
          product_id: product.id,
          product_title: product.title,
          option_id: option.id,
          old_title: option.title,
        })
      } catch (err: any) {
        errors.push({
          product_id: product.id,
          error: err.message || "Unknown error",
        })
      }
    }
  }

  res.status(200).json({
    target_title: TARGET_TITLE,
    updated_count: updated.length,
    error_count: errors.length,
    updated,
    errors,
  })
}
