"use client";

import { cn } from "@/lib/utils";
import { Home, PiggyBank, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    path: "/dashboard",
    label: "Home",
    icon: Home,
  },
  {
    path: "/income",
    label: "Pemasukan",
    icon: PiggyBank,
  },
  {
    path: "/expense",
    label: "Pengeluaran",
    icon: Receipt,
  },
  {
    path: "/debt-credit",
    label: "Hutang/Piutang",
    icon: Wallet,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex max-w-md justify-between px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center px-2 py-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
