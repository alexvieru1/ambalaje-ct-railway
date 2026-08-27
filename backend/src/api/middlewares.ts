// backend\src\api\middlewares.ts
import {
  defineMiddlewares,
  validateAndTransformBody,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";
import { SetTieredPricesSchema } from "./admin/set-tiered-prices/validators";
import { SetPackagingOptionsSchema } from "./admin/set-packaging-options/validators";
import { SetVariantPackagingSchema } from "./admin/set-variant-packaging/validators";
import { SmartBillSyncSchema } from "./admin/smartbill-sync/validators";
import { AssignSkuSchema } from "./admin/smartbill-audit/assign-sku/validators";
import { StoreAddCartLineItem } from "@medusajs/medusa/api/store/carts/validators";

// Middleware to redirect root path to admin
const redirectToAdmin = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  if (req.path === "/" || req.path === "") {
    return res.redirect("/app");
  }
  next();
};

export default defineMiddlewares({
  routes: [
    {
      matcher: "/",
      method: "GET",
      middlewares: [redirectToAdmin],
    },
    {
      matcher: "/admin/set-tiered-prices",
      method: "POST",
      middlewares: [validateAndTransformBody(SetTieredPricesSchema)],
    },
    {
      matcher: "/admin/set-packaging-options",
      method: "POST",
      middlewares: [validateAndTransformBody(SetPackagingOptionsSchema)],
    },
    {
      matcher: "/admin/set-variant-packaging",
      method: "POST",
      middlewares: [validateAndTransformBody(SetVariantPackagingSchema)],
    },
    {
      matcher: "/admin/smartbill-sync",
      method: "POST",
      middlewares: [validateAndTransformBody(SmartBillSyncSchema)],
    },
    {
      matcher: "/admin/smartbill-audit/assign-sku",
      method: "POST",
      middlewares: [validateAndTransformBody(AssignSkuSchema)],
    },
    {
      matcher: "/store/carts/:id/line-items-tiered", // <-- your custom route
      method: "POST",
      middlewares: [validateAndTransformBody(StoreAddCartLineItem)],
    },
  ],
});
