"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "./client";

/** next/link that keeps the visitor in their language: "/shop" → "/fr/shop". */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { href: local } = useI18n();
  return <NextLink href={typeof href === "string" ? local(href) : href} {...rest} />;
}
