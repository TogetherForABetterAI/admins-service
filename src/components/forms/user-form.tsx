"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserType } from "@/lib/table-data-type";
import { apiFetch } from "@/external/api";

const UserFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  model_type: z.string().min(1, "Model Type is required"),
  inputs_format: z.string().min(1, "Inputs Format is required"),
  outputs_format: z.string().min(1, "Outputs Format is required"),
});

type UserCredentials = z.infer<typeof UserFormSchema>;

const errorMessages: Record<number, string> = {
  409: "Email or username already exists",
  422: "Invalid input data",
};

async function createUser(data: UserCredentials) {
  return apiFetch("/users/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export default function UserForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<UserCredentials>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      username: "",
      email: "",
      model_type: "",
      inputs_format: "",
      outputs_format: "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UserType.USERS] });
      toast.success("User created successfully");

      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      let statusCode = 0;
      let apiMessage = "";
      try {
        const parsedError = JSON.parse(error.message);
        statusCode = parsedError.status;
        apiMessage = parsedError.message;
      } catch {
        apiMessage = error.message;
      }
      const message =
        errorMessages[statusCode] ?? apiMessage ?? "Failed to create user";

      toast.error(message);
      form.setError("root", { message });
    },
  });

  const onSubmit = async (data: UserCredentials) => {
    try {
      setLoading(true);
      await mutateAsync(data);
    } catch (err) {
      console.error("Error creating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedModelType = form.watch("model_type");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New User
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new user account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("inputs_format", "");
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select MNIST or ACDC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MNIST">MNIST</SelectItem>
                      <SelectItem value="ACDC">ACDC</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inputs_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inputs Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedModelType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !selectedModelType
                            ? "Select a model first"
                            : "Select format"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedModelType === "MNIST" && (
                        <SelectItem value="(28, 28, 1)">
                          (28, 28, 1)
                        </SelectItem>
                      )}
                      {selectedModelType === "ACDC" && (
                        <SelectItem value="(256, 256, 1)">
                          (256, 256, 1)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outputs_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outputs Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedModelType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !selectedModelType
                            ? "Select a model first"
                            : "Select format"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedModelType === "MNIST" && (
                        <SelectItem value="(10,)">(10,)</SelectItem>
                      )}
                      {selectedModelType === "ACDC" && (
                        <SelectItem value="(256, 256, 4)">
                          (256, 256, 4)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-red-500">
                {form.formState.errors.root.message}
              </p>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}