"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MountainSnow } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  const { isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-[100] flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile && (
        <div className="w-full grid grid-cols-[48px,1fr,48px]">
          <SidebarTrigger />

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-center justify-self-center"
          >
            <MountainSnow className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-primary font-headline">
              Touring Wheels
            </span>
          </Link>
          <div></div>
        </div>
      )}
      {/* 
      <div className="ml-auto flex items-center gap-2">
       Extra navigation here
      </div> */}
    </header>
  );
}
