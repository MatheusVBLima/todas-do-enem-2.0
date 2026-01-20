"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamic import for UserStatistics - heavy component with recharts
const UserStatistics = dynamic(
  () => import("./user-statistics").then(mod => mod.UserStatistics),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
)

interface UserStatisticsLazyProps {
  userId: string
}

export function UserStatisticsLazy({ userId }: UserStatisticsLazyProps) {
  return <UserStatistics userId={userId} />
}
