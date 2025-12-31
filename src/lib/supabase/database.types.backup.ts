export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          email: string
          name: string | null
          plan: string
          role: string
          createdAt: string
          updatedAt: string
          stripeCustomerId: string | null
          stripeSubscriptionId: string | null
          stripeSubscriptionStatus: string | null
          stripePriceId: string | null
          stripeCurrentPeriodEnd: string | null
        }
      }
    }
  }
}
