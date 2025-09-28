"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/data-table"
import { UserType } from "@/lib/user_type";

const FormSchema = z.object({
  email: z.string().email("Email must be a valid email address."),
})


type ApiError = { status: number; message: string };

const errorMessages: Record<number, string> = {
  400: "Invalid email address.",
  500: "Server error. Please try again later.",
  409: "An admin with this email already exists.",
};

async function grantAdminPermissions({ email }: { email: string }) {
  const response = await fetch("/api/admins/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw { status: response.status, message: responseData.message } as ApiError;
  }
  return responseData;
}

export default function InputForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    }
  });

  const [loading, setLoading] = useState(false);
  const [adminsData, setAdminsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admins/get", { cache: "no-store" });
        if (!res.ok) throw new Error("Error fetching data");
        const json = await res.json();
        if (json.length === 0) {
          return;
        }
        setAdminsData(json);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    try {
      await grantAdminPermissions(data);
      toast.success("Invite sent successfully to " + data.email);
      form.reset();
    } catch (err) {
      const error = err as ApiError;
      console.error("Error granting admin permissions:", error);
      const message = errorMessages[error.status] || error.message || "Failed to grant admin permissions";
      form.setError("root", { type: "manual", message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <h1 className="p-8 text-2xl font-bold">Give access to other admins</h1>
      {adminsData && (
        <div className="p-8">
          <p className="text-muted-foreground">Current admins:</p>
          <DataTable type={UserType.ADMINS} />
        </div>
      )}
      <p className="p-8 text-muted-foreground">Enter the email address of the admin you want to invite.</p>
      <div className="flex justify-center align-center p-16">
        <Card className="p-16">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-4">

                      <FormControl>
                        <Input placeholder="admin@inti.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <div className="flex justify-end">
                        <Button type="submit" style={{ minWidth: "80px" }} disabled={loading}>
                          {loading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : "Invite"}
                        </Button>

                      </div>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

            </form>
          </Form>
        </Card >
        <Toaster richColors />

      </div >
    </>
  )
}
