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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


import { KeyRound, UserRoundPlus, User, Plus, House, Database } from "lucide-react"
import { usePathname } from "next/navigation";

import { ReactNode } from "react";
import { Button } from "./ui/button";
import { toast, Toaster } from "sonner";
import { signOut } from "@/lib/supabase";

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
    title: "MLflow",
    url: "/mlflow",
    icon: Database,
  },
]



export function AppSidebar({ children, email }: { children: ReactNode, email?: string }) {
  const pathname = usePathname();
  console.log("Current pathname:", pathname);

  const logout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  }

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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Logout</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>No</AlertDialogCancel>
                <AlertDialogAction onClick={logout}>Yes</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <main>
        <SidebarTrigger />
        {children}
      </main>
      <Toaster richColors />
    </SidebarProvider >
  )
}