"use client";

import Image from "next/image";
import { dark } from "@clerk/themes";
import { PricingTable } from "@clerk/nextjs";
import { useTheme as useCurrentTheme } from "next-themes";

export default function Page() {
    const currentTheme = useCurrentTheme();
    const { theme } = currentTheme;
  return (
    <div className="flex items-center justify-center w-full px-4 py-8">
        <div className="max-w-5xl w-full">
            <section className="space-y-9 flex flex-col items-center">
                <div className="flex flex-col items-center">
                    <Image src="/LogicKLogo.svg" width={60} height={60} alt="Logo" className="hidden md:block invert dark:invert-0" />
                </div>

                <h1 className="text-xl md:text-3xl font-bold text-center">Pricing</h1>
                <p className="text-muted-foreground">
                    Choose the plan that fits your needs
                </p>
                {process.env.NEXT_PUBLIC_ENABLE_BILLING === "true" ? (
                  <PricingTable
                    appearance={{
                      baseTheme: theme === "dark" ? dark : undefined,
                      elements: {
                        pricingTableCard: "border !shadow-none rounded-lg",
                      },
                    }}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    Billing is not enabled. Enable billing in Clerk Dashboard to view pricing plans.
                  </div>
                )}
            </section>
        </div>
    </div>
  )
}