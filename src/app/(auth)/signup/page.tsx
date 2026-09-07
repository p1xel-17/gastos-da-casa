"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { signupSchema, type SignupInput } from "@/lib/validation/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SignupPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) })

  async function onSubmit(values: SignupInput) {
    setServerError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { display_name: values.displayName } },
    })

    if (error) {
      setServerError(error.message)
      return
    }

    if (!data.session) {
      setServerError(
        "Conta criada! Verifique seu e-mail para confirmar antes de entrar."
      )
      return
    }

    router.push("/onboarding")
    router.refresh()
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription>
            Comece a organizar os gastos da sua casa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.displayName}>
                <FieldLabel htmlFor="displayName">Nome</FieldLabel>
                <Input id="displayName" autoComplete="name" {...register("displayName")} />
                <FieldError errors={[errors.displayName]} />
              </Field>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              {serverError && (
                <p className="text-sm text-muted-foreground">{serverError}</p>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Criando..." : "Criar conta"}
              </Button>
            </FieldGroup>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary underline underline-offset-4">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
