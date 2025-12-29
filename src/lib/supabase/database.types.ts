/**
 * Database types for Supabase
 * Generated manually based on schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          email: string
          name: string | null
          plan: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          plan?: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          plan?: string
          createdAt?: string
          updatedAt?: string
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
        Relationships: [
          {
            foreignKeyName: "Question_examId_fkey"
            columns: ["examId"]
            referencedRelation: "Exam"
            referencedColumns: ["id"]
          }
        ]
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
          color?: string
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
        Relationships: [
          {
            foreignKeyName: "QuestionGroup_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "QuestionsOnGroups_questionId_fkey"
            columns: ["questionId"]
            referencedRelation: "Question"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "QuestionsOnGroups_groupId_fkey"
            columns: ["groupId"]
            referencedRelation: "QuestionGroup"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "Essay_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "EssayCorrection_essayId_fkey"
            columns: ["essayId"]
            referencedRelation: "Essay"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_cuid: {
        Args: Record<string, never>
        Returns: string
      }
      get_questions_with_filters: {
        Args: {
          p_anos?: number[] | null
          p_areas?: string[] | null
          p_disciplinas?: string[] | null
          p_busca?: string | null
          p_offset?: number
          p_limit?: number
        }
        Returns: {
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
          exam: Json
          total_count: number
        }[]
      }
      submit_essay_for_correction: {
        Args: {
          p_essay_id: string
        }
        Returns: Json
      }
      save_essay_correction: {
        Args: {
          p_essay_id: string
          p_comp1_score: number
          p_comp1_feedback: string
          p_comp2_score: number
          p_comp2_feedback: string
          p_comp3_score: number
          p_comp3_feedback: string
          p_comp4_score: number
          p_comp4_feedback: string
          p_comp5_score: number
          p_comp5_feedback: string
          p_total_score: number
          p_general_feedback: string
        }
        Returns: Json
      }
      set_current_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      update_updated_at_column: {
        Args: Record<string, never>
        Returns: unknown
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
