import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { createHousehold } from "./actions"

export default function OnboardingPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Crie sua casa</CardTitle>
          <CardDescription>
            Dê um nome à sua residência para começar a lançar receitas e despesas. Você
            poderá convidar outros moradores depois, em Configurações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createHousehold}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nome da casa</FieldLabel>
                <Input id="name" name="name" placeholder="Ex: Casa da Família Silva" required />
                <FieldDescription>
                  Todos os moradores convidados verão os mesmos lançamentos.
                </FieldDescription>
              </Field>
              <Button type="submit" className="w-full">
                Criar e continuar
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
