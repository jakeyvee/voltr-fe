import Link from "next/link";
import Logo from "./logo-words";

const LAUNCH_URL =
  "https://docs.voltr.xyz/vault-owners/initialization/prerequisites";

type FooterLink = { label: string; href: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Browse vaults", href: "/earn" },
      { label: "Launch a vault", href: LAUNCH_URL, external: true },
      {
        label: "Integrations",
        href: "https://docs.voltr.xyz/docs/for-vault-owners/current-integrations",
        external: true,
      },
      {
        label: "Agent Skills",
        href: "https://docs.voltr.xyz/.well-known/agent-skills/voltr/skill.md",
        external: true,
      },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "https://docs.voltr.xyz/", external: true },
      {
        label: "Owner overview",
        href: "https://docs.voltr.xyz/docs/for-vault-owners/owner-overview",
        external: true,
      },
      {
        label: "Security audits",
        href: "https://docs.voltr.xyz/docs/security/security-audits",
        external: true,
      },
      {
        label: "CLI & Scripts",
        href: "https://docs.voltr.xyz/vault-owners/operations/cli-and-scripts",
        external: true,
      },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "X / Twitter", href: "https://x.com/voltrxyz", external: true },
      { label: "GitHub", href: "https://github.com/voltrxyz", external: true },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const cls =
    "text-sm text-gray-500 transition-colors hover:text-white";
  return (
    <li>
      {link.external ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          {link.label}
        </a>
      ) : (
        <Link href={link.href} className={cls}>
          {link.label}
        </Link>
      )}
    </li>
  );
}

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0c111d]">
      <div className="mx-auto max-w-7xl border-x border-t border-dotted border-white/15">
        <div className="grid grid-cols-2 gap-10 px-6 py-16 md:grid-cols-5 md:gap-8 md:px-12">
          <div className="col-span-2 flex flex-col gap-6">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              Vault infrastructure for Solana yield managers. Create vaults,
              allocate capital across strategy adaptors, and operate yield
              products from one stack.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/voltrxyz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z" />
                </svg>
              </a>
              <a
                href="https://github.com/voltrxyz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z" />
                </svg>
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <FooterLinkItem key={link.label} link={link} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-dotted border-white/15 px-6 py-8 md:flex-row md:px-12">
          <p className="text-xs text-gray-600">
            © {year} Voltr. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
            <span className="text-xs tracking-tight text-gray-500">
              Systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
