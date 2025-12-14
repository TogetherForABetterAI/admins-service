"use client";

import { User } from "@/app/(authenticated)/users/columns";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { apiFetch } from "@/external/api";
import { UserType } from "@/lib/table-data-type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const FormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  max_uses: z.coerce.number().min(1, "Must be at least 1 use"),
  expires_in_hours: z.coerce.number().min(1, "Must be at least 1 hour"),
});

type TokenFormData = z.infer<typeof FormSchema>;

interface TokenCreateResponse {
  token: string;
  expires_at: string;
}

const errorMessages: Record<number, string> = {
  404: "Invalid username",
  500: "Server error. Please try again later",
};

export async function createToken(
  data: TokenFormData
): Promise<TokenCreateResponse> {
  return apiFetch("/tokens/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function TokenForm() {
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [showTokenModal, setShowTokenModal] = useState(false);

  const [generatedToken, setGeneratedToken] = useState<TokenCreateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: [UserType.USERS],
    queryFn: () =>
      apiFetch("/users/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
  });

  const userOptions: ComboboxOption[] =
    users?.map((user) => ({
      value: user.username,
      label: user.username,
      sublabel: user.email,
    })) ?? [];

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      max_uses: 10,
      expires_in_hours: 24,
    },
  });
  const watchedHours = form.watch("expires_in_hours");

  const getEstimatedExpiration = (hours: number) => {
    if (!hours || isNaN(hours)) return "";
    const date = new Date();
    date.setHours(date.getHours() + Number(hours));
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: (data: TokenFormData) => createToken(data),
    onSuccess: (response: TokenCreateResponse) => {
      queryClient.invalidateQueries({ queryKey: [UserType.TOKENS] });
      setGeneratedToken(response);
      setIsFormOpen(false);
      setShowTokenModal(true);

      form.reset({
        username: "",
        max_uses: 10,
        expires_in_hours: 24,
      });
    },
    onError: (error: any) => {
      const statusCode = Number(error.message);
      const message =
        !isNaN(statusCode) && errorMessages[statusCode]
          ? errorMessages[statusCode]
          : "Failed to create token";

      toast.error(message);
      if (isNaN(statusCode)) {
        console.error("Error while handling API error:", error);
      }
    },
  });

  const onSubmit = async (data: TokenFormData) => {
    setLoading(true);
    try {
      await mutateAsync(data);
    } catch (err) {
      console.log("Error while creating token:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = async () => {
    if (!generatedToken?.token) return;
    try {
      await navigator.clipboard.writeText(generatedToken.token);
      setCopied(true);
      toast.success("Token copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy token");
    }
  };

  const handleCloseModal = () => {
    setShowTokenModal(false);
    setGeneratedToken(null);
    setCopied(false);
  };

  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Token
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate New Token</DialogTitle>
            <DialogDescription>
              Create a secure access token for a specific user.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select User</FormLabel>
                    <FormControl>
                      <Combobox
                        options={userOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select a user..."
                        searchPlaceholder="Search by username..."
                        emptyMessage="No user found"
                        isLoading={usersLoading}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_uses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} value={field.value as number ?? ''} />
                    </FormControl>
                    <FormDescription>
                      Limit usage count.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expires_in_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Expires (Hours)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="24" {...field} value={field.value as number ?? ''} />
                    </FormControl>
                    {!!watchedHours && (
                      <FormDescription suppressHydrationWarning>
                        Est: {getEstimatedExpiration(Number(watchedHours as string))}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Generate Token"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showTokenModal} onOpenChange={setShowTokenModal}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
              Token Generated Successfully
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="mt-1">
                      This is the <strong>only time</strong> this token will be
                      visible. Please copy it now.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        readOnly
                        value={generatedToken?.token ?? ""}
                        className="w-full rounded-md border bg-muted px-3 py-2 pr-10 font-mono text-sm focus:outline-none"
                      />
                    </div>
                    <Button
                      type="button"
                      variant={copied ? "default" : "outline"}
                      size="sm"
                      onClick={handleCopyToken}
                      className={copied ? "bg-emerald-600 text-white" : ""}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button onClick={handleCloseModal} className="w-full sm:w-auto">
              I have saved the token
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster richColors />
    </>
  );
}