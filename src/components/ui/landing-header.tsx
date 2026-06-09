import Link from "next/link";
import Logo from "./logo-words";

const LAUNCH_URL =
  "https://docs.voltr.xyz/vault-owners/initialization/prerequisites";

export default function LandingHeader() {
  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#security", label: "Security" },
    { href: "/#integrations", label: "Integrations" },
    { href: "https://docs.voltr.xyz/", label: "Docs", external: true },
  ];

  return (
    <header className="z-30 w-full bg-[#0c111d]">
      <div className="mx-auto max-w-7xl border-x border-b border-dashed border-white/15">
        <div className="flex h-16 items-center justify-between gap-4 px-6 md:px-8">
          <div className="flex flex-1 items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-7 lg:flex">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/earn"
              className="hidden items-center justify-center border border-white/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:inline-flex"
            >
              Browse vaults
            </Link>
            <a
              href={LAUNCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center overflow-hidden px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-500 to-violet-400 p-px shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)] transition-shadow duration-500 group-hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.7)]">
                <span className="block h-full w-full bg-[#0c111d]" />
              </span>
              <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                Launch vault
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
