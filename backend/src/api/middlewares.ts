// backend\src\api\middlewares.ts
import {
  defineMiddlewares,
  validateAndTransformBody,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";
import { SetTieredPricesSchema } from "./admin/set-tiered-prices/validators";
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
      matcher: "/store/carts/:id/line-items-tiered", // <-- your custom route
      method: "POST",
      middlewares: [validateAndTransformBody(StoreAddCartLineItem)],
    },
  ],
});
