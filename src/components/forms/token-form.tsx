


"use client"
import { Token, tokenColumns } from "@/app/(authenticated)/new-token/columns";
import { apiFetch } from "@/external/api";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner";
import z from "zod";
import { UserType } from "@/lib/table-data-type";

const FormSchema = z.object({
  username: z.string().min(1, "Username is required"),
})

type ApiError = { status: number; message: string };

const errorMessages: Record<number, string> = {
  404: "Invalid username",
  500: "Server error. Please try again later",
};

export async function createToken(data: z.infer<typeof FormSchema>) {
  const response = await fetch("/api/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: body.message || "Unexpected error",
    } satisfies ApiError;
  }

  return response.json();
}

export function TokenForm() {
  const [loading, setLoading] = useState(false);
  const queryClient = new QueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    }
  });

  const { mutateAsync } = useMutation({
    mutationFn: (data: z.infer<typeof FormSchema>) => createToken(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UserType.TOKENS] });
    },
    onError: (error: ApiError) => {
      const message = errorMessages[error.status] || error.message || "Failed to create token. Please try again.";

      form.setError("username", { message });
      toast.error(message);
    }
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    try {
      await mutateAsync(data);
      form.reset();
    } catch (err) {
      console.log("Error while fetching tokens:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ paddingBottom: "calc(var(--spacing) * 8)" }}>
      <Card className="p-4" style={{ width: "fit-content" }}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-4" >

                    <FormControl>
                      <Input {...field} placeholder="Username" value={field.value || ""} className="w-80" />
                    </FormControl>
                    <div className="flex justify-end">
                      <Button type="submit" style={{ minWidth: "80px" }} disabled={loading}>
                        {loading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : "Create"}
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
      < Toaster richColors />

    </div >
  );
}