export type Database = {
  public: {
    Tables: {
      trainings: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          comments: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          comments?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          comments?: string | null
        }
      }
      exercises: {
        Row: {
          id: string
          training_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          training_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          training_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      rounds: {
        Row: {
          id: string
          exercise_id: string
          weight: number
          reps: number
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          exercise_id: string
          weight: number
          reps: number
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exercise_id?: string
          weight?: number
          reps?: number
          comments?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Simplified types for use in components
export type Training = Database['public']['Tables']['trainings']['Row']
export type TrainingInsert = Database['public']['Tables']['trainings']['Insert']
export type TrainingUpdate = Database['public']['Tables']['trainings']['Update']

export type Exercise = Database['public']['Tables']['exercises']['Row']
export type ExerciseInsert = Database['public']['Tables']['exercises']['Insert']
export type ExerciseUpdate = Database['public']['Tables']['exercises']['Update']

export type Round = Database['public']['Tables']['rounds']['Row']
export type RoundInsert = Database['public']['Tables']['rounds']['Insert']
export type RoundUpdate = Database['public']['Tables']['rounds']['Update']

// Enhanced types with relationships
export type TrainingWithExercises = Training & {
  exercises: (Exercise & {
    rounds: Round[]
  })[]
}
