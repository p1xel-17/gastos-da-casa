import { requireHouseholdContext } from "@/lib/auth/household"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { themeColorToStyle } from "@/lib/theme"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const household = await requireHouseholdContext()

  return (
    <div style={themeColorToStyle(household.themeColor)}>
      <SidebarProvider>
        <AppSidebar householdName={household.householdName} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground">
              {household.householdName}
            </span>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
