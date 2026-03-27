import { supabase } from "@/lib/supabase";
import {
  type KettlebellTrainingInsert,
  type KettlebellTrainingUpdate,
  type KettlebellExerciseInsert,
  type KettlebellExerciseUpdate,
  type KettlebellRoundInsert,
  type KettlebellRoundUpdate,
  kettlebellTrainingInsertSchema,
  kettlebellExerciseInsertSchema,
  kettlebellRoundInsertSchema,
} from "@/schemas/kettlebell";

type DatabaseKettlebellTraining = {
  id: string;
  user_id: string;
  name: string;
  completed: boolean;
  links: string[];
  comments: string | null;
  created_at: string;
};

type DatabaseKettlebellExercise = {
  id: string;
  training_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type DatabaseKettlebellRound = {
  id: string;
  exercise_id: string;
  weight: number;
  reps: number | null;
  time_minutes: number | null;
  comments: string | null;
  completed: boolean;
  created_at: string;
};

type KettlebellTrainingWithExercises = DatabaseKettlebellTraining & {
  kettlebell_exercises: (DatabaseKettlebellExercise & {
    kettlebell_rounds: DatabaseKettlebellRound[];
  })[];
};

export type { KettlebellTrainingWithExercises };

export async function getUserKettlebellTrainings(
  userId: string,
): Promise<KettlebellTrainingWithExercises[]> {
  const { data, error } = await supabase
    .from("kettlebell_trainings")
    .select(
      `
      *,
      kettlebell_exercises (
        id,
        training_id,
        name,
        created_at,
        updated_at,
        kettlebell_rounds (
          id,
          exercise_id,
          weight,
          reps,
          time_minutes,
          comments,
          completed,
          created_at
        )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const sorted = data.map((training: KettlebellTrainingWithExercises) => ({
    ...training,
    kettlebell_exercises: training.kettlebell_exercises
      .map((exercise) => ({
        ...exercise,
        kettlebell_rounds: exercise.kettlebell_rounds.sort((a, b) => {
          const aTime = new Date(a.created_at).getTime();
          const bTime = new Date(b.created_at).getTime();
          if (aTime !== bTime) {
            return aTime - bTime;
          }
          return a.id.localeCompare(b.id);
        }),
      }))
      .sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        if (aTime !== bTime) {
          return aTime - bTime;
        }
        return a.id.localeCompare(b.id);
      }),
  }));

  return sorted;
}

export async function createKettlebellTraining(
  training: KettlebellTrainingInsert,
): Promise<DatabaseKettlebellTraining> {
  const validatedTraining = kettlebellTrainingInsertSchema.parse(training);

  const { data, error } = await supabase
    .from("kettlebell_trainings")
    .insert(validatedTraining)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseKettlebellTraining;
}

export async function updateKettlebellTraining(
  id: string,
  training: KettlebellTrainingUpdate,
): Promise<DatabaseKettlebellTraining> {
  const { data, error } = await supabase
    .from("kettlebell_trainings")
    .update(training as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseKettlebellTraining;
}

export async function deleteKettlebellTraining(id: string): Promise<void> {
  const { error } = await supabase
    .from("kettlebell_trainings")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function createKettlebellExercise(
  exercise: KettlebellExerciseInsert,
): Promise<DatabaseKettlebellExercise> {
  const validatedExercise = kettlebellExerciseInsertSchema.parse(exercise);

  const { data, error } = await supabase
    .from("kettlebell_exercises")
    .insert(validatedExercise)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseKettlebellExercise;
}

export async function updateKettlebellExercise(
  id: string,
  exercise: KettlebellExerciseUpdate,
): Promise<DatabaseKettlebellExercise> {
  const { data, error } = await supabase
    .from("kettlebell_exercises")
    .update(exercise as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseKettlebellExercise;
}

export async function deleteKettlebellExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from("kettlebell_exercises")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function createKettlebellRound(
  round: KettlebellRoundInsert,
): Promise<DatabaseKettlebellRound> {
  const validatedRound = kettlebellRoundInsertSchema.parse(round);

  const { data, error } = await supabase
    .from("kettlebell_rounds")
    .insert(validatedRound as any)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseKettlebellRound;
}

export async function updateKettlebellRound(
  id: string,
  round: KettlebellRoundUpdate,
): Promise<DatabaseKettlebellRound> {
  const { data, error } = await supabase
    .from("kettlebell_rounds")
    .update(round as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DatabaseKettlebellRound;
}

export async function deleteKettlebellRound(id: string): Promise<void> {
  const { error } = await supabase
    .from("kettlebell_rounds")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function createKettlebellTrainingWithExercises(
  training: KettlebellTrainingInsert,
  exercises: Array<{
    name: string;
    rounds: Array<{
      weight: number;
      reps?: number;
      time_minutes?: number;
      comments?: string | null;
      completed?: boolean;
    }>;
  }>,
): Promise<KettlebellTrainingWithExercises> {
  const createdTraining = await createKettlebellTraining(training);

  const createdExercises = await Promise.all(
    exercises.map(async (exercise) => {
      const createdExercise = await createKettlebellExercise({
        training_id: createdTraining.id,
        name: exercise.name,
      });

      const createdRounds = await Promise.all(
        exercise.rounds.map((round) =>
          createKettlebellRound({
            exercise_id: createdExercise.id,
            weight: round.weight,
            reps: round.reps,
            time_minutes: round.time_minutes,
            comments: round.comments ?? null,
            completed: round.completed ?? false,
          }),
        ),
      );

      return {
        ...createdExercise,
        kettlebell_rounds: createdRounds,
      };
    }),
  );

  return {
    ...createdTraining,
    kettlebell_exercises: createdExercises,
  };
}
