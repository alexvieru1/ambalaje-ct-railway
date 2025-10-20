import { sdk } from "@lib/config"

export async function listCategories() {
  return sdk.store.category
    .list(
      {
        fields:
          "+category_children,+category_children.rank,+category_children.handle,+category_children.name,+rank,+handle,+name",
      },
      { cache: "no-store" }
    )
    .then(({ product_categories }) => product_categories)
}

export async function getCategoriesList(
  offset: number = 0,
  limit: number = 100
) {
  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { limit, offset },
    { cache: "no-store" }
  )
}

export async function getCategoryByHandle(categoryHandle: string[]) {
  return sdk.store.category
    .list(
      { handle: categoryHandle },            // 👈 same query
      { cache: "no-store" }
    )
    .then(({ product_categories }) => product_categories[0])  // 👈 only the object
    //                             ^ now the function’s return type is StoreProductCategory | undefined
}
