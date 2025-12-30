"use client";

import "@/lib/i18n"; // Takes care of init
import { ReactNode } from "react";

export default function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}