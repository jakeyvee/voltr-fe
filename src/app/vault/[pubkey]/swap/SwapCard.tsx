import React from "react";
import Image from "next/image";
import { Menu, MenuButton, TabGroup, TabList, Tab } from "@headlessui/react";
import { UnifiedWalletButton } from "@jup-ag/wallet-adapter";

interface TokenInputProps {
  token: {
    symbol: string;
    logoURI: string;
  };
  amount: string;
  setAmount: (value: string) => void;
  isInput: boolean;
}

const TokenInput: React.FC<TokenInputProps> = ({
  token,
  amount,
  setAmount,
  isInput,
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
                src={token.logoURI}
                className="w-4 h-4 rounded-full"
              />
              <span>{token.symbol}</span>
            </div>
          </span>
        </MenuButton>
      </Menu>
      <span className="flex-1 text-right">
        <div className="flex h-full flex-col text-right">
          <input
            inputMode="decimal"
            autoComplete="off"
            name={isInput ? "fromValue" : "toValue"}
            data-lpignore="true"
            placeholder="0.00"
            className="h-full w-full bg-transparent text-right disabled:cursor-not-allowed disabled:text-black dark:text-white text-xl outline-none font-semibold"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            readOnly={!isInput}
          />
        </div>
      </span>
    </div>
  );
};

interface SwapCardProps {
  selectedTab: "deposit" | "redeem";
  setSelectedTab: (tab: "deposit" | "redeem") => void;
  inputToken: {
    symbol: string;
    logoURI: string;
  };
  outputToken: {
    symbol: string;
    logoURI: string;
  };
  inputAmount: string;
  setInputAmount: (value: string) => void;
  outputAmount: string;
  isButtonLoading: boolean;
  handleButtonClick: () => void;
  wallet: any; // Replace with proper wallet type from @jup-ag/wallet-adapter
}

const SwapCard: React.FC<SwapCardProps> = ({
  selectedTab,
  setSelectedTab,
  inputToken,
  outputToken,
  inputAmount,
  setInputAmount,
  outputAmount,
  isButtonLoading,
  handleButtonClick,
  wallet,
}) => {
  return (
    <>
      <div className="bg-gray-900 rounded-2xl p-4 shadow-lg w-full max-w-md mb-4">
        <TabGroup
          onChange={(index) =>
            setSelectedTab(index === 0 ? "deposit" : "redeem")
          }
        >
          <TabList className="flex rounded-full bg-indigo-700/20 p-1 font-bold">
            <Tab
              className={`w-full rounded-full py-2 text-sm leading-5 transition-all ${
                selectedTab === "deposit"
                  ? "text-indigo-800 bg-white shadow"
                  : "text-indigo-100 hover:bg-white/[0.12] hover:text-white"
              }`}
            >
              Deposit
            </Tab>
            <Tab
              className={`w-full rounded-full py-2 text-sm leading-5 transition-all ${
                selectedTab === "redeem"
                  ? "text-indigo-800 bg-white shadow"
                  : "text-indigo-100 hover:bg-white/[0.12] hover:text-white"
              }`}
            >
              Redeem
            </Tab>
          </TabList>
        </TabGroup>

        <div className="mt-4">
          <label className="text-xs md:text-sm font-medium">
            {selectedTab === "deposit" ? "You deposit" : "You redeem"}
          </label>
          <TokenInput
            token={inputToken}
            amount={inputAmount}
            setAmount={setInputAmount}
            isInput={true}
          />
        </div>

        <div className="relative flex justify-center my-2">
          <hr className="absolute w-full border-gray-800/50 top-1/2 transform -translate-y-1/2" />
          <button
            type="button"
            className="group bg-gray-800 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border-[3px] border-[rgba(25,35,45,0.75)] text-white hover:border-gray-700 hover:shadow-lg"
            onClick={() =>
              setSelectedTab(selectedTab === "deposit" ? "redeem" : "deposit")
            }
          >
            <svg
              width="21"
              height="22"
              viewBox="0 0 21 22"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.51043 7.47998V14.99H7.77043V7.47998L9.66043 9.36998L10.5505 8.47994L7.5859 5.51453C7.3398 5.26925 6.94114 5.26925 6.69504 5.51453L3.73047 8.47994L4.62051 9.36998L6.51043 7.47998Z"
                fill="currentColor"
              />
              <path
                d="M14.4902 14.52V7.01001H13.2302V14.52L11.3402 12.63L10.4502 13.5201L13.4148 16.4855C13.6609 16.7308 14.0595 16.7308 14.3056 16.4855L17.2702 13.5201L16.3802 12.63L14.4902 14.52Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div>
          <label className="text-xs md:text-sm font-medium">You receive</label>
          <TokenInput
            token={outputToken}
            amount={outputAmount}
            setAmount={() => {}}
            isInput={false}
          />
        </div>
      </div>

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
            ) : (
              "Redeem"
            )}
          </button>
        ) : (
          <UnifiedWalletButton
            buttonClassName="btn !w-full !bg-gradient-to-t !from-indigo-600 !to-indigo-500 !bg-[length:100%_100%] !bg-[bottom] !text-white !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
            currentUserClassName="btn !w-full !bg-gradient-to-t !from-indigo-600 !to-indigo-500 !bg-[length:100%_100%] !bg-[bottom] !text-white !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
          />
        )}
      </div>
    </>
  );
};

export default SwapCard;
