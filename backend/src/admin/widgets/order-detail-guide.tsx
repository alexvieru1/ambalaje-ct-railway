import { defineWidgetConfig } from "@medusajs/admin-sdk"
import React from "react"
import { CAPTURE_PAYMENT_GUIDE } from "../components/guides/guides-data"
import { GuidePanel } from "../components/guides/guide-panel"

/**
 * The payment/fulfilment checklist, on the page where the work happens.
 * Collapsed by default so it stays out of the way once the job is familiar.
 */
const OrderDetailGuide = () => (
  <div className="mb-4">
    <GuidePanel guide={CAPTURE_PAYMENT_GUIDE} />
  </div>
)

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderDetailGuide
