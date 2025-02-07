import Link from "next/link";
import Image from "next/image";
import logo from "@/../public/images/logo-words.svg";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="Voltr">
      <Image src={logo} alt="Voltr Logo" height={24} />
    </Link>
  );
}
