
import "@/styles/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import DarkModeToggle from "@/components/dark-mode-toggle";
import { createClient } from "@/lib/supabase";


export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const email = data?.claims.email;

    return (
        <div className="flex">
            <AppSidebar email={email}>
                {children}
            </AppSidebar>
            <div className="flex-1 p-4 flex justify-end">
                <DarkModeToggle />
            </div>
        </div>


    );
}





