"use client";

import { LogOut } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import PWAInstallButton from "./pwa-install-button";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

export default function Header() {
  const { logout, user } = useAuth();
  console.log("USER : ", user);
  useEffect(() => {
    if (!user) return;
  }, [user]);

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-semibold">KeuanganKu</h1>
        <div className="flex items-center space-x-2">
          <PWAInstallButton />
          <ThemeToggle />
          {user && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Konfirmasi Keluar</DrawerTitle>
                  <DrawerDescription>
                    Apakah Anda yakin ingin keluar dari aplikasi?
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="flex-row justify-end space-x-2">
                  <DrawerClose asChild>
                    <Button variant="outline">Batal</Button>
                  </DrawerClose>
                  <Button onClick={logout}>Keluar</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </header>
  );
}
