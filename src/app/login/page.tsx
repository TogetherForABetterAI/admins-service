
import DarkModeToggle from "@/components/dark-mode-toggle";
import { LoginForm } from "@/components/forms/login-form";
import Logo from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="p-4 flex justify-end">
        <DarkModeToggle />
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        <Logo />
        <LoginForm />
      </div>
    </div>
  );
}