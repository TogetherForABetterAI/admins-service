"use client";

import { useSearchParams } from "next/navigation";
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
import { set } from "zod";

export function SetPasswordCard() {
  const router = useRouter();
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Setting password to:", password1, password2);

    if (!password1 || !password2) {
      setError("Debes ingresar tu nueva contraseña");
      return;
    }

    if (password1 !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("http://localhost:80/admins/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password1,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError("Error al crear usuario");
        setLoading(false);
        return;
      }

      const data = await response.json();

    } catch (err) {
      console.error(err);
      setError("Error al crear usuario");
      setLoading(false);
      return;

    } finally {
      setLoading(false);
    }
    router.replace("/");
  };

  if (error) {
    toast.error(error);
    setError("");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set a password</CardTitle>
        <CardDescription>
          Set a password for {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="password1">Password</Label>
              <Input
                id="password1"
                type="password"
                placeholder="••••••••"
                required
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password2">Confirm Password</Label>
              </div>
              <Input id="password2" type="password" placeholder="••••••••" required value={password2} onChange={(e) => setPassword2(e.target.value)} />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" onClick={handleSubmit}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Set Password"}
        </Button>
      </CardFooter>
      <Toaster richColors />
    </Card>
  )
}