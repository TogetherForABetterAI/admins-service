import { AppSidebar } from "@/components/app-sidebar";
import DarkModeToggle from "@/components/dark-mode-toggle";
import { cookies } from "next/headers";


export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const email = cookieStore.get("email")?.value;
  
  return (
    <div className="flex">
      <AppSidebar email={email}>
        {children}
      </AppSidebar>
      <div className="flex-1 p-4 flex justify-end">
        <DarkModeToggle />
      </div>
    </div>
  )
}