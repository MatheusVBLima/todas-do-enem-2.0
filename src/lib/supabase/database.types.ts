export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Supabase generated types.
 *
 * These were recreated manually from the current schema so we have
 * the Insert/Update helpers that the Supabase client expects. The
 * prior file only had Row definitions, which caused type inference
 * to resolve `.update()` payloads to `never`.
 */
export type Database = {
  public: {
    Tables: {
      AIUsage: {
        Row: {
          id: string
          userId: string
          type: string
          resourceId: string | null
          promptTokens: number
          completionTokens: number
          totalTokens: number
          estimatedCostBRL: number
          cacheHit: boolean
          status: string
          errorMessage: string | null
          metadata: Json | null
          createdAt: string
        }
        Insert: {
          id?: string
          userId: string
          type: string
          resourceId?: string | null
          promptTokens?: number
          completionTokens?: number
          totalTokens?: number
          estimatedCostBRL?: number
          cacheHit?: boolean
          status?: string
          errorMessage?: string | null
          metadata?: Json | null
          createdAt?: string
        }
        Update: {
          id?: string
          userId?: string
          type?: string
          resourceId?: string | null
          promptTokens?: number
          completionTokens?: number
          totalTokens?: number
          estimatedCostBRL?: number
          cacheHit?: boolean
          status?: string
          errorMessage?: string | null
          metadata?: Json | null
          createdAt?: string
        }
        Relationships: []
      }
      Essay: {
        Row: {
          id: string
          userId: string
          title: string | null
          theme: string | null
          content: string
          wordCount: number
          status: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          title?: string | null
          theme?: string | null
          content: string
          wordCount?: number
          status?: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          title?: string | null
          theme?: string | null
          content?: string
          wordCount?: number
          status?: string
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      EssayCorrection: {
        Row: {
          id: string
          essayId: string
          competence1Score: number
          competence1Feedback: string
          competence2Score: number
          competence2Feedback: string
          competence3Score: number
          competence3Feedback: string
          competence4Score: number
          competence4Feedback: string
          competence5Score: number
          competence5Feedback: string
          totalScore: number
          generalFeedback: string
          createdAt: string
        }
        Insert: {
          id?: string
          essayId: string
          competence1Score: number
          competence1Feedback: string
          competence2Score: number
          competence2Feedback: string
          competence3Score: number
          competence3Feedback: string
          competence4Score: number
          competence4Feedback: string
          competence5Score: number
          competence5Feedback: string
          totalScore: number
          generalFeedback: string
          createdAt?: string
        }
        Update: {
          id?: string
          essayId?: string
          competence1Score?: number
          competence1Feedback?: string
          competence2Score?: number
          competence2Feedback?: string
          competence3Score?: number
          competence3Feedback?: string
          competence4Score?: number
          competence4Feedback?: string
          competence5Score?: number
          competence5Feedback?: string
          totalScore?: number
          generalFeedback?: string
          createdAt?: string
        }
        Relationships: []
      }
      Exam: {
        Row: {
          id: string
          year: number
        }
        Insert: {
          id?: string
          year: number
        }
        Update: {
          id?: string
          year?: number
        }
        Relationships: []
      }
      Question: {
        Row: {
          id: string
          examId: string
          questionNumber: number
          knowledgeArea: string
          subject: string
          statement: string
          context: string | null
          optionA: string
          optionB: string
          optionC: string
          optionD: string
          optionE: string
          correctAnswer: string
          imageUrl: string | null
          supportingMaterials: Json | null
          languageOption: string | null
          aiExplanation: string | null
        }
        Insert: {
          id?: string
          examId: string
          questionNumber: number
          knowledgeArea: string
          subject: string
          statement: string
          context?: string | null
          optionA: string
          optionB: string
          optionC: string
          optionD: string
          optionE: string
          correctAnswer: string
          imageUrl?: string | null
          supportingMaterials?: Json | null
          languageOption?: string | null
          aiExplanation?: string | null
        }
        Update: {
          id?: string
          examId?: string
          questionNumber?: number
          knowledgeArea?: string
          subject?: string
          statement?: string
          context?: string | null
          optionA?: string
          optionB?: string
          optionC?: string
          optionD?: string
          optionE?: string
          correctAnswer?: string
          imageUrl?: string | null
          supportingMaterials?: Json | null
          languageOption?: string | null
          aiExplanation?: string | null
        }
        Relationships: []
      }
      QuestionGroup: {
        Row: {
          id: string
          userId: string
          name: string
          description: string | null
          color: string
          savedFilters: Json | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          name: string
          description?: string | null
          color: string
          savedFilters?: Json | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          name?: string
          description?: string | null
          color?: string
          savedFilters?: Json | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      QuestionsOnGroups: {
        Row: {
          questionId: string
          groupId: string
          addedAt: string
        }
        Insert: {
          questionId: string
          groupId: string
          addedAt?: string
        }
        Update: {
          questionId?: string
          groupId?: string
          addedAt?: string
        }
        Relationships: []
      }
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
        Insert: {
          id?: string
          email: string
          name?: string | null
          plan?: string
          role?: string
          createdAt?: string
          updatedAt?: string
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          stripeSubscriptionStatus?: string | null
          stripePriceId?: string | null
          stripeCurrentPeriodEnd?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          plan?: string
          role?: string
          createdAt?: string
          updatedAt?: string
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          stripeSubscriptionStatus?: string | null
          stripePriceId?: string | null
          stripeCurrentPeriodEnd?: string | null
        }
        Relationships: []
      }
      UserAIQuota: {
        Row: {
          id: string
          userId: string
          currentPeriodStart: string
          currentPeriodEnd: string
          questionsUsed: number
          questionsLimit: number
          essaysUsed: number
          essaysLimit: number
          totalTokensUsed: number
          totalCostBRL: number
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          currentPeriodStart: string
          currentPeriodEnd: string
          questionsUsed?: number
          questionsLimit?: number
          essaysUsed?: number
          essaysLimit?: number
          totalTokensUsed?: number
          totalCostBRL?: number
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          currentPeriodStart?: string
          currentPeriodEnd?: string
          questionsUsed?: number
          questionsLimit?: number
          essaysUsed?: number
          essaysLimit?: number
          totalTokensUsed?: number
          totalCostBRL?: number
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_or_initialize_user_quota: {
        Args: { p_user_id: string; p_user_plan: string }
        Returns: {
          questions_used: number
          questions_limit: number
          essays_used: number
          essays_limit: number
          current_period_end: string
        }
      }
      increment_ai_usage: {
        Args: {
          p_user_id: string
          p_user_plan?: string
          p_type: string
          p_tokens: number
          p_cost_brl: number
        }
        Returns: null
      }
      log_ai_usage: {
        Args: {
          p_user_id: string
          p_type: string
          p_resource_id?: string | null
          p_prompt_tokens: number
          p_completion_tokens: number
          p_total_tokens: number
          p_cost_brl?: number
          p_estimated_cost_brl?: number
          p_cache_hit?: boolean
          p_status?: string
          p_error_message?: string | null
          p_metadata?: Json | null
        }
        Returns: null
      }
      submit_essay_for_correction: {
        Args: { p_essay_id: string }
        Returns: null
      }
      save_essay_correction: {
        Args: {
          p_essay_id: string
          p_corrections?: Json
          p_total_score?: number
          p_general_feedback?: string
          p_comp1_score?: number
          p_comp1_feedback?: string
          p_comp2_score?: number
          p_comp2_feedback?: string
          p_comp3_score?: number
          p_comp3_feedback?: string
          p_comp4_score?: number
          p_comp4_feedback?: string
          p_comp5_score?: number
          p_comp5_feedback?: string
        }
        Returns: null
      }
      search_questions_with_trigrams: {
        Args: {
          p_busca?: string | null
          p_anos?: number[] | null
          p_areas?: string[] | null
          p_disciplinas?: string[] | null
          p_offset?: number
          p_limit?: number
        }
        Returns: Json[]
      }
      get_total_ai_costs: {
        Args: Record<string, never>
        Returns: Json
      }
      get_costs_by_user: {
        Args: Record<string, never>
        Returns: Json[]
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
