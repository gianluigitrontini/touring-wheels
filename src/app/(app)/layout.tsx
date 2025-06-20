import { AppHeader } from "@/components/layout/app-header"; // Import AppHeader
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { LogOut, MountainSnow } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Touring Wheels App",
  description: "Manage your bicycle tours",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="items-center">
          <Link href="/dashboard" className="flex items-center gap-2 mb-6 mt-6">
            <MountainSnow className="h-8 w-8 text-sidebar-primary" />
            <span className="text-2xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden font-headline">
              Touring Wheels
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <Suspense>
            <SidebarNav />
          </Suspense>
        </SidebarContent>
        <SidebarFooter className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center"
          >
            <LogOut className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
