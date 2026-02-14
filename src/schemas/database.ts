import { z } from "zod";

// Base schemas for common fields
const baseTimestamps = z.object({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

const uuidSchema = z.string().uuid();

// Round schema
export const roundSchema = z.object({
  id: uuidSchema.optional(),
  exercise_id: uuidSchema,
  weight: z.number().positive("Weight must be positive"),
  reps: z.number().int().positive("Reps must be a positive integer"),
  comments: z.string().nullable().optional(),
  done: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
});

export const roundInsertSchema = roundSchema.omit({
  id: true,
  created_at: true,
});
export const roundUpdateSchema = roundSchema
  .partial()
  .omit({ id: true, created_at: true });

// Exercise schema
export const exerciseSchema = z.object({
  id: uuidSchema.optional(),
  training_id: uuidSchema,
  name: z
    .string()
    .min(1, "Exercise name is required")
    .max(100, "Exercise name too long"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  rounds: z.array(roundSchema).optional(),
});

export const exerciseInsertSchema = exerciseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  rounds: true,
});
export const exerciseUpdateSchema = exerciseSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
  rounds: true,
});

// Training schema
export const trainingSchema = z.object({
  id: uuidSchema.optional(),
  user_id: uuidSchema,
  status: z.enum(["plan", "done"]).default("plan"),
  comments: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  exercises: z.array(exerciseSchema).optional(),
});

export const trainingInsertSchema = trainingSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    exercises: true,
  })
  .extend({
    status: z.enum(["plan", "done"]).default("plan").optional(),
  });
export const trainingUpdateSchema = trainingSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
  exercises: true,
});

// Enhanced schema with relationships
export const trainingWithExercisesSchema = trainingSchema.extend({
  exercises: z.array(
    exerciseSchema.extend({
      rounds: z.array(roundSchema),
    }),
  ),
});

// Form schemas for validation
export const createTrainingFormSchema = z.object({
  comments: z.string().max(500, "Comments too long").optional(),
});

export const createExerciseFormSchema = z.object({
  name: z
    .string()
    .min(1, "Exercise name is required")
    .max(100, "Exercise name too long"),
});

export const createRoundFormSchema = z.object({
  weight: z.number().positive("Weight must be positive"),
  reps: z.number().int().positive("Reps must be a positive integer"),
  comments: z.string().max(200, "Comments too long").optional(),
});

// Type inference from Zod schemas
export type Round = z.infer<typeof roundSchema>;
export type RoundInsert = z.infer<typeof roundInsertSchema>;
export type RoundUpdate = z.infer<typeof roundUpdateSchema>;

export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseInsert = z.infer<typeof exerciseInsertSchema>;
export type ExerciseUpdate = z.infer<typeof exerciseUpdateSchema>;

export type Training = z.infer<typeof trainingSchema>;
export type TrainingInsert = z.infer<typeof trainingInsertSchema>;
export type TrainingUpdate = z.infer<typeof trainingUpdateSchema>;

export type TrainingWithExercises = z.infer<typeof trainingWithExercisesSchema>;

export type CreateTrainingForm = z.infer<typeof createTrainingFormSchema>;
export type CreateExerciseForm = z.infer<typeof createExerciseFormSchema>;
export type CreateRoundForm = z.infer<typeof createRoundFormSchema>;
