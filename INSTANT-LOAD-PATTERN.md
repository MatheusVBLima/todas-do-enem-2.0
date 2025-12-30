# Padrão de Navegação Instantânea (Instant-Load Pattern)

Este documento descreve a arquitetura utilizada no projeto **Todas do ENEM 2.0** para atingir navegação de 0ms, conteúdo estático imediato e antecipação de carga de dados utilizando Next.js 16 e TanStack Query v5.

## 1. Os Três Pilares do Cache

Para evitar loadings repetidos e flashes de interface, o cache é gerenciado em três níveis:

### A. TanStack Data Cache (Camada de Dados JSON)
Configurado no `src/providers/query-provider.tsx`, define quanto tempo os dados do Supabase ficam "frescos" na memória do navegador.
- **Configuração**: `staleTime: 30 minutos`.
- **Resultado**: Navegações repetidas para a mesma página dentro deste período carregam os dados em **0ms**.

### B. Next.js Router Cache (Camada de Estrutura RSC)
Configurado no `next.config.ts`, controla o cache da estrutura da página (React Server Components) no navegador.
- **Configuração**: `experimental.staleTimes.dynamic: 180` (3 minutos).
- **Resultado**: Elimina o re-carregamento do skeleton ao usar o botão "voltar" ou alternar entre abas rapidamente.

### C. Server-Side Prefetching
Realizado em componentes internos das páginas para que a hidratação no cliente ocorra sem disparar novas requisições de rede.

---

## 2. Streaming Progressivo (Conteúdo Estático Imediato)

**Regra de Ouro**: Evite o uso de arquivos `loading.tsx` em rotas que possuem cabeçalhos, filtros ou menus estáticos. O `loading.tsx` bloqueia a renderização de toda a página até que o servidor termine o processamento.

### Como implementar:
1.  **Remova o `loading.tsx`** da pasta da rota.
2.  No `page.tsx` (Server Component), mantenha o layout estático no componente principal.
3.  Crie um componente assíncrono (ex: `DataWrapper`) para realizar o fetch e envolva-o em um `Suspense` manual.

```tsx
// Exemplo de estrutura ideal
export default async function Page() {
  return (
    <div className="layout">
      {/* Este cabeçalho aparece instantaneamente (0ms) */}
      <header><h1>Título Estático</h1></header>

      {/* Apenas a lista mostra o Skeleton enquanto carrega */}
      <Suspense fallback={<MySkeleton />}>
        <AsyncDataContainer />
      </Suspense>
    </div>
  )
}
```

---

## 3. Prefetch on Hover Agressivo

Utilizamos o evento `onMouseEnter` em links e cards para antecipar a ação do usuário. Isso reduz a latência percebida para quase zero.

### Implementação Recomendada:
Sempre dispare o prefetch da **rota** (Next.js) e dos **dados** (TanStack Query) simultaneamente.

```tsx
"use client"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

export function NavLink({ href, queryKey, queryFn }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handlePrefetch = () => {
    router.prefetch(href) // Prepara o código da página
    queryClient.prefetchQuery({ queryKey, queryFn }) // Prepara os dados JSON
  }

  return (
    <Link href={href} onMouseEnter={handlePrefetch}>
      Navegar
    </Link>
  )
}
```

---

## 4. Design de Skeletons Anti-CLS

Para evitar o **Cumulative Layout Shift (Salto de Layout)**, os skeletons devem:
- Possuir as mesmas dimensões (altura/largura) do conteúdo final.
- Mimicizar a estrutura visual (ex: cards, linhas de tabela) em vez de usar spinners genéricos.
- Estar localizados exatamente onde os dados dinâmicos serão inseridos.

## Resumo do Ciclo de Performance

| Evento | Ação | Experiência do Usuário |
| :--- | :--- | :--- |
| **Hover** | Prefetch Rota + Dados | Silencioso (Antecipação) |
| **Clique** | Troca de Rota | Instantânea (Estrutura aparece na hora) |
| **Streaming** | Carregamento assíncrono | Skeleton granular aparece apenas no dado |
| **Sucesso** | Hidratação | Dados substituem o skeleton sem pulos |
| **Retorno** | Cache de Memória | 0ms (App Nativo) |
