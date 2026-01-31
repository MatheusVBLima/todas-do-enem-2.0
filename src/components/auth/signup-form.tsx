'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientSupabaseClient } from '@/lib/auth/client'
import { signupSchema, type SignupInput } from '@/lib/validations/auth'
import { upsertUserInDatabase } from '@/server/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Loader2, Mail } from 'lucide-react'

export function SignupForm() {
  const [formError, setFormError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: SignupInput) => {
    setFormError('')

    try {
      const supabase = createClientSupabaseClient()

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            language: 'pt', // Para templates de email em português
          },
        },
      })

      if (error) {
        setFormError(
          error.message === 'User already registered'
            ? 'Este email já está cadastrado'
            : error.message
        )
        return
      }

      // Create user in database
      if (authData.user) {
        const userResult = await upsertUserInDatabase(authData.user.id, data.email)

        if (!userResult.success) {
          console.error('Failed to create user in database:', userResult.error)
          // Continue anyway - user is created in auth, just log the error
        }
      }

      // Show success state with email confirmation message
      setUserEmail(data.email)
      setSignupSuccess(true)
    } catch (err) {
      setFormError('Ocorreu um erro ao criar sua conta. Tente novamente.')
    }
  }

  if (signupSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Verifique seu email</h3>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong>{userEmail}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            Clique no link do email para ativar sua conta. Você pode fechar esta aba.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>Mínimo de 6 caracteres</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </Button>
      </form>
    </Form>
  )
}
