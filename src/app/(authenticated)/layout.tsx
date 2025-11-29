
import "@/styles/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import { User } from "lucide-react";
import { LogOutButton } from "@/components/logout-button";



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const email = data?.claims.email;

  return (
    <div>
      <div className="z-1000 flex justify-between align-middle text-white px-2" style={{ backgroundColor: "#232D4F", height: "64px" }} >
        <Image
          src="/logo-inti-white.png"
          alt="INTI logo"
          width={20}
          height={20}
          className="w-auto p-4"
          priority
        />
        <div className="flex items-center gap-2">
          <User />
          <span className="font-bold pr-2">{email}</span>
          <LogOutButton />
        </div>
      </div>
      <AppSidebar mlflow_url={process.env.MLFLOW_TRACKING_URI}>
        <div className="p-8" style={{ paddingTop: "calc(var(--spacing) * 16)" }}>
          {children}
        </div>
      </AppSidebar>
    </div>


  );
}





