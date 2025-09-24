import {AppSidebar} from "@/components/app-sidebar"
import { cookies } from 'next/headers'

export default async function Home() {
  const cookiesStore = await cookies()
  const email = cookiesStore.get("email")?.value

  return (
    <AppSidebar email={email}>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
        <p className="text-muted-foreground">Here you can manage your account settings and preferences.</p>
      </div>
    </AppSidebar>
  );
}