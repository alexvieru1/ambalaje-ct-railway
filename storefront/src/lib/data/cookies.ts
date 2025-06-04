import "server-only"
import { cookies } from "next/headers"

/**
 * Return Authorization header only when a request
 * context is present (build-time SSG has none).
 */
export const getAuthHeaders = (): { authorization: string } | {} => {
  // ⬇️ SKIP if cookies() cannot be called (build-time / static route)
  try {
    const token = cookies().get("_medusa_jwt")?.value
    if (token) {
      return { authorization: `Bearer ${token}` }
    }
  } catch {
    /* no request context → ignore */
  }
  return {}
}

export const setAuthToken = (token: string) => {
  cookies().set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = () => {
  cookies().set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = () => {
  return cookies().get("_medusa_cart_id")?.value
}

export const setCartId = (cartId: string) => {
  cookies().set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = () => {
  cookies().set("_medusa_cart_id", "", { maxAge: -1 })
}
