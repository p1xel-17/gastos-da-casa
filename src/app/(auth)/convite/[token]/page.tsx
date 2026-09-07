import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { acceptInvite } from "./actions"

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const accept = acceptInvite.bind(null, token)

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Convite para uma casa</CardTitle>
          <CardDescription>
            Você foi convidado a participar do controle de gastos de uma residência.
            Confirme abaixo para aceitar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={accept}>
            <Button type="submit" className="w-full">
              Aceitar convite
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
