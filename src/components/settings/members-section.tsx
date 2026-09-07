"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createInviteAction, removeMemberAction } from "@/app/(app)/configuracoes/actions"

type Member = {
  userId: string
  displayName: string
  role: "admin" | "member"
}

export function MembersSection({
  members,
  currentUserId,
  isAdmin,
}: {
  members: Member[]
  currentUserId: string
  isAdmin: boolean
}) {
  const [email, setEmail] = useState("")
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleInvite() {
    if (!email) return
    startTransition(async () => {
      try {
        const token = await createInviteAction(email)
        const link = `${window.location.origin}/convite/${token}`
        setInviteLink(link)
        setEmail("")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao criar convite.")
      }
    })
  }

  function handleRemove(userId: string) {
    startTransition(async () => {
      try {
        await removeMemberAction(userId)
        toast.success("Morador removido.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{member.displayName}</span>
              {member.userId === currentUserId && (
                <Badge variant="outline">Você</Badge>
              )}
              <Badge variant="secondary">
                {member.role === "admin" ? "Administrador" : "Membro"}
              </Badge>
            </div>
            {isAdmin && member.userId !== currentUserId && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button size="icon-sm" variant="ghost" disabled={isPending} />}
                >
                  <Trash2 />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover morador?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {member.displayName} perderá acesso aos dados desta casa.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRemove(member.userId)}>
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="invite-email">Convidar morador por e-mail</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleInvite} disabled={isPending || !email}>
                  Gerar convite
                </Button>
              </div>
            </Field>
          </FieldGroup>

          {inviteLink && (
            <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
              <span className="flex-1 truncate">{inviteLink}</span>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink)
                  toast.success("Link copiado.")
                }}
              >
                <Copy />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
