import type { Metadata } from "next"
import { Geist, Geist_Mono, Newsreader } from "next/font/google"
import { Suspense } from "react"
import { Providers } from "@/providers"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/layout"
import { BreadcrumbSection } from "@/components/layout/breadcrumb-section"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile, upsertUserInDatabase } from "@/server/actions/users"
import { AppearanceScript } from "@/components/appearance-script"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Todas do ENEM - Questões do ENEM desde 1998",
  description:
    "Acesse todas as questões do ENEM desde 1998. Filtre por ano, área e disciplina. Crie grupos de estudo e exporte para PDF.",
}

async function SidebarWrapper() {
  const authUser = await getCurrentUser()
  let user = null

  if (authUser) {
    const userResult = await getUserProfile(authUser.id)
    if (userResult.success && userResult.data) {
      user = {
        id: userResult.data.id,
        email: userResult.data.email,
        name: userResult.data.name || authUser.email?.split('@')[0] || 'Usuário',
        plan: userResult.data.plan as 'TENTANDO_A_SORTE' | 'RUMO_A_APROVACAO',
      }
    } else {
      const createResult = await upsertUserInDatabase(authUser.id, authUser.email || '')
      if (createResult.success && createResult.data) {
        user = {
          id: createResult.data.id,
          email: createResult.data.email,
          name: createResult.data.name || authUser.email?.split('@')[0] || 'Usuário',
          plan: createResult.data.plan as 'TENTANDO_A_SORTE' | 'RUMO_A_APROVACAO',
        }
      } else {
        user = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.email?.split('@')[0] || 'Usuário',
          plan: 'TENTANDO_A_SORTE' as const,
        }
      }
    }
  }

  return <AppSidebar user={user} />
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} antialiased`}
      >
        <AppearanceScript />
        <Providers>
          <SidebarProvider>
            <Suspense fallback={<div className="w-[var(--sidebar-width)] bg-sidebar animate-pulse h-screen" />}>
              <SidebarWrapper />
            </Suspense>
            <SidebarInset>
              <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <SidebarTrigger className="-ml-1 shrink-0" />
                  <Separator orientation="vertical" className="mr-2 h-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <BreadcrumbSection />
                  </div>
                </div>
                <div className="ml-auto shrink-0">
                  <Header />
                </div>
              </header>
              <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  )
}
