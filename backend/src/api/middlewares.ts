import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { SetTieredPricesSchema } from "./admin/set-tiered-prices/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/set-tiered-prices",
      method: "POST",
      middlewares: [
        validateAndTransformBody(SetTieredPricesSchema),
      ],
    },
  ],
})