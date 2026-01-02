export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      AIUsage: {
        Row: {
          cacheHit: boolean
          completionTokens: number
          createdAt: string
          errorMessage: string | null
          estimatedCostBRL: number
          id: string
          metadata: Json | null
          promptTokens: number
          resourceId: string | null
          status: string
          totalTokens: number
          type: string
          userId: string
        }
        Insert: {
          cacheHit?: boolean
          completionTokens?: number
          createdAt?: string
          errorMessage?: string | null
          estimatedCostBRL?: number
          id?: string
          metadata?: Json | null
          promptTokens?: number
          resourceId?: string | null
          status?: string
          totalTokens?: number
          type: string
          userId: string
        }
        Update: {
          cacheHit?: boolean
          completionTokens?: number
          createdAt?: string
          errorMessage?: string | null
          estimatedCostBRL?: number
          id?: string
          metadata?: Json | null
          promptTokens?: number
          resourceId?: string | null
          status?: string
          totalTokens?: number
          type?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "AIUsage_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Essay: {
        Row: {
          content: string
          createdAt: string
          id: string
          status: string
          theme: string | null
          title: string | null
          updatedAt: string
          userId: string
          wordCount: number
        }
        Insert: {
          content: string
          createdAt?: string
          id?: string
          status?: string
          theme?: string | null
          title?: string | null
          updatedAt?: string
          userId: string
          wordCount?: number
        }
        Update: {
          content?: string
          createdAt?: string
          id?: string
          status?: string
          theme?: string | null
          title?: string | null
          updatedAt?: string
          userId?: string
          wordCount?: number
        }
        Relationships: [
          {
            foreignKeyName: "Essay_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      EssayCorrection: {
        Row: {
          competence1Feedback: string
          competence1Score: number
          competence2Feedback: string
          competence2Score: number
          competence3Feedback: string
          competence3Score: number
          competence4Feedback: string
          competence4Score: number
          competence5Feedback: string
          competence5Score: number
          createdAt: string
          essayId: string
          generalFeedback: string
          id: string
          totalScore: number
        }
        Insert: {
          competence1Feedback: string
          competence1Score: number
          competence2Feedback: string
          competence2Score: number
          competence3Feedback: string
          competence3Score: number
          competence4Feedback: string
          competence4Score: number
          competence5Feedback: string
          competence5Score: number
          createdAt?: string
          essayId: string
          generalFeedback: string
          id?: string
          totalScore: number
        }
        Update: {
          competence1Feedback?: string
          competence1Score?: number
          competence2Feedback?: string
          competence2Score?: number
          competence3Feedback?: string
          competence3Score?: number
          competence4Feedback?: string
          competence4Score?: number
          competence5Feedback?: string
          competence5Score?: number
          createdAt?: string
          essayId?: string
          generalFeedback?: string
          id?: string
          totalScore?: number
        }
        Relationships: [
          {
            foreignKeyName: "EssayCorrection_essayId_fkey"
            columns: ["essayId"]
            isOneToOne: true
            referencedRelation: "Essay"
            referencedColumns: ["id"]
          },
        ]
      }
      Exam: {
        Row: {
          color: string | null
          createdAt: string | null
          description: string | null
          id: string
          pdfUrl: string | null
          season: string | null
          testDate: string | null
          updatedAt: string | null
          year: number
        }
        Insert: {
          color?: string | null
          createdAt?: string | null
          description?: string | null
          id?: string
          pdfUrl?: string | null
          season?: string | null
          testDate?: string | null
          updatedAt?: string | null
          year: number
        }
        Update: {
          color?: string | null
          createdAt?: string | null
          description?: string | null
          id?: string
          pdfUrl?: string | null
          season?: string | null
          testDate?: string | null
          updatedAt?: string | null
          year?: number
        }
        Relationships: []
      }
      Question: {
        Row: {
          aiExplanation: string | null
          context: string | null
          correctAnswer: string
          examId: string
          id: string
          imageUrl: string | null
          knowledgeArea: string
          languageOption: string | null
          optionA: string
          optionB: string
          optionC: string
          optionD: string
          optionE: string
          questionNumber: number
          statement: string
          subject: string
          supportingMaterials: Json | null
        }
        Insert: {
          aiExplanation?: string | null
          context?: string | null
          correctAnswer: string
          examId: string
          id?: string
          imageUrl?: string | null
          knowledgeArea: string
          languageOption?: string | null
          optionA: string
          optionB: string
          optionC: string
          optionD: string
          optionE: string
          questionNumber: number
          statement: string
          subject: string
          supportingMaterials?: Json | null
        }
        Update: {
          aiExplanation?: string | null
          context?: string | null
          correctAnswer?: string
          examId?: string
          id?: string
          imageUrl?: string | null
          knowledgeArea?: string
          languageOption?: string | null
          optionA?: string
          optionB?: string
          optionC?: string
          optionD?: string
          optionE?: string
          questionNumber?: number
          statement?: string
          subject?: string
          supportingMaterials?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "Question_examId_fkey"
            columns: ["examId"]
            isOneToOne: false
            referencedRelation: "Exam"
            referencedColumns: ["id"]
          },
        ]
      }
      QuestionGroup: {
        Row: {
          color: string
          createdAt: string
          description: string | null
          id: string
          name: string
          savedFilters: Json | null
          updatedAt: string
          userId: string
        }
        Insert: {
          color?: string
          createdAt?: string
          description?: string | null
          id?: string
          name: string
          savedFilters?: Json | null
          updatedAt?: string
          userId: string
        }
        Update: {
          color?: string
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          savedFilters?: Json | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "QuestionGroup_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      QuestionsOnGroups: {
        Row: {
          addedAt: string
          groupId: string
          questionId: string
        }
        Insert: {
          addedAt?: string
          groupId: string
          questionId: string
        }
        Update: {
          addedAt?: string
          groupId?: string
          questionId?: string
        }
        Relationships: [
          {
            foreignKeyName: "QuestionsOnGroups_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "QuestionGroup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "QuestionsOnGroups_questionId_fkey"
            columns: ["questionId"]
            isOneToOne: false
            referencedRelation: "Question"
            referencedColumns: ["id"]
          },
        ]
      }
      Simulado: {
        Row: {
          appliedFilters: Json | null
          completedAt: string | null
          createdAt: string
          id: string
          name: string
          sourceGroupId: string | null
          sourceType: string
          startedAt: string
          status: string
          timeLimit: number | null
          totalQuestions: number
          updatedAt: string
          userId: string
        }
        Insert: {
          appliedFilters?: Json | null
          completedAt?: string | null
          createdAt?: string
          id?: string
          name: string
          sourceGroupId?: string | null
          sourceType?: string
          startedAt?: string
          status?: string
          timeLimit?: number | null
          totalQuestions: number
          updatedAt?: string
          userId: string
        }
        Update: {
          appliedFilters?: Json | null
          completedAt?: string | null
          createdAt?: string
          id?: string
          name?: string
          sourceGroupId?: string | null
          sourceType?: string
          startedAt?: string
          status?: string
          timeLimit?: number | null
          totalQuestions?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Simulado_sourceGroupId_fkey"
            columns: ["sourceGroupId"]
            isOneToOne: false
            referencedRelation: "QuestionGroup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Simulado_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      SimuladoQuestao: {
        Row: {
          answeredAt: string | null
          isCorrect: boolean | null
          position: number
          questionId: string
          simuladoId: string
          userAnswer: string | null
        }
        Insert: {
          answeredAt?: string | null
          isCorrect?: boolean | null
          position: number
          questionId: string
          simuladoId: string
          userAnswer?: string | null
        }
        Update: {
          answeredAt?: string | null
          isCorrect?: boolean | null
          position?: number
          questionId?: string
          simuladoId?: string
          userAnswer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "SimuladoQuestao_questionId_fkey"
            columns: ["questionId"]
            isOneToOne: false
            referencedRelation: "Question"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "SimuladoQuestao_simuladoId_fkey"
            columns: ["simuladoId"]
            isOneToOne: false
            referencedRelation: "Simulado"
            referencedColumns: ["id"]
          },
        ]
      }
      SimuladoResultado: {
        Row: {
          completedAt: string
          correctAnswers: number
          createdAt: string
          id: string
          scoreByArea: Json
          simuladoId: string
          timeTaken: number | null
          totalScore: number
          unansweredQuestions: number
          wrongAnswers: number
        }
        Insert: {
          completedAt?: string
          correctAnswers: number
          createdAt?: string
          id?: string
          scoreByArea: Json
          simuladoId: string
          timeTaken?: number | null
          totalScore: number
          unansweredQuestions: number
          wrongAnswers: number
        }
        Update: {
          completedAt?: string
          correctAnswers?: number
          createdAt?: string
          id?: string
          scoreByArea?: Json
          simuladoId?: string
          timeTaken?: number | null
          totalScore?: number
          unansweredQuestions?: number
          wrongAnswers?: number
        }
        Relationships: [
          {
            foreignKeyName: "SimuladoResultado_simuladoId_fkey"
            columns: ["simuladoId"]
            isOneToOne: true
            referencedRelation: "Simulado"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
          name: string | null
          plan: string
          role: string
          stripeCurrentPeriodEnd: string | null
          stripeCustomerId: string | null
          stripePriceId: string | null
          stripeSubscriptionId: string | null
          stripeSubscriptionStatus: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id?: string
          name?: string | null
          plan?: string
          role?: string
          stripeCurrentPeriodEnd?: string | null
          stripeCustomerId?: string | null
          stripePriceId?: string | null
          stripeSubscriptionId?: string | null
          stripeSubscriptionStatus?: string | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          name?: string | null
          plan?: string
          role?: string
          stripeCurrentPeriodEnd?: string | null
          stripeCustomerId?: string | null
          stripePriceId?: string | null
          stripeSubscriptionId?: string | null
          stripeSubscriptionStatus?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      UserAIQuota: {
        Row: {
          currentPeriodEnd: string
          currentPeriodStart: string
          essaysLimit: number
          essaysUsed: number
          id: string
          questionsLimit: number
          questionsUsed: number
          totalCostBRL: number
          totalTokensUsed: number
          updatedAt: string
          userId: string
        }
        Insert: {
          currentPeriodEnd: string
          currentPeriodStart: string
          essaysLimit?: number
          essaysUsed?: number
          id?: string
          questionsLimit?: number
          questionsUsed?: number
          totalCostBRL?: number
          totalTokensUsed?: number
          updatedAt?: string
          userId: string
        }
        Update: {
          currentPeriodEnd?: string
          currentPeriodStart?: string
          essaysLimit?: number
          essaysUsed?: number
          id?: string
          questionsLimit?: number
          questionsUsed?: number
          totalCostBRL?: number
          totalTokensUsed?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserAIQuota_userId_fkey"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_or_initialize_user_quota: {
        Args: { p_user_id: string; p_user_plan: string }
        Returns: {
          current_period_end: string
          essays_limit: number
          essays_used: number
          questions_limit: number
          questions_used: number
        }[]
      }
      generate_cuid: { Args: never; Returns: string }
      get_costs_by_user: {
        Args: never
        Returns: {
          cacheHits: number
          lastUsed: string
          totalCostBRL: number
          totalRequests: number
          totalTokens: number
          userEmail: string
          userId: string
          userName: string
        }[]
      }
      get_questions_with_filters: {
        Args: {
          p_anos?: number[]
          p_areas?: string[]
          p_busca?: string
          p_disciplinas?: string[]
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          aiExplanation: string
          context: string
          correctAnswer: string
          exam: Json
          examId: string
          id: string
          imageUrl: string
          knowledgeArea: string
          languageOption: string
          optionA: string
          optionB: string
          optionC: string
          optionD: string
          optionE: string
          questionNumber: number
          statement: string
          subject: string
          supportingMaterials: Json
          total_count: number
        }[]
      }
      get_total_ai_costs: {
        Args: never
        Returns: {
          cacheHitRate: number
          cacheHits: number
          totalCostBRL: number
          totalRequests: number
          totalTokens: number
        }[]
      }
      increment_ai_usage: {
        Args: {
          p_cost_brl: number
          p_tokens: number
          p_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      log_ai_usage: {
        Args: {
          p_cache_hit: boolean
          p_completion_tokens: number
          p_cost_brl: number
          p_error_message?: string
          p_prompt_tokens: number
          p_resource_id: string
          p_status: string
          p_total_tokens: number
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      save_essay_correction: {
        Args: {
          p_comp1_feedback: string
          p_comp1_score: number
          p_comp2_feedback: string
          p_comp2_score: number
          p_comp3_feedback: string
          p_comp3_score: number
          p_comp4_feedback: string
          p_comp4_score: number
          p_comp5_feedback: string
          p_comp5_score: number
          p_essay_id: string
          p_general_feedback: string
          p_total_score: number
        }
        Returns: Json
      }
      search_questions_with_trigrams: {
        Args: {
          p_anos?: number[]
          p_areas?: string[]
          p_busca: string
          p_disciplinas?: string[]
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          aiExplanation: string
          context: string
          correctAnswer: string
          exam: Json
          examId: string
          id: string
          imageUrl: string
          knowledgeArea: string
          languageOption: string
          optionA: string
          optionB: string
          optionC: string
          optionD: string
          optionE: string
          questionNumber: number
          statement: string
          subject: string
          supportingMaterials: Json
          total_count: number
        }[]
      }
      set_current_user: { Args: { user_id: string }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      submit_essay_for_correction: {
        Args: { p_essay_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
