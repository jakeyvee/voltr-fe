import Link from "next/link";

export default function Waitlist() {
  return (
    <div className="w-full max-w-xs mx-auto shrink-0">
      <form className="relative">
        <div
          className="absolute -inset-3 bg-indigo-500/15 dark:bg-transparent dark:bg-gradient-to-b dark:from-gray-700/80 dark:to-gray-700/70 rounded-lg -z-10 before:absolute before:inset-y-0 before:left-0 before:w-[15px] before:bg-[length:15px_15px] before:[background-position:top_center,bottom_center] before:bg-no-repeat before:[background-image:radial-gradient(circle_at_center,theme(colors.indigo.500/.56)_1.5px,transparent_1.5px),radial-gradient(circle_at_center,theme(colors.indigo.500/.56)_1.5px,transparent_1.5px)] dark:before:[background-image:radial-gradient(circle_at_center,theme(colors.gray.600)_1.5px,transparent_1.5px),radial-gradient(circle_at_center,theme(colors.gray.600)_1.5px,transparent_1.5px)] after:absolute after:inset-y-0 after:right-0 after:w-[15px] after:bg-[length:15px_15px] after:[background-position:top_center,bottom_center] after:bg-no-repeat after:[background-image:radial-gradient(circle_at_center,theme(colors.indigo.500/.56)_1.5px,transparent_1.5px),radial-gradient(circle_at_center,theme(colors.indigo.500/.56)_1.5px,transparent_1.5px)] dark:after:[background-image:radial-gradient(circle_at_center,theme(colors.gray.600)_1.5px,transparent_1.5px),radial-gradient(circle_at_center,theme(colors.gray.600)_1.5px,transparent_1.5px)]"
          aria-hidden="true"
        />
        <div className="space-y-3">
          <div>
            <Link
              className="btn-sm !bg-gradient-to-t !from-indigo-600 !to-indigo-500
        !bg-[length:100%_100%] !bg-[bottom] !py-[5px] !text-white
        !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)]
        hover:!bg-[length:100%_150%] w-full"
              href="https://tally.so/r/mYVBq5"
              target="_blank"
            >
              Join The Waitlist
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
