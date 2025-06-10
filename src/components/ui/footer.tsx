import Logo from "./logo";
import Image from "next/image";
import FooterIllustration from "@/../public/images/footer-illustration.svg";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        {/* Footer illustration */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -translate-x-1/2"
          aria-hidden="true"
        >
          <Image
            className="max-w-none"
            src={FooterIllustration}
            width={1076}
            height={378}
            alt="Footer illustration"
          />
        </div>
        <div className="flex justify-between gap-12 py-8 ">
          {/* 5th block */}
          <div className="lg:text-left">
            <div className="mb-3">
              <Logo />
            </div>
            <ul className="inline-flex gap-1">
              <li>
                <a
                  className="flex items-center justify-center text-gray-400 transition hover:text-gray-300 bg-gray-800 rounded-full"
                  href="https://x.com/voltrxyz"
                  aria-label="Twitter"
                >
                  <svg
                    className="h-8 w-8 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="flex items-center justify-center text-gray-400 transition hover:text-gray-300 bg-gray-800 rounded-full"
                  href="https://github.com/voltrxyz"
                  aria-label="Github"
                >
                  <svg
                    className="h-8 w-8 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
          <div className="mt-auto">
            <ul className="inline-flex gap-3">
              <li className="flex items-center gap-1 text-gray-400">
                <a
                  className="flex items-center justify-center transition hover:text-gray-300 gap-1"
                  href="https://docs.voltr.xyz/"
                  aria-label="Docs"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  <span className="text-sm underline">Docs</span>
                  <ArrowUpRightIcon className="w-2.5 h-2.5 stroke-current stroke-2" />
                </a>
              </li>
              <li className="flex items-center gap-1 text-gray-400">
                <Link
                  className="flex items-center justify-center transition hover:text-gray-300 gap-1"
                  href="/terms"
                  aria-label="Docs"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span className="text-sm underline">Terms</span>
                  <ArrowUpRightIcon className="w-2.5 h-2.5 stroke-current stroke-2" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
