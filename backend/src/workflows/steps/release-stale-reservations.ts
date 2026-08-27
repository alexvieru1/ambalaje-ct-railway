import { Modules } from '@medusajs/framework/utils'
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk'

export type ReleaseStaleReservationsStepInput = {
  location_id: string
  /** Reservations younger than this are never touched. 0 disables the step. */
  max_age_hours: number
  dry_run: boolean
}

export type ReleaseStaleReservationsStepOutput = {
  released: number
  candidates: {
    id: string
    inventory_item_id: string
    quantity: number
    line_item_id: string | null
    reason: string
  }[]
}

/**
 * Release reservations that are both old *and* orphaned.
 *
 * Age alone is not enough to call a reservation stale: a legitimately
 * unfulfilled order can sit for days, and dropping its reservation would let
 * the same stock be sold twice. So a reservation is only released when its
 * order is gone or canceled.
 */
export const releaseStaleReservationsStep = createStep(
  'release-stale-reservations',
  async (
    { location_id, max_age_hours, dry_run }: ReleaseStaleReservationsStepInput,
    { container },
  ): Promise<StepResponse<ReleaseStaleReservationsStepOutput>> => {
    const logger = container.resolve('logger')

    if (max_age_hours <= 0) {
      return new StepResponse({ released: 0, candidates: [] })
    }

    const inventoryService = container.resolve(Modules.INVENTORY)
    const orderService = container.resolve(Modules.ORDER)

    const reservations = await inventoryService.listReservationItems(
      { location_id },
      { select: ['id', 'inventory_item_id', 'quantity', 'line_item_id', 'created_at'] },
    )

    const cutoff = Date.now() - max_age_hours * 60 * 60 * 1000
    const aged = reservations.filter((reservation) => {
      const createdAt = (reservation as { created_at?: string | Date }).created_at
      return createdAt ? new Date(createdAt).getTime() < cutoff : false
    })

    if (!aged.length) {
      return new StepResponse({ released: 0, candidates: [] })
    }

    const lineItemIds = aged
      .map((reservation) => reservation.line_item_id)
      .filter((id): id is string => Boolean(id))

    const lineItems = lineItemIds.length
      ? await orderService.listOrderLineItems(
          { id: lineItemIds },
          { select: ['id'], relations: ['order'] },
        )
      : []

    const orderStatusByLineItem = new Map<string, string | undefined>()
    for (const lineItem of lineItems) {
      const order = (lineItem as { order?: { status?: string } }).order
      orderStatusByLineItem.set(lineItem.id, order?.status)
    }

    const candidates: ReleaseStaleReservationsStepOutput['candidates'] = []

    for (const reservation of aged) {
      const lineItemId = reservation.line_item_id ?? null

      let reason: string | null = null
      if (!lineItemId) {
        reason = 'reservation has no line item'
      } else if (!orderStatusByLineItem.has(lineItemId)) {
        reason = 'line item no longer exists'
      } else if (orderStatusByLineItem.get(lineItemId) === 'canceled') {
        reason = 'order is canceled'
      }

      if (!reason) {
        continue
      }

      candidates.push({
        id: reservation.id,
        inventory_item_id: reservation.inventory_item_id,
        quantity: Number(reservation.quantity ?? 0),
        line_item_id: lineItemId,
        reason,
      })
    }

    if (!candidates.length) {
      logger.info(
        `[smartbill] ${aged.length} reservation(s) older than ${max_age_hours}h, none orphaned — nothing released`,
      )
      return new StepResponse({ released: 0, candidates: [] })
    }

    if (dry_run) {
      logger.info(
        `[smartbill] dry run — would release ${candidates.length} orphaned reservation(s)`,
      )
      return new StepResponse({ released: 0, candidates })
    }

    await inventoryService.deleteReservationItems(candidates.map((c) => c.id))
    logger.info(`[smartbill] released ${candidates.length} orphaned reservation(s)`)

    return new StepResponse({ released: candidates.length, candidates })
  },
)
