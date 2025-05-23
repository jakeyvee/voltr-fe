import Hero from "@/components/hero-home";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-15.5rem)]">
      <Hero />
      <div className="max-w-3xl mx-auto grid md:grid-cols-2 grid-cols-1 gap-3 px-6 md:px-0">
        <div className="group">
          <div className="border bg-gray-900 rounded-xl xl:w-full border-gray-700 group-hover:border-indigo-500">
            <div className="h-[86px] bg-indigo-800/40 rounded-tl-xl rounded-tr-xl overflow-hidden relative">
              <div className="absolute right-[-96px] top-[-12px]">
                <svg
                  width="276"
                  height="137"
                  viewBox="0 0 210 364"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="122"
                    cy="122"
                    r="122"
                    fill="url(#paint0_radial_8_15)"
                  />
                  <circle
                    cx="122"
                    cy="122"
                    r="80.013"
                    fill="url(#paint1_radial_8_15)"
                  />
                  <circle
                    cx="121.604"
                    cy="122.396"
                    r="47.1364"
                    fill="url(#paint2_radial_8_15)"
                  />
                  <defs>
                    <radialGradient
                      id="paint0_radial_8_15"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(122 122) rotate(90) scale(122)"
                    >
                      <stop stop-color="#4338CA" stop-opacity="0" />
                      <stop
                        offset="0.489583"
                        stop-color="#4338CA"
                        stop-opacity="0"
                      />
                      <stop
                        offset="1"
                        stop-color="#4338CA"
                        stop-opacity="0.8"
                      />
                    </radialGradient>
                    <radialGradient
                      id="paint1_radial_8_15"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(122 122) rotate(90) scale(80.013)"
                    >
                      <stop stop-color="#4338CA" stop-opacity="0" />
                      <stop
                        offset="0.489583"
                        stop-color="#4338CA"
                        stop-opacity="0"
                      />
                      <stop
                        offset="1"
                        stop-color="#4338CA"
                        stop-opacity="0.8"
                      />
                    </radialGradient>
                    <radialGradient
                      id="paint2_radial_8_15"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(121.604 122.396) rotate(90) scale(47.1364)"
                    >
                      <stop stop-color="#4338CA" stop-opacity="0" />
                      <stop
                        offset="0.489583"
                        stop-color="#4338CA"
                        stop-opacity="0"
                      />
                      <stop
                        offset="1"
                        stop-color="#4338CA"
                        stop-opacity="0.8"
                      />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
              <div className="bg-indigo-700 inline-flex rounded-[26px] h-[28px] px-[6px] items-center ml-[13px] mt-[11px]">
                <span className="font-ataero text-sm mx-1 leading-[7px]">
                  For Users
                </span>
              </div>
            </div>

            <div className="py-[18px] px-[22px] border-b border-gray-700">
              <div className="flex justify-between items-center mb-5">
                <div className="relative flex items-center"></div>
                <div className="relative flex items-center"></div>
                <div className="flex flex-col items-end">
                  <div className="relative inline-block">
                    <div className="mb-2 flex">
                      <p
                        className="tooltip-label-dashed relative inline-block font-normal text-gray-500 text-xs leading-[1]"
                        style={
                          {
                            "--tooltip-underline-color": "#5A5E60",
                          } as React.CSSProperties
                        }
                      >
                        Earn yield up to
                      </p>
                    </div>
                  </div>
                  <span className="text-[28px] leading-[28px] font-semibold text-clip text-transparent bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text">
                    20% <span className="text-xs -ml-1">APY</span>
                  </span>
                </div>
              </div>
              <p className="text-[20px] font-medium leading-[14px] mb-1">
                Curated Strategies
              </p>
              <div className="relative inline-block">
                <p
                  className="tooltip-label-dashed relative inline-block font-normal text-gray-500 text-xs leading-[1]"
                  style={
                    {
                      "--tooltip-underline-color": "#5A5E60",
                    } as React.CSSProperties
                  }
                >
                  Money Market, Basis Tade, Funding Rate, etc.
                </p>
              </div>
            </div>

            <div className="py-4 px-[22px]">
              <Link
                target="_blank"
                href="https://tally.so/r/mVyajN"
                className="btn w-full bg-gradient-to-t from-indigo-600 to-indigo-500 text-white shadow-inner hover:bg-gradient-to-b"
              >
                Get private beta access <ArrowUpRightIcon className="w-2.5 h-2.5 ml-1 stroke-white stroke-2" />
              </Link>
            </div>
          </div>
        </div>
        <div className="group">
          <div className="border bg-gray-900 rounded-xl xl:w-full border-gray-700 group-hover:border-blue-500">
            <div className="h-[86px] bg-blue-800/40 rounded-tl-xl rounded-tr-xl overflow-hidden relative">
              <div className="absolute right-[-36px] top-[-32px]">
                <svg
                  width="252"
                  height="125"
                  viewBox="0 0 210 364"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter="url(#filter0_f_7_2)">
                    <path
                      d="M146.5 154L155.116 180.738H183L160.442 197.262L169.058 224L146.5 207.475L123.942 224L132.558 197.262L110 180.738H137.884L146.5 154Z"
                      fill="#1D4ED8"
                    />
                  </g>
                  <g filter="url(#filter1_i_7_2)">
                    <path
                      d="M405.486 179.754L307.066 75.3248L168.096 108.847L256.899 209.923L405.486 179.754Z"
                      fill="url(#paint0_linear_7_2)"
                      fill-opacity="0.45"
                    />
                  </g>
                  <g filter="url(#filter2_ii_7_2)">
                    <path
                      d="M359.278 317.474L406.268 179.611L257.682 209.781L214 341.247L359.278 317.474Z"
                      fill="url(#paint1_linear_7_2)"
                      fill-opacity="0.7"
                    />
                  </g>
                  <g filter="url(#filter3_ii_7_2)">
                    <path
                      d="M124.371 243.534L168.097 108.847L256.9 209.923L213.218 341.389L124.371 243.534Z"
                      fill="url(#paint2_linear_7_2)"
                      fill-opacity="0.25"
                    />
                  </g>
                  <g filter="url(#filter4_f_7_2)">
                    <path
                      d="M257.549 209.873L168.439 108.994L307.148 75.3682L405.505 179.61L257.549 209.873ZM257.549 209.873L212.994 341.016"
                      stroke="#1D4ED8"
                      stroke-width="1.68131"
                    />
                  </g>
                  <g filter="url(#filter5_f_7_2)">
                    <path
                      d="M167.5 72L176.589 99.8835H206L182.206 117.116L191.294 145L167.5 127.767L143.706 145L152.794 117.116L129 99.8835H158.411L167.5 72Z"
                      fill="#1D4ED8"
                    />
                  </g>
                  <g filter="url(#filter6_f_7_2)">
                    <path
                      d="M318 119L326.735 145.738H355L332.133 162.262L340.867 189L318 172.475L295.133 189L303.867 162.262L281 145.738H309.265L318 119Z"
                      fill="#1D4ED8"
                    />
                  </g>
                  <defs>
                    <filter
                      id="filter0_f_7_2"
                      x="0.714661"
                      y="44.7147"
                      width="291.571"
                      height="288.571"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feGaussianBlur
                        stdDeviation="54.6427"
                        result="effect1_foregroundBlur_7_2"
                      />
                    </filter>
                    <filter
                      id="filter1_i_7_2"
                      x="168.096"
                      y="75.3247"
                      width="237.389"
                      height="166.806"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="32.2083" />
                      <feGaussianBlur stdDeviation="41.8708" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.113725 0 0 0 0 0.305882 0 0 0 0 0.847059 0 0 0 0.28 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_7_2"
                      />
                    </filter>
                    <filter
                      id="filter2_ii_7_2"
                      x="205.594"
                      y="179.611"
                      width="204.037"
                      height="168.361"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dx="-8.40656" />
                      <feGaussianBlur stdDeviation="16.8131" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.117647 0 0 0 0 0.25098 0 0 0 0 0.686275 0 0 0 0.25 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_7_2"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dx="3.36263" dy="6.72525" />
                      <feGaussianBlur stdDeviation="26.901" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.113725 0 0 0 0 0.305882 0 0 0 0 0.847059 0 0 0 0.25 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="effect1_innerShadow_7_2"
                        result="effect2_innerShadow_7_2"
                      />
                    </filter>
                    <filter
                      id="filter3_ii_7_2"
                      x="117.646"
                      y="95.3967"
                      width="140.935"
                      height="258.875"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dx="1.68131" dy="12.8833" />
                      <feGaussianBlur stdDeviation="20.1758" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.113725 0 0 0 0 0.305882 0 0 0 0 0.847059 0 0 0 0.25 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_7_2"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dx="-6.72525" dy="-13.4505" />
                      <feGaussianBlur stdDeviation="20.1758" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.113725 0 0 0 0 0.305882 0 0 0 0 0.847059 0 0 0 0.25 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="effect1_innerShadow_7_2"
                        result="effect2_innerShadow_7_2"
                      />
                    </filter>
                    <filter
                      id="filter4_f_7_2"
                      x="145.029"
                      y="52.579"
                      width="283.98"
                      height="310.564"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feGaussianBlur
                        stdDeviation="10.9285"
                        result="effect1_foregroundBlur_7_2"
                      />
                    </filter>
                    <filter
                      id="filter5_f_7_2"
                      x="57"
                      y="0"
                      width="221"
                      height="217"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feGaussianBlur
                        stdDeviation="36"
                        result="effect1_foregroundBlur_7_2"
                      />
                    </filter>
                    <filter
                      id="filter6_f_7_2"
                      x="217"
                      y="55"
                      width="202"
                      height="198"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feGaussianBlur
                        stdDeviation="32"
                        result="effect1_foregroundBlur_7_2"
                      />
                    </filter>
                    <linearGradient
                      id="paint0_linear_7_2"
                      x1="342.005"
                      y1="111.237"
                      x2="218.607"
                      y2="183.628"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#1D4ED8" stop-opacity="0.64" />
                      <stop offset="1" stop-color="#1D4ED8" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_7_2"
                      x1="389.856"
                      y1="201.934"
                      x2="217.176"
                      y2="344.512"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#1D4ED8" />
                      <stop
                        offset="1"
                        stop-color="#1D4ED8"
                        stop-opacity="0.15"
                      />
                    </linearGradient>
                    <linearGradient
                      id="paint2_linear_7_2"
                      x1="240.886"
                      y1="203.26"
                      x2="55.2798"
                      y2="348.882"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#1D4ED8" />
                      <stop
                        offset="1"
                        stop-color="#1D4ED8"
                        stop-opacity="0.15"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="bg-blue-700 inline-flex rounded-[26px] h-[28px] px-[6px] items-center ml-[13px] mt-[11px]">
                <span className="font-ataero text-sm mx-1 leading-[7px]">
                  For Vault Managers
                </span>
              </div>
            </div>

            <div className="py-[18px] px-[22px] border-b border-gray-700">
              <div className="flex justify-between items-center mb-5">
                <div className="relative flex items-center"></div>
                <div className="flex flex-col items-end">
                  <div className="relative inline-block">
                    <div className="mb-2 flex">
                      <p
                        className="tooltip-label-dashed relative inline-block font-normal text-gray-500 text-xs leading-[1]"
                        style={
                          {
                            "--tooltip-underline-color": "#5A5E60",
                          } as React.CSSProperties
                        }
                      >
                        Instantly integrate with
                      </p>
                    </div>
                  </div>
                  <span className="text-[28px] leading-[28px] font-semibold text-clip text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">
                    10+ <span className="text-xs -ml-1">Protocols</span>
                  </span>
                </div>
              </div>
              <p className="text-[20px] font-medium leading-[14px] mb-1">
                Supported Protocols
              </p>
              <div className="relative inline-block">
                <p
                  className="tooltip-label-dashed relative inline-block font-normal text-gray-500 text-xs leading-[1]"
                  style={
                    {
                      "--tooltip-underline-color": "#5A5E60",
                    } as React.CSSProperties
                  }
                >
                  Drift, Raydium, Kamino, MarginFi, etc.
                </p>
              </div>
            </div>

            <div className="py-4 px-[22px]">
              <Link
                target="_blank"
                href="https://docs.voltr.xyz"
                className="btn w-full bg-gradient-to-t from-blue-600 to-blue-500 text-white shadow-inner hover:bg-gradient-to-b"
              >
                Launch a vault <ArrowUpRightIcon className="w-2.5 h-2.5 ml-1 stroke-white stroke-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
