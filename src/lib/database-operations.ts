import { supabase } from "@/lib/supabase";
import {
  TrainingInsert,
  TrainingUpdate,
  ExerciseInsert,
  ExerciseUpdate,
  RoundInsert,
  RoundUpdate,
  CreateExerciseForm,
  CreateRoundForm,
  trainingInsertSchema,
  exerciseInsertSchema,
  roundInsertSchema,
} from "@/schemas/database";

// Types for database operations (matching Supabase expectations)
type DatabaseTraining = {
  id: string;
  user_id: string;
  comments: string | null;
  created_at: string;
  updated_at: string;
};

type DatabaseExercise = {
  id: string;
  training_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type DatabaseRound = {
  id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  comments: string | null;
  created_at: string;
};

type TrainingWithExercises = DatabaseTraining & {
  exercises: (DatabaseExercise & {
    rounds: DatabaseRound[];
  })[];
};

// Training operations
export async function getUserTrainings(
  userId: string,
): Promise<TrainingWithExercises[]> {
  const { data, error } = await supabase
    .from("trainings")
    .select(
      `
      *,
      exercises (
        *,
        rounds (*)
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as TrainingWithExercises[];
}

export async function createTraining(
  training: TrainingInsert,
): Promise<DatabaseTraining> {
  const validatedTraining = trainingInsertSchema.parse(training);

  const { data, error } = await supabase
    .from("trainings")
    .insert(validatedTraining as any)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseTraining;
}

export async function updateTraining(
  id: string,
  training: TrainingUpdate,
): Promise<DatabaseTraining> {
  const { data, error } = await supabase
    .from("trainings")
    .update(training as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseTraining;
}

export async function deleteTraining(id: string): Promise<void> {
  const { error } = await supabase.from("trainings").delete().eq("id", id);

  if (error) throw error;
}

// Exercise operations
export async function createExercise(
  exercise: ExerciseInsert,
): Promise<DatabaseExercise> {
  const validatedExercise = exerciseInsertSchema.parse(exercise);

  const { data, error } = await supabase
    .from("exercises")
    .insert(validatedExercise)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseExercise;
}

export async function updateExercise(
  id: string,
  exercise: ExerciseUpdate,
): Promise<DatabaseExercise> {
  const { data, error } = await supabase
    .from("exercises")
    .update(exercise as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseExercise;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from("exercises").delete().eq("id", id);

  if (error) throw error;
}

// Round operations
export async function createRound(round: RoundInsert): Promise<DatabaseRound> {
  const validatedRound = roundInsertSchema.parse(round);

  const { data, error } = await supabase
    .from("rounds")
    .insert(validatedRound as any)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseRound;
}

export async function updateRound(
  id: string,
  round: RoundUpdate,
): Promise<DatabaseRound> {
  const { data, error } = await supabase
    .from("rounds")
    .update(round as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseRound;
}

export async function deleteRound(id: string): Promise<void> {
  const { error } = await supabase.from("rounds").delete().eq("id", id);

  if (error) throw error;
}

// Bulk operations
export async function createTrainingWithExercises(
  training: TrainingInsert,
  exercises: (CreateExerciseForm & { rounds: CreateRoundForm[] })[],
): Promise<TrainingWithExercises> {
  // Create training first
  const createdTraining = await createTraining(training);

  // Create exercises with their rounds
  const createdExercises = await Promise.all(
    exercises.map(async (exercise) => {
      const exerciseWithTrainingId = {
        name: exercise.name,
        training_id: createdTraining.id,
      };
      const createdExercise = await createExercise(exerciseWithTrainingId);

      // Create rounds for this exercise
      const createdRounds = await Promise.all(
        exercise.rounds.map((round) =>
          createRound({
            weight: round.weight,
            reps: round.reps,
            comments: round.comments || null,
            exercise_id: createdExercise.id,
          }),
        ),
      );

      return { ...createdExercise, rounds: createdRounds };
    }),
  );

  return { ...createdTraining, exercises: createdExercises };
}
