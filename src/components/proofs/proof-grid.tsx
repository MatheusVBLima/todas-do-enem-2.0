"use client"

import { ProofCard } from "./proof-card"
import type { Proof } from "@/types"

interface ProofGridProps {
  proofs: Proof[]
}

export function ProofGrid({ proofs }: ProofGridProps) {
  if (proofs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">
          Nenhuma prova encontrada com os filtros aplicados.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {proofs.map((proof) => (
        <ProofCard key={proof.id} proof={proof} />
      ))}
    </div>
  )
}
