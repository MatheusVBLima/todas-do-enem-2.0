"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { UserCost } from "@/server/actions/admin"

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
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user, index) => (
            <TableRow key={user.userId}>
              <TableCell>
                <span className="font-medium">{user.userName}</span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-mono font-semibold">
                  R$ {user.totalCostBRL.toFixed(2)}
                </span>
                {index === 0 && (
                  <Badge className="ml-2">
                    Top #1
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/conta/admin/usuarios/${user.userId}`}>
                    <Eye className="size-4 mr-1" />
                    Ver
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
