// src/modules/common/components/line-item-unit-price/index.tsx
import { clx } from "@medusajs/ui"
import { convertToLocale } from "@lib/util/money"
import { getPercentageDiff } from "@lib/util/get-precentage-diff"
import { HttpTypes } from "@medusajs/types"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
}

const LineItemUnitPrice = ({
  item,
  style = "default",
}: LineItemUnitPriceProps) => {
  const variant = item.variant
  const cp = variant?.calculated_price

  // Fallback if variant or pricing info is missing
  if (!variant || !cp) {
    const fallbackAmount   = item.unit_price ?? 0
    const fallbackCurrency = (item as any).currency_code ?? "ron"

    return (
      <span className="text-base-regular">
        {convertToLocale({
          amount:   fallbackAmount,
          currency_code: fallbackCurrency,
        })}
      </span>
    )
  }

  // Determine actual unit and compare-at numbers
  const unitPriceNumber =
    item.unit_price ?? cp.calculated_amount ?? 0

  const compareAtNumber =
    item.compare_at_unit_price ?? cp.original_amount ?? unitPriceNumber

  const hasReducedPrice = unitPriceNumber < compareAtNumber
  const percentageDiff  = hasReducedPrice
    ? getPercentageDiff(compareAtNumber, unitPriceNumber)
    : 0

  // Ensure currency_code is non-null
  const currencyCode = cp.currency_code ?? "ron"

  // Format for display
  const formattedUnitPrice    = convertToLocale({ amount: unitPriceNumber,   currency_code: currencyCode })
  const formattedComparePrice = convertToLocale({ amount: compareAtNumber,   currency_code: currencyCode })

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span
              className="line-through"
              data-testid="product-unit-original-price"
            >
              {formattedComparePrice}
            </span>
          </p>
          {style === "default" && (
            <span className="text-ui-fg-interactive">
              -{percentageDiff}%
            </span>
          )}
        </>
      )}
      <span
        className={clx("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {formattedUnitPrice}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
