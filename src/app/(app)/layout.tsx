import type { Metadata } from "next";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { MountainSnow, LogOut } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Touring Wheels App",
  description: "Manage your bicycle tours",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true} collapsible="icon">
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <MountainSnow className="h-8 w-8 text-sidebar-primary" />
            <span className="text-2xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden font-headline">
              Touring Wheels
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto">
           {/* Placeholder for logout or other footer actions */}
           {/* 
            <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
             <LogOut className="h-5 w-5" />
             <span className="group-data-[collapsible=icon]:hidden">Logout</span>
           </Button> 
           */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
