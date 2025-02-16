import Link from "next/link";
import Image from "next/image";
import logo from "@/../public/images/logo.svg";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="Voltr">
      <Image src={logo} alt="Voltr Logo" width={48} height={48} />
    </Link>
  );
}
