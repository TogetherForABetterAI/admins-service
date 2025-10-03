"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { useRouter } from "next/dist/client/components/navigation";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { signIn } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logueando con:", email, password);

    if (!email || !password) {
      setError("Debes ingresar tu email y contraseña");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await signIn(email, password);
      if (!user) {
        setError("Email o contraseña incorrectos");
        return;
      }
      router.replace("/");
    } catch (err) {
      console.error("Error en login:", err);
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };


  if (error) {
    toast.error(error);
    setError("");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your admin account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@inti.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Reset password flow not implemented yet.");
                  }}
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" onClick={handleSubmit}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
        </Button>
      </CardFooter>
      <Toaster richColors />
    </Card>
  )
}