"use client";

import { useLanguage } from "./language-provider";
import { codeLabel } from "@/lib/locale";

export function AuditCode({ value }: { value: string | null | undefined }) {
  const { language } = useLanguage();
  if (!value) return <>—</>;
  return <span className="audit-code" title={value}><span>{codeLabel(value, language)}</span><small className="mono">{value}</small></span>;
}
