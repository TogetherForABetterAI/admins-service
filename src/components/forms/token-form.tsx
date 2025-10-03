


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
  id: z.string().uuid("ID must be a valid UUID."),
})

type ApiError = { status: number; message: string };

const errorMessages: Record<number, string> = {
  404: "Invalid user id.",
  500: "Server error. Please try again later.",
};

async function createToken({ id }: { id: string }) {
  return apiFetch("/tokens/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: id }),
  });
}

export function TokenForm() {
  const [loading, setLoading] = useState(false);
  const queryClient = new QueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: "",
    }
  });

  const { mutateAsync } = useMutation({
    mutationFn: (data: z.infer<typeof FormSchema>) => createToken(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UserType.TOKENS] });
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    try {
      await mutateAsync(data);
      toast.success("Token created successfully for user with ID: " + data.id);
      form.reset();
    } catch (err) {
      const error = err as ApiError;
      console.error("Error creating token:", error);
      const message = errorMessages[error.status] || error.message || "Failed to create token. Please try again.";
      form.setError("root", { type: "manual", message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    < div className="flex justify-center align-center p-16" >
      <Card className="p-8">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-4" style={{ minWidth: "400px" }}>

                    <FormControl>
                      <Input {...field} placeholder="User ID" value={field.value || ""} />
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