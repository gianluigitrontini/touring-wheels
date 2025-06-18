"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Map,
  ListChecks,
  Settings,
  Bike as BikeIcon,
} from "lucide-react"; // Renamed Bike to BikeIcon to avoid conflict
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: number; // How many path segments to match for active state
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, matchSegments: 1 },
  { href: "/trips", label: "My Trips", icon: Map, matchSegments: 1 }, // Changed Icon for Trips for clarity
  { href: "/gear", label: "Gear Library", icon: ListChecks, matchSegments: 1 },
  { href: "/bikes", label: "My Bikes", icon: BikeIcon, matchSegments: 1 },
  // Add more items as needed, e.g., Settings
  // { href: "/settings", label: "Settings", icon: Settings, matchSegments: 1 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = item.matchSegments
          ? pathname.startsWith(item.href) &&
            pathname.split("/").length >= item.href.split("/").length
          : pathname === item.href;

        return (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href}>
              <SidebarMenuButton
                size={"lg"}
                className={cn(
                  "font-medium",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                isActive={isActive}
                tooltip={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-headline">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
