import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import WalletWrapper from "@/components/WalletWrapper";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import NonLandingOnly from "@/components/non-landing-only";
import PageIllustration from "@/components/page-illustration";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const atAero = localFont({
  src: [
    { path: "./fonts/AtAero-Air.otf", weight: "100", style: "normal" },
    { path: "./fonts/AtAero-AirItalic.otf", weight: "100", style: "italic" },
    { path: "./fonts/AtAero-Thin.otf", weight: "200", style: "normal" },
    { path: "./fonts/AtAero-ThinItalic.otf", weight: "200", style: "italic" },
    { path: "./fonts/AtAero-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/AtAero-LightItalic.otf", weight: "300", style: "italic" },
    { path: "./fonts/AtAero-Regular.otf", weight: "400", style: "normal" },
    {
      path: "./fonts/AtAero-RegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    { path: "./fonts/AtAero-Retina.otf", weight: "450", style: "normal" },
    {
      path: "./fonts/AtAero-RetinaItalic.otf",
      weight: "450",
      style: "italic",
    },
    { path: "./fonts/AtAero-Medium.otf", weight: "500", style: "normal" },
    {
      path: "./fonts/AtAero-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    { path: "./fonts/AtAero-Semibold.otf", weight: "600", style: "normal" },
    {
      path: "./fonts/AtAero-SemiboldItalic.otf",
      weight: "600",
      style: "italic",
    },
    { path: "./fonts/AtAero-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/AtAero-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "./fonts/AtAero-Black.otf", weight: "800", style: "normal" },
    { path: "./fonts/AtAero-BlackItalic.otf", weight: "800", style: "italic" },
    { path: "./fonts/AtAero-Super.otf", weight: "900", style: "normal" },
    { path: "./fonts/AtAero-SuperItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-ataero",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://voltr.xyz"),
  title: "Voltr | Vault Infrastructure for Solana Yield Managers",
  description:
    "Launch and operate Solana yield vaults with Voltr. Create vaults, configure fees, connect strategy adaptors, allocate capital, and manage vault operations through UI, SDK, CLI, and agent workflows.",
  openGraph: {
    title: "Launch and operate yield vaults on Solana",
    description:
      "Voltr gives vault managers modular infrastructure for vault creation, strategy allocation, fee accounting, integrations, and automated operations.",
    images: [
      {
        url: "/images/logo.png",
        width: 256,
        height: 256,
        alt: "Voltr logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Voltr | Solana Vault Infrastructure",
    description:
      "Create, manage, and scale yield vaults on Solana with Voltr's UI, SDK, CLI, adaptors, and Agent Skills.",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${atAero.variable} bg-[#0c111d] font-inter text-base text-gray-200 antialiased`}
      >
        <WalletWrapper>
          <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
            <NonLandingOnly>
              <Header />
            </NonLandingOnly>
            <PageIllustration />
            {children}
            <NonLandingOnly>
              <Footer />
            </NonLandingOnly>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable={false}
              pauseOnHover={false}
              theme="dark"
              transition={Slide}
            />
          </div>
        </WalletWrapper>
      </body>
    </html>
  );
}
