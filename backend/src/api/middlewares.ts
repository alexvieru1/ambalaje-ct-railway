// backend\src\api\middlewares.ts
import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http";
import { SetTieredPricesSchema } from "./admin/set-tiered-prices/validators";
import { StoreAddCartLineItem } from "@medusajs/medusa/api/store/carts/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/set-tiered-prices",
      method: "POST",
      middlewares: [validateAndTransformBody(SetTieredPricesSchema)],
    },
    {
      matcher: "/store/carts/:id/line-items-tiered", // <-- your custom route
      method: "POST",
      middlewares: [validateAndTransformBody(StoreAddCartLineItem)],
    },
  ],
});
