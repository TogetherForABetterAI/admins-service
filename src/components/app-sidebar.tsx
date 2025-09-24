"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Search, Settings, UserRoundPlus, User, Plus, House } from "lucide-react"
import { usePathname } from "next/navigation";

import { ReactNode } from "react";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: House,
  },
  {
    title: "Search users",
    url: "/search-users",
    icon: Search,
  },
  {
    title: "New User",
    url: "/new-user",
    icon: Plus,
  },
  {
    title: "Grant Access",
    url: "/grant-access",
    icon: UserRoundPlus,
  },
]

export function AppSidebar({ children, email }: { children: ReactNode, email?: string }) {
  const pathname = usePathname();
  console.log("Current pathname:", pathname);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <User />
          <span className="font-bold">{email}</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive = pathname === item.url;
                  console.log(`Item: ${item.title}, URL: ${item.url}, Active: ${isActive}`);
                  return (
                    <SidebarMenuItem key={item.title} style={{ backgroundColor: isActive ? "#e0e0e0ff" : "transparent", borderRadius: "8px" }}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}