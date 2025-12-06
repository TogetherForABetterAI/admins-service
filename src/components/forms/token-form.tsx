"use client";

import { User } from "@/app/(authenticated)/(dashboard)/columns";
import { ApiError, apiFetch } from "@/external/api";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import z from "zod";
import { UserType } from "@/lib/table-data-type";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

const FormSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

interface TokenCreateResponse {
  token: string;
  expires_at: string;
}

const errorMessages: Record<number, string> = {
  404: "Invalid username",
  500: "Server error. Please try again later",
};

export async function createToken(
  data: z.infer<typeof FormSchema>
): Promise<TokenCreateResponse> {
  return apiFetch("/tokens/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function TokenForm() {
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<TokenCreateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: [UserType.USERS],
    queryFn: () =>
      apiFetch("/users", {
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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (data: z.infer<typeof FormSchema>) => createToken(data),
    onSuccess: (response: TokenCreateResponse) => {
      queryClient.invalidateQueries({ queryKey: [UserType.TOKENS] });
      setGeneratedToken(response);
      setShowTokenModal(true);
    },
    onError: (error: any) => {
      const statusCode = Number(error.message);
      const message =
        !isNaN(statusCode) && errorMessages[statusCode]
          ? errorMessages[statusCode]
          : "Failed to create token";

      toast.error(message);
      form.setError("username", { message });

      if (isNaN(statusCode)) {
        console.error("Error while handling API error:", error);
      }
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
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
      console.error("Failed to copy:", err);
    }
  };

  const handleCloseModal = () => {
    setShowTokenModal(false);
    setGeneratedToken(null);
    setCopied(false);
    form.reset();
  };

  const formatExpiresAt = (expiresAt: string) => {
    try {
      const date = new Date(expiresAt);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return expiresAt;
    }
  };

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
                  <div className="flex gap-4 items-end">
                    <div className="flex flex-col gap-2">
                      <FormLabel>Select User</FormLabel>
                      <FormControl>
                        <Combobox
                          options={userOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select a user..."
                          searchPlaceholder="Search by username or email..."
                          emptyMessage="No user found"
                          isLoading={usersLoading}
                          className="w-80"
                        />
                      </FormControl>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        style={{ minWidth: "100px" }}
                        disabled={loading || !field.value}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Create
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Card>

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
                      visible. Please copy it and store it somewhere safe. You
                      will not be able to see it again.
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
                        className="w-full rounded-md border bg-muted px-3 py-2 pr-10 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <Button
                      type="button"
                      variant={copied ? "default" : "outline"}
                      size="sm"
                      onClick={handleCopyToken}
                      className={`min-w-24 transition-all ${
                        copied
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : ""
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {generatedToken?.expires_at && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Expires:</strong>{" "}
                      {formatExpiresAt(generatedToken.expires_at)}
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button onClick={handleCloseModal} className="w-full sm:w-auto">
              <Check className="mr-2 h-4 w-4" />
              I have saved the token
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster richColors />
    </div>
  );
}
