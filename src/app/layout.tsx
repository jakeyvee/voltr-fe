import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import WalletWrapper from "@/components/WalletWrapper";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
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
  title: "Start earning with confidence",
  description:
    "Voltr opens access to transparent, high-yield generating vaults secured by institutional-grade security. Deposit your assets and earn yield across Solana.",
  openGraph: {
    title: "Start earning with confidence",
    description:
      "Voltr opens access to transparent, high-yield generating vaults secured by institutional-grade security. Deposit your assets and earn yield across Solana.",
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
    title: "Start earning with confidence",
    description:
      "Voltr opens access to transparent, high-yield generating vaults secured by institutional-grade security. Deposit your assets and earn yield across Solana.",
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
            <Header />
            <PageIllustration />
            {children}
            <Footer />
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
