import { z } from "zod";

const uuidSchema = z.string().uuid();

export const kettlebellRoundSchema = z
  .object({
    id: uuidSchema.optional(),
    exercise_id: uuidSchema,
    weight: z.number().min(0, "Weight cannot be negative"),
    reps: z.number().int().positive("Reps must be a positive integer").optional(),
    time_minutes: z
      .number()
      .int()
      .positive("Time must be a positive number of minutes")
      .optional(),
    comments: z.string().nullable().optional(),
    completed: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      const hasReps = typeof data.reps === "number";
      const hasTime = typeof data.time_minutes === "number";
      return Number(hasReps) + Number(hasTime) === 1;
    },
    {
      message: "Provide either reps or time_minutes (exactly one)",
      path: ["reps"],
    },
  );

export const kettlebellRoundInsertSchema = kettlebellRoundSchema.omit({
  id: true,
  created_at: true,
});

export const kettlebellRoundUpdateSchema = kettlebellRoundSchema
  .partial()
  .omit({ id: true, created_at: true });

export const kettlebellExerciseSchema = z.object({
  id: uuidSchema.optional(),
  training_id: uuidSchema,
  name: z
    .string()
    .min(1, "Exercise name is required")
    .max(100, "Exercise name too long"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  rounds: z.array(kettlebellRoundSchema).optional(),
});

export const kettlebellExerciseInsertSchema = kettlebellExerciseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  rounds: true,
});

export const kettlebellExerciseUpdateSchema = kettlebellExerciseSchema
  .partial()
  .omit({ id: true, created_at: true, updated_at: true, rounds: true });

export const kettlebellTrainingSchema = z.object({
  id: uuidSchema.optional(),
  user_id: uuidSchema,
  name: z
    .string()
    .min(1, "Training name is required")
    .max(150, "Training name too long"),
  completed: z.boolean().default(false),
  links: z.array(z.string()).default([]),
  comments: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  exercises: z.array(kettlebellExerciseSchema).optional(),
});

export const kettlebellTrainingInsertSchema = kettlebellTrainingSchema.omit({
  id: true,
  created_at: true,
  exercises: true,
});

export const kettlebellTrainingUpdateSchema = kettlebellTrainingSchema
  .partial()
  .omit({ id: true, created_at: true, exercises: true });

export const kettlebellTrainingWithExercisesSchema = kettlebellTrainingSchema.extend({
  exercises: z.array(
    kettlebellExerciseSchema.extend({
      rounds: z.array(kettlebellRoundSchema),
    }),
  ),
});

export type KettlebellRound = z.infer<typeof kettlebellRoundSchema>;
export type KettlebellRoundInsert = z.infer<typeof kettlebellRoundInsertSchema>;
export type KettlebellRoundUpdate = z.infer<typeof kettlebellRoundUpdateSchema>;

export type KettlebellExercise = z.infer<typeof kettlebellExerciseSchema>;
export type KettlebellExerciseInsert = z.infer<typeof kettlebellExerciseInsertSchema>;
export type KettlebellExerciseUpdate = z.infer<typeof kettlebellExerciseUpdateSchema>;

export type KettlebellTraining = z.infer<typeof kettlebellTrainingSchema>;
export type KettlebellTrainingInsert = z.infer<typeof kettlebellTrainingInsertSchema>;
export type KettlebellTrainingUpdate = z.infer<typeof kettlebellTrainingUpdateSchema>;

export type KettlebellTrainingWithExercises = z.infer<
  typeof kettlebellTrainingWithExercisesSchema
>;
