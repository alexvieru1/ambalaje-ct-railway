import { clx } from "@medusajs/ui"
import { convertToLocale } from "@lib/util/money"
import { getPercentageDiff } from "@lib/util/get-precentage-diff"
import { HttpTypes } from "@medusajs/types"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
}

const LineItemPrice = ({ item, style = "default" }: LineItemPriceProps) => {
  // If the shape isn’t what we expect, just show the raw unit_price
  if (!item.variant || !item.variant.calculated_price) {
    const fallbackAmount = item.unit_price ?? 0
    // If you happen to have currency_code on the item, you can use it here;
    // otherwise default to "ron".
    const fallbackCurrency = (item as any).currency_code ?? "ron"

    return (
      <span className="text-base-regular">
        {convertToLocale({ amount: fallbackAmount, currency_code: fallbackCurrency })}
      </span>
    )
  }

  const cp = item.variant.calculated_price

  // Prefer any custom unit_price you set; otherwise use the catalog price
  const unitAmt    = item.unit_price ?? cp.calculated_amount
  // Prefer a compare_at if you set one; otherwise use the catalog original price
  const compareAmt = item.compare_at_unit_price ?? cp.original_amount ?? 0

  // Totals (and account for any adjustments on the line)
  const adjustmentsSum = (item.adjustments ?? []).reduce((a, adj) => a + adj.amount, 0)
  const originalTotal  = compareAmt * item.quantity
  const currentTotal   = unitAmt * item.quantity - adjustmentsSum

  const hasDiscount = currentTotal < originalTotal
  const discountPct = hasDiscount
    ? getPercentageDiff(originalTotal, currentTotal)
    : 0

  // Make absolutely sure currency_code is a string
  const currencyCode = cp.currency_code ?? "ron"

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      {hasDiscount && (
        <div className="text-left">
          {style === "default" && <span className="text-ui-fg-subtle">Original: </span>}
          <span className="line-through text-ui-fg-muted" data-testid="product-original-price">
            {convertToLocale({ amount: originalTotal, currency_code: currencyCode })}
          </span>
          {style === "default" && (
            <span className="text-ui-fg-interactive ml-1">–{discountPct}%</span>
          )}
        </div>
      )}
      <span
        className={clx("text-base-regular", { "text-ui-fg-interactive": hasDiscount })}
        data-testid="product-price"
      >
        {convertToLocale({ amount: currentTotal, currency_code: currencyCode })}
      </span>
    </div>
  )
}

export default LineItemPrice
