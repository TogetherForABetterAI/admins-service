"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserType } from "@/lib/table-data-type";
import { create } from "domain";
import { apiFetch } from "@/external/api";

const UserFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  model_type: z.string().min(1, "Model Type is required"),
  inputs_format: z.string().min(1, "Inputs Format is required"),
  outputs_format: z.string().min(1, "Outputs Format is required"),
});

type UserCredentials = z.infer<typeof UserFormSchema>;


type ApiError = { status: number; message: string };

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
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();


  const { mutateAsync } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UserType.USERS] });
    },
    onError: (error: ApiError) => {
      const message = errorMessages[error.status] || error.message || "Failed to create user";
      toast.error(message);
    },
  });

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

  const onSubmit = async (data: UserCredentials) => {
    try {
      setLoading(true);
      await mutateAsync(data);
      toast.success("User created successfully");
      form.reset();
    } catch (err) {
      const error = err as ApiError;
      console.error("Error creating user:", error);
      const message = errorMessages[error.status] || error.message || "Failed to create user";
      form.setError("root", { type: "manual", message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (

    <div className="flex justify-center align-center p-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>
            Fill in the details below to create a new user account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="model_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="MNIST or ACDC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MNIST">MNIST</SelectItem>
                      <SelectItem value="ACDC">ACDC</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="inputs_format" render={({ field }) => (
                <FormItem>
                  <FormLabel>Inputs Format</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. (28, 28, 1) for MNIST" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="outputs_format" render={({ field }) => (
                <FormItem>
                  <FormLabel>Outputs Format</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. (10,) for MNIST" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {form.formState.errors.root && (
                <p style={{ color: "red" }} className="text-sm">
                  {form.formState.errors.root.message}
                </p>
              )}
              <CardFooter className="flex-col gap-2 p-0 pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster richColors />
    </div>

  );
}
