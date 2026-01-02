"use client"

import { Palette, Moon, Sun, Check, Monitor } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAppearance, type ThemeName, type FontFamily } from "@/hooks/use-appearance"
import { cn } from "@/lib/utils"

interface ThemeOption {
  name: ThemeName
  label: string
  description: string
  light: {
    bg: string
    primary: string
    muted: string
  }
  dark: {
    bg: string
    primary: string
    muted: string
  }
}

const THEMES: ThemeOption[] = [
  {
    name: "default",
    label: "Padrão",
    description: "Equilibrado e amigável",
    light: {
      bg: "oklch(0.9818 0.0054 95.0986)",
      primary: "oklch(0.6171 0.1375 39.0427)",
      muted: "oklch(0.9341 0.0153 90.2390)",
    },
    dark: {
      bg: "oklch(0.2679 0.0036 106.6427)",
      primary: "oklch(0.6724 0.1308 38.7559)",
      muted: "oklch(0.2213 0.0038 106.7070)",
    },
  },
  {
    name: "neutro",
    label: "Neutro",
    description: "Minimalista e profissional",
    light: {
      bg: "oklch(0.9900 0 0)",
      primary: "oklch(0 0 0)",
      muted: "oklch(0.9700 0 0)",
    },
    dark: {
      bg: "oklch(0 0 0)",
      primary: "oklch(1 0 0)",
      muted: "oklch(0.2300 0 0)",
    },
  },
  {
    name: "haze",
    label: "Haze",
    description: "Tons violetas suaves",
    light: {
      bg: "oklch(0.9777 0.0041 301.4256)",
      primary: "oklch(0.6104 0.0767 299.7335)",
      muted: "oklch(0.8906 0.0139 299.7754)",
    },
    dark: {
      bg: "oklch(0.2166 0.0215 292.8474)",
      primary: "oklch(0.7058 0.0777 302.0489)",
      muted: "oklch(0.2560 0.0320 294.8380)",
    },
  },
  {
    name: "notebook",
    label: "Notebook",
    description: "Estilo papel e nanquim",
    light: {
      bg: "oklch(0.9821 0 0)",
      primary: "oklch(0.4891 0 0)",
      muted: "oklch(0.9158 0 0)",
    },
    dark: {
      bg: "oklch(0.2891 0 0)",
      primary: "oklch(0.7572 0 0)",
      muted: "oklch(0.3904 0 0)",
    },
  },
  {
    name: "ghibli",
    label: "Ghibli",
    description: "Natureza e serenidade",
    light: {
      bg: "oklch(0.8798 0.0534 91.7893)",
      primary: "oklch(0.6657 0.1050 118.9078)",
      muted: "oklch(0.8532 0.0631 91.1493)",
    },
    dark: {
      bg: "oklch(0.3303 0.0214 88.0737)",
      primary: "oklch(0.6762 0.0567 132.4479)",
      muted: "oklch(0.3892 0.0197 82.7084)",
    },
  },
  {
    name: "twitter",
    label: "Twitter",
    description: "Clássico azul social",
    light: {
      bg: "oklch(1.0000 0 0)",
      primary: "oklch(0.6723 0.1606 244.9955)",
      muted: "oklch(0.9222 0.0013 286.3737)",
    },
    dark: {
      bg: "oklch(0 0 0)",
      primary: "oklch(0.6692 0.1607 245.0110)",
      muted: "oklch(0.2090 0 0)",
    },
  },
  {
    name: "violeta",
    label: "Violeta",
    description: "Vibrante e energético",
    light: {
      bg: "oklch(0.9940 0 0)",
      primary: "oklch(0.5393 0.2713 286.7462)",
      muted: "oklch(0.9702 0 0)",
    },
    dark: {
      bg: "oklch(0.2223 0.0060 271.1393)",
      primary: "oklch(0.6132 0.2294 291.7437)",
      muted: "oklch(0.2940 0.0130 272.9312)",
    },
  },
]

const FONTS = [
  {
    name: "sans" as FontFamily,
    label: "Geist Sans",
    description: "Moderna, limpa e altamente legível",
    preview: "font-sans",
  },
  {
    name: "serif" as FontFamily,
    label: "Newsreader",
    description: "Elegante, clássica e confortável para leitura",
    preview: "font-serif",
  },
  {
    name: "mono" as FontFamily,
    label: "Geist Mono",
    description: "Técnica, precisa e com largura fixa",
    preview: "font-mono",
  },
]

export default function AparenciaPage() {
  const { settings, setTheme, setMode, setFont, mounted } = useAppearance()

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Palette className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Aparência</h1>
        </div>
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Palette className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Aparência</h1>
        </div>
        <p className="text-muted-foreground">
          Personalize a aparência do aplicativo escolhendo seu tema, modo e fonte preferidos.
        </p>
      </div>

      {/* Theme Selection */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-bold tracking-tight">Tema de Cores</CardTitle>
          <CardDescription>
            Escolha uma paleta que combine com seu estilo de estudo.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((theme) => {
              const isSelected = settings.theme === theme.name
              return (
                <button
                  key={theme.name}
                  onClick={() => setTheme(theme.name)}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl border transition-all hover:shadow-md",
                    isSelected ? "border-primary ring-2 ring-primary/20 bg-accent/5" : "border-border bg-card"
                  )}
                >
                  <div className="flex h-24 w-full">
                    {/* Light Preview Side */}
                    <div 
                      className="flex-1 p-3 flex flex-col gap-2 relative border-r"
                      style={{ backgroundColor: theme.light.bg }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="size-3 rounded-full" style={{ backgroundColor: theme.light.primary }} />
                        <Sun className="size-4 text-amber-700" />
                      </div>
                      <div className="space-y-1.5 mt-1">
                        <div className="h-1.5 w-16 rounded-full opacity-20" style={{ backgroundColor: theme.light.primary }} />
                        <div className="h-1.5 w-10 rounded-full opacity-10" style={{ backgroundColor: theme.light.primary }} />
                      </div>
                    </div>
                    {/* Dark Preview Side */}
                    <div 
                      className="flex-1 p-3 flex flex-col gap-2 relative"
                      style={{ backgroundColor: theme.dark.bg }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="size-3 rounded-full" style={{ backgroundColor: theme.dark.primary }} />
                        <Moon className="size-4 text-gray-300" />
                      </div>
                      <div className="space-y-1.5 mt-1">
                        <div className="h-1.5 w-16 rounded-full opacity-20" style={{ backgroundColor: theme.dark.primary }} />
                        <div className="h-1.5 w-10 rounded-full opacity-10" style={{ backgroundColor: theme.dark.primary }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 w-full border-t bg-card/50 backdrop-blur-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold tracking-tight">{theme.label}</h3>
                      <p className="text-[11px] text-muted-foreground leading-none mt-1">{theme.description}</p>
                    </div>
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                        <Check className="size-3" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Light/Dark Mode Toggle */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-bold tracking-tight">Modo de Visualização</Label>
            <RadioGroup
              value={settings.mode}
              onValueChange={(value) => setMode(value as "light" | "dark")}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              <Label
                htmlFor="mode-light"
                className={cn(
                  "flex flex-col items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-all hover:bg-accent/50",
                  settings.mode === "light" ? "border-primary bg-accent/10 ring-2 ring-primary/20" : "border-border bg-card"
                )}
              >
                <RadioGroupItem value="light" id="mode-light" className="sr-only" />
                <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Sun className={cn("size-5", settings.mode === "light" ? "text-orange-600" : "text-orange-400")} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold tracking-tight">Claro</p>
                  <p className="text-[11px] text-muted-foreground">Foco e clareza</p>
                </div>
              </Label>

              <Label
                htmlFor="mode-dark"
                className={cn(
                  "flex flex-col items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-all hover:bg-accent/50",
                  settings.mode === "dark" ? "border-primary bg-accent/10 ring-2 ring-primary/20" : "border-border bg-card"
                )}
              >
                <RadioGroupItem value="dark" id="mode-dark" className="sr-only" />
                <div className="size-10 rounded-full bg-indigo-950 flex items-center justify-center">
                  <Moon className={cn("size-5", settings.mode === "dark" ? "text-indigo-300" : "text-indigo-500")} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold tracking-tight">Escuro</p>
                  <p className="text-[11px] text-muted-foreground">Conforto noturno</p>
                </div>
              </Label>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Font Selection */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
            Fonte
          </CardTitle>
          <CardDescription>
            Ajuste a tipografia para sua melhor experiência de leitura.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <RadioGroup
            value={settings.font}
            onValueChange={(value) => setFont(value as FontFamily)}
            className="grid gap-4 lg:grid-cols-3"
          >
            {FONTS.map((font) => (
              <Label
                key={font.name}
                htmlFor={`font-${font.name}`}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border p-5 cursor-pointer transition-all hover:bg-accent/50",
                  settings.font === font.name ? "border-primary bg-accent/10 ring-2 ring-primary/20" : "border-border bg-card"
                )}
              >
                <RadioGroupItem value={font.name} id={`font-${font.name}`} className="sr-only" />
                <div className={cn("text-4xl font-medium", font.preview)}>Aa</div>
                <div>
                  <p className="text-sm font-bold tracking-tight">{font.label}</p>
                  <p className="text-[11px] leading-snug text-muted-foreground mt-0.5">{font.description}</p>
                </div>
                <div className={cn("text-[13px] border-t pt-3 mt-1 italic opacity-70", font.preview)}>
                  "A educação é a arma mais poderosa que você pode usar para mudar o mundo."
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="overflow-hidden border shadow-sm rounded-3xl">
        <CardHeader className="bg-accent/20 border-b py-4 px-6">
          <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2 uppercase opacity-70">
            <Monitor className="size-4 text-primary" />
            Pré-visualização do App
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-8 sm:p-12 transition-colors duration-300 bg-background text-foreground" style={{ fontFamily: "var(--app-font-family)" }}>
            <div className="rounded-2xl border p-6 space-y-6 bg-card shadow-sm max-w-2xl mx-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">Linguagens</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Questão 1 • 2025</div>
                </div>
                <h3 className="text-2xl font-bold tracking-tight leading-tight">Como as mudanças climáticas afetam a produção de alimentos?</h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-base leading-relaxed opacity-90">
                  O texto acima exemplifica como os títulos e badges aparecerão. Este parágrafo demonstra o corpo do texto
                  utilizando a fonte <strong>{FONTS.find(f => f.name === settings.font)?.label}</strong> em conjunto com o 
                  tema <strong>{THEMES.find(t => t.name === settings.theme)?.label}</strong>.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm transition-all hover:brightness-110 active:scale-95">
                  Confirmar Resposta
                </button>
                <button className="px-6 py-2.5 rounded-xl border border-border hover:bg-accent text-sm font-bold transition-all active:scale-95">
                  Ver Explicação AI
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
