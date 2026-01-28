"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReportQuestionDialog } from "./report-question-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ReportQuestionButtonProps {
  questionId: string
  variant?: "default" | "icon"
}

export function ReportQuestionButton({
  questionId,
  variant = "icon",
}: ReportQuestionButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (variant === "icon") {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDialogOpen(true)}
                aria-label="Reportar problema"
              >
                <Flag className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reportar problema</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ReportQuestionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          questionId={questionId}
        />
      </>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
      >
        <Flag className="mr-2 size-4" />
        Reportar
      </Button>

      <ReportQuestionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        questionId={questionId}
      />
    </>
  )
}
