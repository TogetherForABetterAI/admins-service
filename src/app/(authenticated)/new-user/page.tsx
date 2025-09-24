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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const UserFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  model_type: z.string().min(1, "Model Type is required"),
  inputs_format: z.string().min(1, "Inputs Format is required"),
  outputs_format: z.string().min(1, "Outputs Format is required"),
});

type UserCredentials = z.infer<typeof UserFormSchema>;

export default function NewUserPage() {
  const form = useForm<UserCredentials>({
    resolver: zodResolver(UserFormSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: UserCredentials) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:80/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      form.setError("root", {
        type: "manual",
        message: "This email is already taken",
      });
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
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="model_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Type</FormLabel>
                  <Select {...field}>
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
    </div>
  );
}
