"use client"

import { useState } from "react"
import { Table, clx } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

import { updateLineItem } from "@lib/data/cart"
import Thumbnail from "@modules/products/components/thumbnail"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LineItemPrice from "@modules/common/components/line-item-price"
import DeleteButton from "@modules/common/components/delete-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ErrorMessage from "@modules/checkout/components/error-message"
import Spinner from "@modules/common/icons/spinner"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
}

const CartItem = ({ item, type = "full" }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleChangeQty = async (qty: number) => {
    if (qty < 1) return
    setError(null)
    setUpdating(true)

    await updateLineItem({ lineId: item.id, quantity: qty })
      .catch((err) => setError(err.message))
      .finally(() => setUpdating(false))
  }

  return (
    <Table.Row className="">
      {/** MOBILE CARD (<640px) */}
      <Table.Cell className="sm:hidden p-4">
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          {/* Image + Title + Delete */}
          <div className="flex items-start gap-3">
            <LocalizedClientLink
              href={`/produse/${item.product_handle}`}
              className="w-16 flex-shrink-0"
            >
              <Thumbnail
                thumbnail={item.thumbnail}
                images={item.variant?.product?.images}
                size="square"
              />
            </LocalizedClientLink>
            <div className="flex-1">
              <div className="text-base font-medium">{item.product_title}</div>
              <LineItemOptions variant={item.variant} />
            </div>
            <DeleteButton id={item.id} />
          </div>

          {/* Qty + Total */}
          <div className="flex items-center justify-between">
            <div>
              <label className="sr-only">Cantitate</label>
              <input
                readOnly
                value={item.quantity}
                className="w-16 h-8 text-center border border-gray-200 rounded-md bg-gray-50"
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-lg font-semibold">
                <LineItemPrice item={item} />
              </div>
            </div>
          </div>

          {updating && (
            <div className="flex justify-center">
              <Spinner />
            </div>
          )}
          {error && <ErrorMessage error={error} />}
        </div>
      </Table.Cell>

      {/** DESKTOP CELLS (≥640px) */}
      <Table.Cell className="hidden sm:!pl-4 sm:table-cell p-4 w-28">
        <LocalizedClientLink
          href={`/produse/${item.product_handle}`}
          className={clx("flex", {
            "w-20": type === "preview",
            "small:w-28 w-20": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="hidden sm:table-cell text-left p-4">
        {item.product_title}
        <LineItemOptions variant={item.variant} />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell className="hidden sm:table-cell sm:align-middle p-4">
          <div className="flex items-center gap-3">
            <DeleteButton id={item.id} />
            <input
              readOnly
              value={item.quantity}
              className="w-20 h-10 text-center border border-gray-200 rounded-md bg-gray-50"
            />
          </div>

          {updating && <Spinner className="mt-2" />}
          {error && <ErrorMessage error={error} />}
        </Table.Cell>
      )}

      <Table.Cell className="hidden sm:table-cell !pr-4 p-4 text-right">
        {type === "preview" ? (
          <span className="flex items-center justify-end gap-2">
            {item.quantity}×
            <LineItemUnitPrice item={item} style="tight" />
          </span>
        ) : (
          <LineItemPrice item={item} style="tight" />
        )}
      </Table.Cell>
    </Table.Row>
  )
}

export default CartItem
