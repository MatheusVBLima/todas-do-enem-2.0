import type { Metadata } from "next"
import { Geist, Geist_Mono, Newsreader } from "next/font/google"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
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

const siteUrl = "https://todas-do-enem-2-0.vercel.app"

export const metadata: Metadata = {
  title: {
    default: "Todas do ENEM - Questões do ENEM desde 1998",
    template: "%s | Todas do ENEM",
  },
  description:
    "Acesse todas as questões do ENEM desde 1998. Inteligência artificial treinada para explicar questões, corrigir redações pelas competências do ENEM, simulados e planejamento de estudos.",
  keywords: [
    "ENEM",
    "questões ENEM",
    "simulado ENEM",
    "estudar ENEM",
    "provas ENEM",
    "questões antigas ENEM",
    "banco de questões",
    "vestibular",
  ],
  authors: [{ name: "Todas do ENEM" }],
  creator: "Todas do ENEM",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Todas do ENEM",
    title: "Todas do ENEM - Questões do ENEM desde 1998",
    description:
      "Acesse todas as questões do ENEM desde 1998. Inteligência artificial treinada para explicar questões, corrigir redações pelas competências do ENEM, simulados e planejamento de estudos.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Todas do ENEM - Plataforma de questões do ENEM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Todas do ENEM - Questões do ENEM desde 1998",
    description:
      "Acesse todas as questões do ENEM desde 1998. Inteligência artificial treinada para explicar questões, corrigir redações pelas competências do ENEM, simulados e planejamento de estudos.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

async function getUserData() {
  const authUser = await getCurrentUser()

  if (!authUser) {
    return null
  }

  // Busca perfil do usuário
  const userResult = await getUserProfile(authUser.id)

  if (userResult.success && userResult.data) {
    return {
      id: userResult.data.id,
      email: userResult.data.email,
      name: userResult.data.name || authUser.email?.split('@')[0] || 'Usuário',
      plan: userResult.data.plan as 'TENTANDO_A_SORTE' | 'RUMO_A_APROVACAO',
    }
  }

  // Usuário autenticado mas não existe no banco - criar
  const createResult = await upsertUserInDatabase(authUser.id, authUser.email || '')

  return {
    id: createResult.success && createResult.data ? createResult.data.id : authUser.id,
    email: createResult.success && createResult.data ? createResult.data.email : authUser.email || '',
    name: createResult.success && createResult.data
      ? createResult.data.name || authUser.email?.split('@')[0] || 'Usuário'
      : authUser.email?.split('@')[0] || 'Usuário',
    plan: (createResult.success && createResult.data ? createResult.data.plan : 'TENTANDO_A_SORTE') as 'TENTANDO_A_SORTE' | 'RUMO_A_APROVACAO',
  }
}

async function SidebarWrapper() {
  const user = await getUserData()
  return <AppSidebar user={user} />
}

async function HeaderWrapper() {
  const user = await getUserData()
  return <Header userId={user?.id ?? null} />
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
          <Analytics />
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
                  <Suspense fallback={<div className="w-32 h-8 bg-muted animate-pulse rounded" />}>
                    <HeaderWrapper />
                  </Suspense>
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
