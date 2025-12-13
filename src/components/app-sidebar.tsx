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

import { KeyRound, UserRoundPlus, User, Plus, House, Database, FlaskConical, Microscope } from "lucide-react"
import { usePathname } from "next/navigation";

import { ReactNode } from "react";
import { toast, Toaster } from "sonner";



export function AppSidebar({ children, mlflow_url }: { children: ReactNode, mlflow_url?: string }) {
  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: House,
    },
    {
      title: "New User",
      url: "/new-user",
      icon: Plus,
    },
    {
      title: "New token",
      url: "/new-token",
      icon: KeyRound,
    },
    {
      title: "Grant Access to Admins",
      url: "/grant-access",
      icon: UserRoundPlus,
    },
    {
      title: "Model Inspector",
      url: "/model-inspector",
      icon: Microscope,
    },
    {
      title: "MLflow",
      url: mlflow_url,
      icon: Database,
    },
  ]
  const pathname = usePathname();
  console.log("Current pathname:", pathname);

  return (
    <SidebarProvider>
      <Sidebar>
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
                        <a href={item.url} className="flex items-center gap-2" target={item.title === "MLflow" ? "_blank" : "_self"} rel={item.title === "MLflow" ? "noopener noreferrer" : ""}>
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
      <main>
        {children}
      </main>
      <Toaster richColors />
    </SidebarProvider >
  )
}
