'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiClipboard,
  FiDatabase,
  FiHome,
  FiTarget,
  FiUser,
  FiMenu,
  FiX,
  FiActivity,
  FiBookOpen
} from 'react-icons/fi'

type LinkItem = {
  href: string
  label: string
  Icon: React.ElementType
}

const allLinks: LinkItem[] = [
  { href: '/requests', label: 'בקשות יציאה', Icon: FiClipboard },
  { href: 'requests/myRequests', label: 'הבקשות שלי', Icon: FiClipboard },
  { href: '/warriors', label: 'לוחמים', Icon: FiUser },
  { href: '/tours', label: 'סבבי יציאה', Icon: FiHome },
  { href: '/missions', label: 'משימות', Icon: FiTarget },
  { href: '/shibutz', label: 'שבצק', Icon: FiMenu },
  { href: '/home', label: 'בית', Icon: FiDatabase }
]

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [role, setRole] = useState('')

  useEffect(() => {
    setRole(sessionStorage.getItem('role') ?? '')
  }, [])

  const logout = () => {
    sessionStorage.clear()
    document.cookie = 'accessToken=; path=/; max-age=0'
    router.push('/login')
  }

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return null

  const isCommander = role === 'מפקד'

  const links = isCommander
    ? allLinks.filter(
        (l) =>
          l.href !== 'requests/myRequests'
      )
    : allLinks.filter(
        (l) =>
          l.href === '/tours' ||
          l.href === '/shibutz' ||
          l.href === 'requests/myRequests'
      )

  return (
    <nav
      className="bg-gradient-to-r from-purple-700 to-purple-500 text-white px-6 py-4 flex items-center justify-between md:rounded-b-2xl h-20 relative"
      dir="rtl"
    >
      {/* Logo */}
      <div className="text-lg font-bold whitespace-nowrap mr-4">
        ישל"ט - שלוט בכוח שלך
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center justify-between w-full ml-4">
        <div className="flex gap-6 justify-center flex-1">
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                pathname === href
                  ? 'bg-white text-purple-700 shadow'
                  : 'hover:bg-white/20'
              }`}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-white text-purple-700 rounded-full font-semibold hover:bg-purple-100 transition ml-4"
        >
          התנתק
        </button>
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-2xl"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-20 right-0 w-full bg-white text-purple-800 z-50 flex flex-col items-end p-4 gap-4 shadow-md md:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`w-full text-right px-4 py-2 rounded-xl hover:bg-purple-100 ${
                pathname === href ? 'bg-purple-100 font-bold' : ''
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full text-right px-4 py-2 rounded-xl text-red-600 hover:bg-red-100"
          >
            התנתק
          </button>
        </div>
      )}
    </nav>
  )
}
