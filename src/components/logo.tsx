"use client";

import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.svg"
      alt="INTI logo"
      width={120}
      height={120}
      priority
      className="mb-8"
    />
  );
}
