"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { UserCost } from "@/server/actions/admin"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UserCostsTableProps {
  data: UserCost[]
  isLoading: boolean
}

export function UserCostsTable({ data, isLoading }: UserCostsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Nenhum uso de IA registrado ainda
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead className="text-right">Custo Total</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Requisições</TableHead>
            <TableHead className="text-right">Cache Hits</TableHead>
            <TableHead className="text-right">Último Uso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user, index) => {
            const cacheHitRate = user.totalRequests > 0
              ? ((user.cacheHits / user.totalRequests) * 100).toFixed(1)
              : '0.0'

            return (
              <TableRow key={user.userId}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.userName}</span>
                    <span className="text-xs text-muted-foreground">{user.userEmail}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono font-semibold">
                    R$ {user.totalCostBRL.toFixed(2)}
                  </span>
                  {index === 0 && (
                    <Badge variant="destructive" className="ml-2">
                      Top #1
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {user.totalTokens.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {user.totalRequests.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-sm">{user.cacheHits}</span>
                    <span className="text-xs text-muted-foreground">
                      {cacheHitRate}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(user.lastUsed), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
