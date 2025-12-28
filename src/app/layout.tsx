import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/providers"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/layout"
import { BreadcrumbSection } from "@/components/layout/breadcrumb-section"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Todas do ENEM - Questões do ENEM desde 1998",
  description:
    "Acesse todas as questões do ENEM desde 1998. Filtre por ano, área e disciplina. Crie grupos de estudo e exporte para PDF.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-4">
                <div className="flex items-center gap-2 min-w-0">
                  <SidebarTrigger className="-ml-1 shrink-0" />
                  <Separator orientation="vertical" className="mr-2 h-4 shrink-0" />
                  <div className="hidden sm:block min-w-0">
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
