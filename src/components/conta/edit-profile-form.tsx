'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validations/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { updateUserProfile } from '@/server/actions/users'
import { useRouter } from 'next/navigation'

interface EditProfileFormProps {
  authUserId: string
  currentName: string | null
}

export function EditProfileForm({ authUserId, currentName }: EditProfileFormProps) {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: currentName || '',
    },
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSuccess(false)

    const result = await updateUserProfile(authUserId, data)

    if (result.success) {
      toast.success('Perfil atualizado com sucesso!')
      setIsSuccess(true)
      router.refresh()

      // Reset success state after 2 seconds
      setTimeout(() => setIsSuccess(false), 2000)
    } else {
      toast.error(result.error || 'Erro ao atualizar perfil')
    }
  }

  const isDirty = form.formState.isDirty

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo ou nome de exibição</FormLabel>
              <FormControl>
                <Input
                  placeholder="Seu nome"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Este nome será exibido na sidebar e em seu perfil
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !isDirty}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : isSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Salvo!
            </>
          ) : (
            'Salvar alterações'
          )}
        </Button>
      </form>
    </Form>
  )
}
