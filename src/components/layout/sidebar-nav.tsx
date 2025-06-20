"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Bike as BikeIcon,
  ClipboardCheck,
  ClipboardList,
  Home,
  ListChecks,
  Map,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: number;
  isSubItem?: boolean;
  parentHref?: string; // To link sub-items to parent for active state matching
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, matchSegments: 1 },
  { href: "/trips", label: "My Trips", icon: Map, matchSegments: 1 },
  {
    href: "/trips?status=planned",
    label: "Planned",
    icon: ClipboardList,
    matchSegments: 1,
    isSubItem: true,
    parentHref: "/trips",
  },
  {
    href: "/trips?status=completed",
    label: "Completed",
    icon: ClipboardCheck,
    matchSegments: 1,
    isSubItem: true,
    parentHref: "/trips",
  },
  { href: "/gear", label: "Gear Library", icon: ListChecks, matchSegments: 1 },
  { href: "/bikes", label: "My Bikes", icon: BikeIcon, matchSegments: 1 },
  // { href: "/settings", label: "Settings", icon: Settings, matchSegments: 1 },
];

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatusFilter = searchParams.get("status");

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        // For main /trips link, active if pathname is /trips and no status or status=all
        // For /trips?status=planned, active if pathname is /trips and status=planned
        // For /trips?status=completed, active if pathname is /trips and status=completed
        let isActive = false;
        if (item.parentHref) {
          // For sub-items like Planned/Completed trips
          isActive =
            pathname === item.parentHref &&
            currentStatusFilter === item.href.split("=")[1];
        } else if (item.href.includes("?status=")) {
          // Should not happen if parentHref logic is correct
          isActive =
            pathname === item.href.split("?")[0] &&
            currentStatusFilter === item.href.split("=")[1];
        } else if (item.href === "/trips") {
          // For the main "My Trips" link
          isActive =
            pathname === "/trips" &&
            (currentStatusFilter === null || currentStatusFilter === "all");
        } else {
          // For other general links
          isActive = item.matchSegments
            ? pathname.startsWith(item.href) &&
              pathname.split("/").length >= item.href.split("/").length
            : pathname === item.href;
        }

        return (
          <SidebarMenuItem
            key={item.label}
            className={cn(
              item.isSubItem && "pl-4",
              item.isSubItem &&
                item.parentHref &&
                !pathname.includes(item.parentHref)
                ? "hidden"
                : "block"
            )}
          >
            <Link href={item.href}>
              <SidebarMenuButton
                size={"lg"}
                className={cn(
                  "font-medium w-full",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:border-sidebar-accent/75 border border-transparent hover:bg-transparent hover:text-sidebar-accent",
                  item.isSubItem && "h-9 text-sm pl-3"
                )}
                isActive={isActive}
                tooltip={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {item.isSubItem ? (
                  <Minus className="h-3 w-3 mr-2.5" />
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span
                  className={cn("font-headline", item.isSubItem && "text-sm")}
                >
                  {item.label}
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
