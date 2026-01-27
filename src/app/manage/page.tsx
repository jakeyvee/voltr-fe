"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    RocketLaunchIcon,
    MagnifyingGlassIcon,
    PlusCircleIcon,
    ArrowRightIcon,
    SparklesIcon,
    CogIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

export default function ManagePage() {
    const router = useRouter();
    const [vaultPubkey, setVaultPubkey] = useState("");

    const handleManageVault = () => {
        if (vaultPubkey.trim()) {
            router.push(`/manage/${vaultPubkey.trim()}`);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && vaultPubkey.trim()) {
            handleManageVault();
        }
    };

    return (
        <div className="min-h-[calc(100vh-15.5rem)]">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ranger-500/10 border border-ranger-500/20 mb-6">
                        <ShieldCheckIcon className="w-4 h-4 text-ranger-400" />
                        <span className="text-sm text-ranger-300 font-medium">
                            Management Portal
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                        Vault Operations
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Configure existing vaults or launch new institutional-grade yield
                        strategies
                    </p>
                </div>

                {/* Quick Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-bgBlack/50 border border-white/5 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-ranger-400 mb-2">
                            Instant
                        </div>
                        <div className="text-sm text-gray-400">Configuration Updates</div>
                    </div>
                    <div className="bg-bgBlack/50 border border-white/5 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-ranger-400 mb-2">24/7</div>
                        <div className="text-sm text-gray-400">Real-time Monitoring</div>
                    </div>
                    <div className="bg-bgBlack/50 border border-white/5 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-ranger-400 mb-2">
                            Secure
                        </div>
                        <div className="text-sm text-gray-400">
                            Institutional-grade Infrastructure
                        </div>
                    </div>
                </div>

                {/* Main Action Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Access Existing Vault Card */}
                    <div className="group relative">
                        {/* Decorative border effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-ranger-500/20 via-ranger-400/20 to-ranger-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                        <div className="relative bg-bgBlack border border-white/5 rounded-2xl p-8 h-full flex flex-col hover:border-ranger-500/30 transition-all duration-300">
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ranger-500/20 to-ranger-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <CogIcon className="w-7 h-7 text-ranger-400" />
                            </div>

                            {/* Content */}
                            <h2 className="text-2xl font-bold text-white mb-3">
                                Manage Vault
                            </h2>
                            <p className="text-gray-400 mb-6 flex-grow">
                                Access your vaults&apos; configuration panel to update parameters,
                                manage fees, and add protocol integrations.
                            </p>

                            {/* Input */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Enter vault public key..."
                                        value={vaultPubkey}
                                        onChange={(e) => setVaultPubkey(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full pl-12 pr-4 py-3.5 bg-phantom border border-gray-700 rounded-xl text-white placeholder-gray-500 outline-none focus:border-ranger-500 transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={handleManageVault}
                                    disabled={!vaultPubkey.trim()}
                                    className="w-full group/btn py-3.5 px-6 bg-gradient-to-t from-ranger-600 to-ranger-500 rounded-xl text-white font-semibold shadow-lg hover:shadow-ranger-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <span>Access Vault</span>
                                    <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {/* Stats Hint */}
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="w-2 h-2 rounded-full bg-ranger-500 animate-pulse" />
                                    <span>Live vault monitoring & management</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Create New Vault Card */}
                    <div className="group relative">
                        {/* Decorative border effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/20 via-emerald-400/20 to-teal-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                        <div className="relative bg-bgBlack border border-white/5 rounded-2xl p-8 h-full flex flex-col hover:border-teal-500/30 transition-all duration-300">
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <RocketLaunchIcon className="w-7 h-7 text-teal-400" />
                            </div>

                            {/* Content */}
                            <h2 className="text-2xl font-bold text-white mb-3">
                                Create Vault
                            </h2>
                            <p className="text-gray-400 mb-6 flex-grow">
                                Deploy a new institutional-grade vault with custom strategies,
                                fee structures, and protocol integrations.
                            </p>

                            {/* Features List */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <SparklesIcon className="w-4 h-4 text-teal-400" />
                                    <span>Custom yield strategies</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <SparklesIcon className="w-4 h-4 text-teal-400" />
                                    <span>Configurable fee structures</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <SparklesIcon className="w-4 h-4 text-teal-400" />
                                    <span>Multi-protocol integrations</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Link
                                href="/create"
                                className="w-full group/btn py-3.5 px-6 bg-gradient-to-t from-teal-600 to-teal-500 rounded-xl text-white font-semibold shadow-lg hover:shadow-teal-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <PlusCircleIcon className="w-5 h-5" />
                                <span>Launch New Vault</span>
                            </Link>

                            {/* Stats Hint */}
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                    <span>Deploy in minutes, earn forever</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-12 p-6 bg-ranger-900/10 border border-ranger-500/20 rounded-xl">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-ranger-500/20 flex items-center justify-center flex-shrink-0">
                            <ShieldCheckIcon className="w-6 h-6 text-ranger-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Need Help Getting Started?
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Check out our documentation for detailed guides on vault
                                management, fee structures, and best practices for yield
                                strategies.
                            </p>
                            <a
                                href="https://docs.ranger.finance/ranger-earn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-ranger-400 hover:text-ranger-300 transition-colors"
                            >
                                <span className="font-medium">View Documentation</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}