import Logo from "./logo";
import Image from "next/image";
import FooterIllustration from "@/../public/images/footer-illustration.svg";

export default function Footer() {
  return (
    <footer>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
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
        <div className="justify-between gap-12 py-8 ">
          {/* 5th block */}
          <div className="lg:text-right">
            <div className="mb-3">
              <Logo />
            </div>
            <div className="text-sm">
              <ul className="inline-flex gap-1">
                <li>
                  <a
                    className="flex items-center justify-center text-indigo-500 transition hover:text-indigo-400"
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
                    className="flex items-center justify-center text-indigo-500 transition hover:text-indigo-400 mt-1"
                    href="https://docs.voltr.xyz/"
                    aria-label="Docs"
                  >
                    <svg
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 18 18"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3 3.75V14.25C3 15.4926 4.00736 16.5 5.25 16.5H12.75C13.9926 16.5 15 15.4926 15 14.25V6.75C15 5.50736 13.9926 4.5 12.75 4.5H3.75C3.33579 4.5 3 4.16421 3 3.75ZM5.4375 9C5.4375 8.68934 5.68934 8.4375 6 8.4375H12C12.3107 8.4375 12.5625 8.68934 12.5625 9C12.5625 9.31066 12.3107 9.5625 12 9.5625H6C5.68934 9.5625 5.4375 9.31066 5.4375 9ZM5.4375 11.625C5.4375 11.3143 5.68934 11.0625 6 11.0625H10.125C10.4357 11.0625 10.6875 11.3143 10.6875 11.625C10.6875 11.9357 10.4357 12.1875 10.125 12.1875H6C5.68934 12.1875 5.4375 11.9357 5.4375 11.625Z"
                        fill="current"
                      ></path>
                      <path
                        d="M3.30659 3.06532C3.56795 3.18254 3.75 3.44501 3.75 3.75H12.75C13.009 3.75 13.2603 3.78281 13.5 3.84451V3.22953C13.5 2.31671 12.6915 1.61551 11.7879 1.74461L3.6897 2.90149C3.54534 2.92211 3.41453 2.98031 3.30659 3.06532Z"
                        fill="current"
                      ></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    className="flex items-center justify-center text-indigo-500 transition hover:text-indigo-400 -mt-0.5"
                    href="https://github.com/jakeyvee/voltr-monorepo"
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
          </div>
        </div>
      </div>
    </footer>
  );
}
