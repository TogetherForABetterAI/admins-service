"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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

const FormSchema = z.object({
  email: z.string().email("Email must be a valid email address."),
})

export default function InputForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast("You submitted the following values", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Give access to other admins</h1>
        <p className="text-muted-foreground">Enter the email address of the admin you want to invite.</p>
      </div>
      <div className="flex justify-center align-center p-16">


        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="flex gap-4">

                    <FormControl>
                      <Input placeholder="admin@inti.com" {...field} />
                    </FormControl>
                    <div className="flex justify-end">
                      <Button type="submit">Invite</Button>
                    </div>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

          </form>
        </Form>
      </div>
    </>
  )
}
