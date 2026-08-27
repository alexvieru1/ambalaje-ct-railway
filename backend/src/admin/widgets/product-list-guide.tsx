import { defineWidgetConfig } from "@medusajs/admin-sdk"
import React from "react"
import {
  CREATE_PRODUCT_GUIDE,
  STOCK_TROUBLESHOOTING_GUIDE,
} from "../components/guides/guides-data"
import { GuidePanel } from "../components/guides/guide-panel"

/**
 * Shown above the product list: how to add a product correctly, and what to
 * check when one will not show up in the shop.
 */
const ProductListGuide = () => (
  <div className="mb-4 flex flex-col gap-3">
    <GuidePanel guide={CREATE_PRODUCT_GUIDE} />
    <GuidePanel guide={STOCK_TROUBLESHOOTING_GUIDE} />
  </div>
)

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductListGuide
