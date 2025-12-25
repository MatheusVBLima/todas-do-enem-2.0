// Usuário mock para desenvolvimento (sem Clerk)
// Em produção, isso será substituído pela integração com Clerk

export const DEV_USER = {
  id: 'dev-user-001',
  email: 'dev@todasdoenem.com.br',
  name: 'Desenvolvedor',
  plan: 'RUMO_A_APROVACAO' as const, // Plano pago para testar todas as features
} as const

export type DevUser = typeof DEV_USER

// Função para obter o usuário atual
// Em dev, retorna o mock. Em prod, usará Clerk.
export function getCurrentUser(): DevUser {
  // TODO: Em produção, integrar com Clerk
  // if (process.env.NODE_ENV === 'production') {
  //   return getClerkUser()
  // }
  return DEV_USER
}

// Verifica se o usuário tem plano pago
export function hasPaidPlan(plan: string): boolean {
  return plan === 'RUMO_A_APROVACAO'
}

// Verifica se o usuário pode usar features pagas
export function canUseAI(plan: string): boolean {
  return hasPaidPlan(plan)
}
