"use client"

import type React from "react"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

export function SetPasswordCard() {
  const router = useRouter()
  const [password1, setPassword1] = useState("")
  const [password2, setPassword2] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword1, setShowPassword1] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)

  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Setting password to:", password1, password2)

    if (!password1 || !password2) {
      setError("Debes ingresar tu nueva contraseña")
      return
    }

    if (password1 !== password2) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

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
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError("Error al crear usuario")
        setLoading(false)
        return
      }

      const data = await response.json()
    } catch (err) {
      console.error(err)
      setError("Error al crear usuario")
      setLoading(false)
      return
    } finally {
      setLoading(false)
    }

    router.replace("/")
  }

  if (error) {
    toast.error(error)
    setError("")
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set a password</CardTitle>
        <CardDescription>Set a password for {email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="password1">Password</Label>
              <div className="relative">
                <Input
                  id="password1"
                  type={showPassword1 ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword1(!showPassword1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword1 ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password2">Confirm Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password2"
                  type={showPassword2 ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword2 ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
