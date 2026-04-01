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
            <li>Tel: 0722 631 611</li>
            <li>Email: office@ambalajeconstanta.ro</li>
            <li>B-dul Aurel Vlaicu, 163, Constanța</li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a
              href="https://www.facebook.com/ambalajeconstanta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-muted-foreground hover:text-[#44b74a] transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/ambalaje.constanta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-muted-foreground hover:text-[#44b74a] transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Info + ANPC */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Informații</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              <LocalizedClientLink
                href="/content/privacy-policy"
                className="hover:text-[#44b74a] transition"
              >
                Politica de Confidențialitate
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink
                href="/content/terms-of-use"
                className="hover:text-[#44b74a] transition"
              >
                Termeni și Condiții
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink
                href="/content/cookies"
                className="hover:text-[#44b74a] transition"
              >
                Politica de Cookies
              </LocalizedClientLink>
            </li>
          </ul>
          <div className="flex flex-col gap-3 mt-4">
            <a
              href="https://anpc.ro/ce-este-sal/"
              target="_blank"
              rel="noopener noreferrer"
              title="ANPC - Soluționarea Alternativă a Litigiilor"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/anpc-sal.png"
                alt="ANPC SAL"
                width={150}
                height={37}
                className="object-contain"
              />
            </a>
            <a
              href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=RO"
              target="_blank"
              rel="noopener noreferrer"
              title="ANPC - Soluționarea Online a Litigiilor"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/anpc-sol.png"
                alt="ANPC SOL"
                width={150}
                height={37}
                className="object-contain"
              />
            </a>
          </div>
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
