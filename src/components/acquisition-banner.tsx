"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function AcquisitionBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative bg-phantom">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 justify-center md:justify-start">
                        <h3 className="text-sm md:text-base text-white font-medium text-center md:text-left">
                            We&apos;ve officially merged Voltr into Ranger,
                            learn about {" "}
                            <Link
                                href="https://x.com/ranger_finance/status/1987897253043036255"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-ranger-100 transition-colors font-semibold"
                            >the acquisition
                            </Link>
                            .
                        </h3>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Dismiss banner"
                    >
                        <XMarkIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}