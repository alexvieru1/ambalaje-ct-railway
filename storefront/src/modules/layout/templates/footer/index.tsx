import { Logo } from "@lib/components/logo"
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"


export default async function Footer() {
  const categories = await listCategories()
  const mainCategories = categories?.filter((c) => !c.parent_category)

  return (
    <footer className="w-full border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo */}
        {/* Logo + Name */}
        <div className="flex flex-col items-start gap-2">
          <Logo width={60} height={60} />
          <span className="text-lg font-semibold tracking-wide text-gray-800">
            Ambalaje Constanța
          </span>
          <p className="text-sm text-muted-foreground max-w-xs">
            Magazin de ambalaje pentru cofetării și patiserii.
          </p>
        </div>

        {/* Produse */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Produse</h4>
          <ul className="space-y-2">
            {mainCategories?.map((cat) => (
              <li key={cat.id}>
                <LocalizedClientLink
                  href={`/produse/${cat.handle}`}
                  className="text-sm text-muted-foreground hover:text-[#44b74a] transition"
                >
                  {cat.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Contact</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Tel: 0722 123 456</li>
            <li>Email: office@ambalajeconstanta.ro</li>
            <li>Bd. Aurel Vlaicu, 163, Constanța</li>
          </ul>
        </div>

        {/* ANPC + Social */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Info</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              <a
                href="https://anpc.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#44b74a] transition"
              >
                ANPC
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#44b74a] transition"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#44b74a] transition"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ambalaje Constanța. Toate drepturile
        rezervate.
      </div>
    </footer>
  )
}
