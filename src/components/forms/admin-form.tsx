
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
import { Toaster } from "@/components/ui/sonner"
import { Loader2 } from "lucide-react";
import { QueryClient, useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { UserType } from "@/lib/table-data-type"
import { apiFetch } from "@/external/api";
import { useState } from "react";


const FormSchema = z.object({
  email: z.string().email("Email must be a valid email address."),
})

async function inviteAdmin({ email }: { email: string }) {
  return apiFetch("/admins/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

type ApiError = { status: number; message: string };

const errorMessages: Record<number, string> = {
  400: "Invalid email address.",
  500: "Server error. Please try again later.",
  409: "An admin with this email already exists.",
};


export function AdminForm() {
  const [loading, setLoading] = useState(false);
  const queryClient = new QueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    }
  });


  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    try {
      await mutateAsync(data);
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

  const { mutateAsync } = useMutation({
    mutationFn: (data: z.infer<typeof FormSchema>) => inviteAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UserType.ADMINS] });
    }
  });

  return (
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
  );
}