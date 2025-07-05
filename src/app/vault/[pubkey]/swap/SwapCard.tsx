import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, MenuButton, TabGroup, TabList, Tab } from "@headlessui/react";
import { UnifiedWalletButton } from "@jup-ag/wallet-adapter";
import {
  WalletIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { formatNumber, formatTime } from "@/lib/format";

interface TokenInputProps {
  symbol: string;
  logoURI: string;
  amount: string;
  setAmount: (value: string) => void;
  disabled?: boolean;
}

const TokenInput: React.FC<TokenInputProps> = ({
  symbol,
  logoURI,
  amount,
  setAmount,
  disabled = false,
}) => {
  return (
    <div className="flex w-full gap-2">
      <Menu as="div" className="relative inline-flex w-1/2">
        <MenuButton
          className="btn w-full !justify-between min-w-[11rem] text-gray-300 bg-gray-800 border-white/15 hover:border-white/30 hover:text-gray-100"
          aria-label="Select option"
          disabled
        >
          <span className="flex items-center">
            <div className="flex items-center gap-4">
              <Image
                width={16}
                height={16}
                alt="Coin image"
                src={logoURI}
                className="w-4 h-4 rounded-full"
              />
              <span>{symbol}</span>
            </div>
          </span>
        </MenuButton>
      </Menu>
      <span className="flex-1 text-right">
        <div className="flex h-full flex-col text-right">
          <input
            inputMode="decimal"
            autoComplete="off"
            data-lpignore="true"
            placeholder="0.00"
            className="h-full w-full bg-transparent text-right disabled:cursor-not-allowed disabled:text-gray-500 text-white text-xl outline-none font-semibold"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled}
          />
        </div>
      </span>
    </div>
  );
};

export interface RequestWithdrawal {
  amountAtPresent: number;
  withdrawableFromTs: number;
}

interface SwapCardProps {
  userAssetWalletAmount: number;
  userAssetAmount: number;
  assetDecimals: number;
  withdrawalWaitingPeriod: number;
  userWithdrawRequest: RequestWithdrawal | null;
  selectedTab: "deposit" | "withdraw";
  setSelectedTab: (tab: "deposit" | "withdraw") => void;
  inputSymbol: string;
  inputLogoURI: string;
  inputAmount: string;
  setInputAmount: (value: string) => void;
  isButtonLoading: boolean;
  handleButtonClick: () => void;
  wallet: any; // Replace with proper wallet type from @jup-ag/wallet-adapter
  supportsDirectWithdrawal: boolean;
}

const SwapCard: React.FC<SwapCardProps> = ({
  userAssetWalletAmount,
  userAssetAmount,
  assetDecimals,
  withdrawalWaitingPeriod,
  userWithdrawRequest,
  selectedTab,
  setSelectedTab,
  inputSymbol,
  inputLogoURI,
  inputAmount,
  setInputAmount,
  isButtonLoading,
  handleButtonClick,
  wallet,
  supportsDirectWithdrawal,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Update countdown timer every second
  useEffect(() => {
    if (!userWithdrawRequest) return;

    const updateTimer = () => {
      const withdrawTime = userWithdrawRequest.withdrawableFromTs * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeLeft = Math.max(0, withdrawTime - now);
      const timeLeftSeconds = Math.ceil(timeLeft / 1000);
      setTimeRemaining(formatTime(timeLeftSeconds));
    };

    // Update immediately
    updateTimer();

    // Set up interval for updates
    const intervalId = setInterval(updateTimer, 1000);

    // Clean up interval
    return () => clearInterval(intervalId);
  }, [userWithdrawRequest]);

  return (
    <div className="bg-gray-900 rounded-xl shadow-sm">
      <div className="grow py-3 px-5 space-y-2 border-b border-slate-700/60">
        <h2 className="text-sm font-medium text-gray-500">Your Deposits</h2>
        <div className="text-lg font-bold">
          <span></span>
          {userAssetAmount / Math.pow(10, assetDecimals) > 1
            ? `≈ ${(userAssetAmount / Math.pow(10, assetDecimals)).toFixed(
                2
              )} ${inputSymbol}`
            : `≈ ${(userAssetAmount / Math.pow(10, assetDecimals)).toPrecision(
                3
              )} ${inputSymbol}`}
        </div>
      </div>
      <div className="p-5 space-y-4">
        <TabGroup
          onChange={(index) =>
            setSelectedTab(index === 0 ? "deposit" : "withdraw")
          }
        >
          <TabList className="flex rounded-lg bg-indigo-700/20 font-bold">
            <Tab
              className={`w-full rounded-lg py-2 text-sm leading-5 transition-all focus:outline-none ${
                selectedTab === "deposit"
                  ? "text-indigo-800 bg-white shadow"
                  : "text-indigo-100 hover:bg-white/[0.12] hover:text-white"
              }`}
            >
              Deposit
            </Tab>
            <Tab
              className={`w-full rounded-lg py-2 text-sm leading-5 transition-all focus:outline-none ${
                selectedTab === "withdraw"
                  ? "text-indigo-800 bg-white shadow"
                  : "text-indigo-100 hover:bg-white/[0.12] hover:text-white"
              }`}
            >
              Withdraw
            </Tab>
          </TabList>
        </TabGroup>

        {selectedTab === "withdraw" && userWithdrawRequest ? (
          // Withdraw Request Active View
          <div className="space-y-4">
            <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
              <div className="flex items-start gap-3">
                {timeRemaining === "0s" ? (
                  <CheckCircleIcon className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <ClockIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="space-y-2 w-full">
                  {timeRemaining === "0s" ? (
                    <h3 className="font-medium text-teal-200">
                      Withdrawal Ready
                    </h3>
                  ) : (
                    <h3 className="font-medium text-yellow-200">
                      Withdrawal Pending
                    </h3>
                  )}
                  <div className="space-y-0.5">
                    <div className="text-sm text-indigo-300 flex justify-between">
                      <div>Amount: </div>
                      <div>
                        {formatNumber(
                          userWithdrawRequest.amountAtPresent /
                            Math.pow(10, assetDecimals)
                        )}
                        {inputSymbol}
                      </div>
                    </div>
                    <div className="text-sm text-indigo-300 flex justify-between">
                      <div>Available in: </div>
                      <div>{timeRemaining}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleButtonClick}
              disabled={isButtonLoading}
              className={`btn w-full bg-gradient-to-t text-white shadow-inner hover:bg-gradient-to-b ${
                timeRemaining === "0s"
                  ? "from-indigo-600 to-indigo-500"
                  : "from-red-700 to-red-600 "
              }`}
            >
              {isButtonLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </div>
              ) : timeRemaining === "0s" ? (
                "Withdraw"
              ) : (
                "Cancel Withdrawal Request"
              )}
            </button>
          </div>
        ) : (
          // Regular Deposit/Withdraw View
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs md:text-sm font-medium flex justify-between">
                <div>
                  {selectedTab === "deposit" ? "You deposit" : "You withdraw"}
                </div>
                {selectedTab === "withdraw" ? (
                  <div
                    className="text-gray-500 hover:cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      setInputAmount(
                        (
                          userAssetAmount / Math.pow(10, assetDecimals)
                        ).toString()
                      );
                    }}
                  >
                    <WalletIcon className="w-5 h-5" />{" "}
                    {userAssetAmount / Math.pow(10, assetDecimals)}
                  </div>
                ) : (
                  <div
                    className="text-gray-500 hover:cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      setInputAmount(
                        (
                          userAssetWalletAmount / Math.pow(10, assetDecimals)
                        ).toString()
                      );
                    }}
                  >
                    <WalletIcon className="w-5 h-5" />{" "}
                    {userAssetWalletAmount / Math.pow(10, assetDecimals)}
                  </div>
                )}
              </label>
              <TokenInput
                symbol={inputSymbol}
                logoURI={inputLogoURI}
                amount={inputAmount}
                setAmount={setInputAmount}
              />
            </div>

            {selectedTab === "withdraw" && !supportsDirectWithdrawal && (
              <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 w-full">
                    <h3 className="font-medium text-indigo-200">
                      Withdrawal Information
                    </h3>
                    <div className="space-y-0.5">
                      <div className="text-sm text-indigo-300 flex justify-between">
                        <div>Waiting period: </div>
                        <div>{formatTime(withdrawalWaitingPeriod)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full max-w-md">
              {wallet && wallet.connected ? (
                <button
                  onClick={handleButtonClick}
                  disabled={isButtonLoading}
                  className="btn w-full bg-gradient-to-t from-indigo-600 to-indigo-500 text-white shadow-inner hover:bg-gradient-to-b"
                >
                  {isButtonLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </div>
                  ) : selectedTab === "deposit" ? (
                    "Deposit"
                  ) : supportsDirectWithdrawal ? (
                    "Instant Withdraw"
                  ) : (
                    "Request Withdraw"
                  )}
                </button>
              ) : (
                <UnifiedWalletButton
                  buttonClassName="btn !w-full !bg-gradient-to-t !from-indigo-600 !to-indigo-500 !bg-[length:100%_100%] !bg-[bottom] !text-white !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
                  currentUserClassName="btn !w-full !bg-gradient-to-t !from-indigo-600 !to-indigo-500 !bg-[length:100%_100%] !bg-[bottom] !text-white !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapCard;
