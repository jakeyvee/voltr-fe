import type { ReactNode } from "react";
import type { Vault } from "@/components/vaults-grid";
import { ArrowUpRightIcon, BoltIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import LandingHeader from "@/components/ui/landing-header";
import LandingFooter from "@/components/ui/landing-footer";
import { FeatureCard, coreFeatureCards } from "@/components/ui/feature-cards";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

interface TvlData {
  success: boolean;
  data: {
    totalTvlUsd: number;
    lastUpdated: string;
  };
}

const DOCS = {
  ownerOverview: "https://docs.voltr.xyz/docs/for-vault-owners/owner-overview",
  integrations:
    "https://docs.voltr.xyz/docs/for-vault-owners/current-integrations",
  fees: "https://docs.voltr.xyz/docs/for-vault-owners/fees-and-accounting",
  allocation:
    "https://docs.voltr.xyz/docs/for-vault-owners/fund-allocation-guide",
  frontend:
    "https://docs.voltr.xyz/docs/for-vault-owners/frontend-integration-guide",
  security: "https://docs.voltr.xyz/docs/security/best-practices",
  audits: "https://docs.voltr.xyz/docs/security/security-audits",
  cli: "https://docs.voltr.xyz/vault-owners/operations/cli-and-scripts",
  agentSkills: "https://docs.voltr.xyz/.well-known/agent-skills/voltr/skill.md",
  launch: "https://docs.voltr.xyz/vault-owners/initialization/prerequisites",
};

const VOLTR_LOGO = "/images/logo.png";

const protocols = [
  {
    name: "Kamino",
    logo: "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/KMNO%20Token%20PNG-zlG8IWuvvfkyGlCEgVahCe8FZKo1xi.png",
  },
  {
    name: "Jupiter",
    logo: "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/jupiter.jpg",
  },
  {
    name: "Binance",
    logo: "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/binance.jpg",
  },
  {
    name: "Hyperliquid",
    logo: "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/hyperliquid-L9iTbKKpDFVoKLmdNB5tdz70lIwe8M.png",
  },
  {
    name: "Lighter",
    logo: "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/lighter.jpg",
  },
];

// Evenly spaced x-anchors across the 900-unit viewBox, one per protocol.
const PROTOCOL_X = [90, 270, 450, 630, 810];

const managers = [
  {
    name: "Hubra",
    href: "https://hubra.app/",
    icon: "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/hubra.jpg",
    matcher: "hubra",
    type: "Agentic lending",
  },
  {
    name: "Elemental Fund",
    href: "https://elemental.fund",
    icon: "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/elemental-clear.png",
    matcher: "elemental",
    type: "DeFi yield",
  },
  {
    name: "Vectis Finance",
    href: "https://vectis.finance",
    icon: "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/vectis-JAVpHQEjrVIZHc17osumDhnEmcQlcz.png",
    matcher: "vectis",
    type: "Automated strategies",
  },
];

const controlledOps = [
  {
    num: "01/",
    filled: 1,
    title: "On-chain accounting",
    copy: "Idle, deployed, LP supply, and performance tracked on-chain for anyone to verify.",
  },
  {
    num: "02/",
    filled: 2,
    title: "Role-separated control",
    copy: "Admin and manager duties stay split, so allocation never touches vault structure.",
  },
  {
    num: "03/",
    filled: 3,
    title: "Audited components",
    copy: "Published audits and deployed program details to evaluate before launch.",
  },
  {
    num: "04/",
    filled: 4,
    title: "Adaptor isolation",
    copy: "Protocol logic is sandboxed in adaptors behind one standardized vault interface.",
  },
];

const gridBg = {
  backgroundImage:
    "linear-gradient(to right, rgba(99,102,241,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.18) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
  maskImage: "radial-gradient(circle at 50% 35%, black 0%, transparent 70%)",
  WebkitMaskImage:
    "radial-gradient(circle at 50% 35%, black 0%, transparent 70%)",
};

const getVaultsInfo = async (): Promise<Vault[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return [];
  }

  try {
    const res = await fetch(`${baseUrl}/vaults`, { cache: "no-store" });

    if (!res.ok) {
      return [];
    }

    const { vaults }: { vaults?: Vault[] } = await res.json();
    return vaults ?? [];
  } catch (error) {
    console.error("Error fetching vaults:", error);
    return [];
  }
};

async function getTvlData(): Promise<{
  totalTvlUsd: number | null;
  lastUpdated: string | null;
}> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return { totalTvlUsd: null, lastUpdated: null };
  }

  try {
    const response = await fetch(`${baseUrl}/vaults/tvl`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch TVL data");
    }

    const data: TvlData = await response.json();

    if (data.success) {
      return {
        totalTvlUsd: data.data.totalTvlUsd,
        lastUpdated: data.data.lastUpdated,
      };
    }

    return { totalTvlUsd: null, lastUpdated: null };
  } catch (error) {
    console.error("Error fetching TVL:", error);
    return { totalTvlUsd: null, lastUpdated: null };
  }
}

function getVaultTvlUsd(vault: Vault) {
  return (vault.asset.price * vault.tvl) / Math.pow(10, vault.asset.decimals);
}

function formatUsd(value: number | null) {
  if (value === null) return "-";
  return `$${formatNumber(value)}`;
}

function getManagerStats(vaults: Vault[], matcher: string) {
  const managerVaults = vaults.filter((vault) =>
    vault.org.name.toLowerCase().includes(matcher)
  );

  if (managerVaults.length === 0) {
    return { vaultCount: null, tvl: null };
  }

  return {
    vaultCount: managerVaults.length,
    tvl: managerVaults.reduce(
      (total, vault) => total + getVaultTvlUsd(vault),
      0
    ),
  };
}

function SectionIntro({
  num,
  eyebrow,
  title,
  titleMuted,
  copy,
}: {
  num: string;
  eyebrow: string;
  title: string;
  titleMuted: string;
  copy: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-10 px-6 py-16 md:px-12 lg:grid-cols-2 lg:gap-32 lg:py-20">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm tracking-tighter text-white/40">
            {num}
          </span>
          <div className="h-4 w-px bg-white/15" />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-400">
            {eyebrow}
          </span>
        </div>
        <h2 className="text-3xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl">
          {title}
          <br />
          <span className="text-white/40">{titleMuted}</span>
        </h2>
      </div>
      <div className="lg:pt-20">
        <p className="max-w-md text-lg leading-relaxed text-gray-400">{copy}</p>
      </div>
    </div>
  );
}

function FeatureGrid({ items }: { items: typeof coreFeatureCards }) {
  return (
    <div className="grid grid-cols-1 border-t border-dotted border-white/15 md:grid-cols-3">
      {items.map((feature) => (
        <div
          key={feature.title}
          className="border-b border-dotted border-white/15 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
        >
          <FeatureCard {...feature} />
        </div>
      ))}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const cls =
    "group relative inline-flex items-center justify-center overflow-hidden px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]";
  const inner = (
    <>
      <span className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-500 to-violet-400 p-px shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-shadow duration-500 group-hover:shadow-[0_0_35px_-5px_rgba(99,102,241,0.85)]">
        <span className="block h-full w-full bg-gradient-to-b from-indigo-950 to-[#0c111d]" />
      </span>
      <span className="relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
        {children}
      </span>
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

function GhostButton({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const cls =
    "inline-flex items-center justify-center border border-white/15 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-white/40 hover:bg-white/5";

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export default async function Home() {
  const [tvlData, vaults] = await Promise.all([getTvlData(), getVaultsInfo()]);
  const fallbackTvl = vaults.length
    ? vaults.reduce((total, vault) => total + getVaultTvlUsd(vault), 0)
    : null;
  const totalTvl = tvlData.totalTvlUsd ?? fallbackTvl;
  const activeManagers = new Set(vaults.map((vault) => vault.org.name)).size;

  const metrics = [
    { label: "Total Value Locked", value: formatUsd(totalTvl) },
    { label: "Live Vaults", value: vaults.length ? `${vaults.length}` : "-" },
    {
      label: "Vault Managers",
      value: activeManagers ? `${activeManagers}` : "-",
    },
    { label: "Integrations", value: `${protocols.length}+` },
  ];

  return (
    <>
      <LandingHeader />
      <main className="bg-[#0c111d]">
      <div className="mx-auto max-w-7xl border-x border-dotted border-white/15">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 text-center md:py-32">
          <div className="pointer-events-none absolute inset-0" style={gridBg} />
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
              Launch and operate yield vaults on Solana.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
              The infrastructure layer for vault managers. Create vaults,
              allocate capital across strategy adaptors, and run yield products
              from one stack.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <PrimaryButton href={DOCS.launch} external>
                Launch a vault
              </PrimaryButton>
              <GhostButton href="/earn">Browse vaults</GhostButton>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section id="metrics" className="border-t border-dotted border-white/15">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="border-dotted border-white/15 px-6 py-8 [&:nth-child(n+3)]:border-t [&:nth-child(odd)]:border-r md:px-8 md:border-r md:last:border-r-0 md:[&:nth-child(n+3)]:border-t-0"
              >
                <div className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {metric.value}
                </div>
                <div className="mt-2 text-sm text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Core features */}
        <section id="features" className="border-t border-dotted border-white/15">
          <SectionIntro
            num="01"
            eyebrow="Manager toolkit"
            title="Everything you need"
            titleMuted="to operate a vault"
            copy="Voltr separates vault accounting, strategy execution, and operations so teams can ship yield products without rebuilding core infrastructure."
          />
          <FeatureGrid items={coreFeatureCards} />
        </section>

        {/* Agent Skills (split section) */}
        <section
          id="agent-skills"
          className="grid grid-cols-1 border-t border-dotted border-white/15 lg:grid-cols-2"
        >
          <div className="flex flex-col justify-center border-b border-dotted border-white/15 p-8 md:p-12 lg:border-b-0 lg:border-r lg:p-16">
            <span className="mb-8 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-gray-300">
              <BoltIcon className="h-3.5 w-3.5 text-indigo-400" />
              Agent Skills
            </span>
            <h3 className="text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
              Vault operations
              <br />
              <span className="text-white/40">built for AI agents.</span>
            </h3>
            <p className="mt-5 max-w-md text-base leading-relaxed text-gray-400">
              Let approved agents inspect vault state and run allocation actions
              within explicit, role-based permission boundaries.
            </p>
            <div className="mt-8">
              <GhostButton href={DOCS.agentSkills} external>
                View the Agent Skill
              </GhostButton>
            </div>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden p-8 md:p-12 lg:p-16">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[100px]" />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#0a0e18]/80 shadow-2xl backdrop-blur-md">
              <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4">
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <div className="whitespace-pre-wrap p-6 font-mono text-xs leading-loose text-gray-400 md:text-sm">
                <span className="text-indigo-300">~/voltr</span> $ agent vault
                inspect{"\n"}
                <span className="text-indigo-400">✔</span> Connected to vault
                Bzwt…mrY{"\n"}
                <span className="text-indigo-400">✔</span> Total assets{"   "}
                <span className="text-white">$4.21M</span>
                {"\n"}
                <span className="text-indigo-400">✔</span> Idle balance{"  "}
                <span className="text-white">$0.84M</span>
                {"\n"}
                <span className="text-gray-500">
                  → Allocating idle funds to strategy…
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Controlled operations */}
        <section id="security" className="border-t border-dotted border-white/15">
          <SectionIntro
            num="02"
            eyebrow="Controlled operations"
            title="Transparent"
            titleMuted="by design"
            copy="On-chain accounting, role-separated control, and adaptor-isolated execution, so managers and depositors can verify exactly what happens to capital."
          />
          <div className="grid grid-cols-1 border-t border-dotted border-white/15 lg:grid-cols-4">
            {controlledOps.map((item) => (
              <div
                key={item.title}
                className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden border-b border-dotted border-white/15 p-8 transition-colors last:border-b-0 hover:bg-white/[0.03] lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:6px_6px] opacity-50" />
                <div className="relative z-10 flex items-start justify-between">
                  <span className="font-mono text-xs text-indigo-400">
                    {item.num}
                  </span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((d) => (
                      <span
                        key={d}
                        className={`h-1 w-1 rounded-full ${
                          d < item.filled
                            ? "bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.8)]"
                            : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="relative z-10 space-y-3">
                  <h3 className="text-lg font-bold uppercase tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="font-mono text-xs uppercase leading-relaxed tracking-wide text-gray-400">
                    {item.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Integrations (connected diagram) */}
        <section id="integrations" className="border-t border-dotted border-white/15">
          <SectionIntro
            num="03"
            eyebrow="Adaptor ecosystem"
            title="Connected to"
            titleMuted="major venues"
            copy="Adaptors route capital to leading on-chain protocols and centralised venues while preserving a single, standardized vault interface."
          />
          <div className="relative overflow-hidden border-t border-dotted border-white/15 px-6 py-16 md:px-12">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:6px_6px] opacity-50" />
          <div className="relative z-10 mx-auto max-w-4xl">
            {protocols.map((protocol, i) => (
              <div
                key={protocol.name}
                className="absolute z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#0a0e18] shadow-lg shadow-black/40"
                style={{ left: `${(PROTOCOL_X[i] / 900) * 100}%`, top: "13%" }}
              >
                <Image
                  src={protocol.logo}
                  alt={protocol.name}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}

            <svg
              viewBox="0 0 900 340"
              className="h-auto w-full"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <filter
                  id="connGlow"
                  filterUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="900"
                  height="340"
                >
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {PROTOCOL_X.map((x, i) => {
                const d = `M 450 260 C 450 200, ${x} 160, ${x} 86`;
                return (
                  <g key={x}>
                    <path d={d} stroke="#818cf8" strokeWidth="1" opacity="0.12" />
                    <path
                      d={d}
                      stroke="#a5b4fc"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray="0.15 0.85"
                      filter="url(#connGlow)"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="1;0"
                        dur="3s"
                        begin={`${i * 0.45}s`}
                        repeatCount="indefinite"
                        calcMode="linear"
                      />
                    </path>
                    <circle cx={x} cy={86} r="3" fill="#a5b4fc" filter="url(#connGlow)">
                      <animate
                        attributeName="opacity"
                        values="0.3;1;0.3"
                        dur="3s"
                        begin={`${i * 0.45}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                );
              })}
            </svg>

            <div
              className="absolute left-1/2 z-10 h-14 w-14 -translate-x-1/2 -translate-y-1/2"
              style={{ top: "78%" }}
            >
              <span className="pointer-events-none absolute -inset-1 rounded-full bg-indigo-400/20 blur-xl" />
              <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-indigo-400/40 bg-[#0a0e18]">
                <Image
                  src={VOLTR_LOGO}
                  alt="Voltr"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </span>
            </div>
          </div>
          </div>
        </section>

        {/* Managers */}
        <section id="managers" className="border-t border-dotted border-white/15">
          <SectionIntro
            num="04"
            eyebrow="Built on Voltr"
            title="Trusted by"
            titleMuted="leading teams"
            copy="Strategy teams use Voltr as their infrastructure layer to package, operate, and distribute vault-based yield products on Solana."
          />
          <div className="grid grid-cols-1 border-t border-dotted border-white/15 md:grid-cols-3">
            {[...managers]
              .sort(
                (a, b) =>
                  (getManagerStats(vaults, b.matcher).tvl ?? -1) -
                  (getManagerStats(vaults, a.matcher).tvl ?? -1)
              )
              .map((manager) => {
              const stats = getManagerStats(vaults, manager.matcher);

              return (
                <a
                  key={manager.name}
                  href={manager.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col gap-6 overflow-hidden border-b border-dotted border-white/15 p-8 transition-colors last:border-b-0 hover:bg-white/[0.02] md:border-b-0 md:border-r md:p-12 md:last:border-r-0"
                >
                  <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:6px_6px] opacity-50" />
                  <div className="relative z-10 flex items-center gap-4">
                    <Image
                      alt={manager.name}
                      src={manager.icon}
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-medium tracking-tight text-white">
                        {manager.name}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500">
                        {manager.type}
                      </div>
                    </div>
                    <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-gray-600 transition-colors group-hover:text-indigo-300" />
                  </div>
                  <div className="relative z-10 flex gap-12">
                    <div>
                      <div className="text-2xl font-semibold tracking-tight text-white">
                        {stats.vaultCount ?? "-"}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-widest text-gray-500">
                        Vaults
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold tracking-tight text-white">
                        {formatUsd(stats.tvl)}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-widest text-gray-500">
                        TVL
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden border-t border-dotted border-white/15 px-6 py-28 text-center md:py-32">
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-1/2 w-3/4 -translate-x-1/2 rounded-t-full bg-indigo-500/10 blur-[120px]" />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight text-white md:text-5xl">
              Ready to launch your vault?
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-400">
              Create a vault, connect strategy adaptors, and operate your yield
              product with manager-first tooling.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <PrimaryButton href={DOCS.launch} external>
                Launch a vault
              </PrimaryButton>
            </div>
          </div>
        </section>
      </div>
      </main>
      <LandingFooter />
    </>
  );
}
