import { requireHouseholdContext } from "@/lib/auth/household"
import { listMembers } from "@/lib/db/queries/households"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CurrencySelect } from "@/components/settings/currency-select"
import { ThemeColorPicker } from "@/components/settings/theme-color-picker"
import { AppearanceToggle } from "@/components/settings/appearance-toggle"
import { MembersSection } from "@/components/settings/members-section"

export default async function ConfiguracoesPage() {
  const household = await requireHouseholdContext()
  const members = await listMembers(household.householdId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Personalize a moeda, o tema e quem tem acesso aos dados de {household.householdName}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moeda</CardTitle>
          <CardDescription>
            Usada para formatar todos os valores exibidos no app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencySelect currency={household.currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cor do tema</CardTitle>
          <CardDescription>Escolha a cor de destaque do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeColorPicker themeColor={household.themeColor} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Modo claro, escuro ou de acordo com o sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Moradores</CardTitle>
          <CardDescription>
            Todos os moradores compartilham os mesmos lançamentos e categorias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MembersSection
            members={members}
            currentUserId={household.userId}
            isAdmin={household.role === "admin"}
          />
        </CardContent>
      </Card>
    </div>
  )
}
