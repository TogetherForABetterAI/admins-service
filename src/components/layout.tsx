import { AppSidebar } from "./app-sidebar";
import DarkModeToggle from "./dark-mode-toggle";


export default function Layout({ children, email }: { children: React.ReactNode, email?: string }) {
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
