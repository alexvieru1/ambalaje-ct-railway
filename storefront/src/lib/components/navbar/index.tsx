import { listCategories } from "@lib/data/categories"
import { DesktopNavbar } from "./desktop"
import MobileNavbar from "./mobile"


export default async function Navbar() {
  const categories = await listCategories()

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
        <DesktopNavbar categories={categories} />
        <MobileNavbar categories={categories} />
    </div>
  )
}
