import Link from "next/link";
import { profile } from "@/content/profile";

const nav = [
  { href: "/#work", label: "Work", mobile: true },
  { href: "/#systems", label: "Systems", mobile: false },
  { href: "/experience/", label: "Experience", mobile: true },
  { href: "/research/", label: "Research", mobile: true },
  { href: "/about/", label: "About", mobile: false },
  { href: "/#contact", label: "Contact", mobile: true },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0A1220]/95 text-white backdrop-blur-md" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label={`${profile.name}: home`}>
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-white/[0.04] font-mono text-[12px] font-medium tracking-wider text-accent-onDark">MR</span>
          <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">{profile.name}</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-0.5 text-sm sm:gap-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-md px-2 py-2 text-[13.5px] text-white/70 transition-colors hover:text-white sm:px-3 sm:text-sm ${n.mobile ? "" : "hidden lg:inline"}`}>
              {n.label}
            </Link>
          ))}
          <a href={profile.cvHref} className="ml-2 hidden rounded-md bg-accent-onDark px-3.5 py-2 text-[13.5px] font-semibold text-[#0A1220] transition-colors hover:bg-[#8BE3DE] md:inline-flex" download>
            Download CV
          </a>
        </nav>
      </div>
    </header>
  );
}
