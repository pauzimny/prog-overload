"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import {
  type CreateTrainingForm,
  type CreateExerciseForm,
  type CreateRoundForm,
  TrainingInsert,
  ExerciseInsert,
  RoundInsert,
} from "@/schemas/database";
import { createTrainingWithExercises } from "@/lib/database-operations";
import { useRouter } from "next/navigation";

interface CreateTrainingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExerciseWithRounds extends CreateExerciseForm {
  rounds: CreateRoundForm[];
}

export default function CreateTrainingForm({
  isOpen,
  onClose,
}: CreateTrainingFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [training, setTraining] = useState<CreateTrainingForm>({
    comments: "",
  });

  const [exercises, setExercises] = useState<ExerciseWithRounds[]>([
    {
      name: "",
      rounds: [{ weight: 0, reps: 0, comments: "" }],
    },
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: "",
        rounds: [{ weight: 0, reps: 0, comments: "" }],
      },
    ]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const updateExercise = (
    index: number,
    field: keyof CreateExerciseForm,
    value: string,
  ) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const addRound = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].rounds.push({
      weight: 0,
      reps: 0,
      comments: "",
    });
    setExercises(newExercises);
  };

  const removeRound = (exerciseIndex: number, roundIndex: number) => {
    const newExercises = [...exercises];
    if (newExercises[exerciseIndex].rounds.length > 1) {
      newExercises[exerciseIndex].rounds = newExercises[
        exerciseIndex
      ].rounds.filter((_, i) => i !== roundIndex);
    }
    setExercises(newExercises);
  };

  const updateRound = (
    exerciseIndex: number,
    roundIndex: number,
    field: keyof CreateRoundForm,
    value: string | number,
  ) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].rounds[roundIndex] = {
      ...newExercises[exerciseIndex].rounds[roundIndex],
      [field]: value,
    };
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const validExercises = exercises.filter((ex) => ex.name.trim() !== "");
      if (validExercises.length === 0) {
        throw new Error("At least one exercise is required");
      }

      const exercisesWithRounds: (CreateExerciseForm & {
        rounds: CreateRoundForm[];
      })[] = validExercises
        .map((exercise) => ({
          name: exercise.name.trim(),
          rounds: exercise.rounds.filter(
            (round) => round.weight > 0 && round.reps > 0,
          ),
        }))
        .filter((ex) => ex.rounds.length > 0);

      if (exercisesWithRounds.length === 0) {
        throw new Error("At least one exercise with valid rounds is required");
      }

      const trainingData: TrainingInsert = {
        user_id: user.id,
        comments: training.comments || null,
      };

      await createTrainingWithExercises(trainingData, exercisesWithRounds);

      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTraining({ comments: "" });
    setExercises([
      {
        name: "",
        rounds: [{ weight: 0, reps: 0, comments: "" }],
      },
    ]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Training</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Training Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Training Comments (Optional)</Label>
            <Textarea
              id="comments"
              placeholder="Add any notes about this training session..."
              value={training.comments}
              onChange={(e) =>
                setTraining({ ...training, comments: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Exercises</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExercise}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            {exercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      Exercise {exerciseIndex + 1}
                    </CardTitle>
                    {exercises.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(exerciseIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Exercise Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`exercise-${exerciseIndex}`}>
                      Exercise Name
                    </Label>
                    <Input
                      id={`exercise-${exerciseIndex}`}
                      placeholder="e.g., Bench Press"
                      value={exercise.name}
                      onChange={(e) =>
                        updateExercise(exerciseIndex, "name", e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Rounds */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Rounds</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addRound(exerciseIndex)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Round
                      </Button>
                    </div>

                    {exercise.rounds.map((round, roundIndex) => (
                      <div key={roundIndex} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label
                            htmlFor={`weight-${exerciseIndex}-${roundIndex}`}
                            className="text-xs"
                          >
                            Weight (kg/lbs)
                          </Label>
                          <Input
                            id={`weight-${exerciseIndex}-${roundIndex}`}
                            type="number"
                            step="0.5"
                            min="0"
                            placeholder="0"
                            value={round.weight || ""}
                            onChange={(e) =>
                              updateRound(
                                exerciseIndex,
                                roundIndex,
                                "weight",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <Label
                            htmlFor={`reps-${exerciseIndex}-${roundIndex}`}
                            className="text-xs"
                          >
                            Reps
                          </Label>
                          <Input
                            id={`reps-${exerciseIndex}-${roundIndex}`}
                            type="number"
                            min="1"
                            placeholder="0"
                            value={round.reps || ""}
                            onChange={(e) =>
                              updateRound(
                                exerciseIndex,
                                roundIndex,
                                "reps",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            required
                          />
                        </div>
                        <div className="flex-2">
                          <Label
                            htmlFor={`round-comments-${exerciseIndex}-${roundIndex}`}
                            className="text-xs"
                          >
                            Comments
                          </Label>
                          <Input
                            id={`round-comments-${exerciseIndex}-${roundIndex}`}
                            placeholder="Optional notes"
                            value={round.comments || ""}
                            onChange={(e) =>
                              updateRound(
                                exerciseIndex,
                                roundIndex,
                                "comments",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        {exercise.rounds.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeRound(exerciseIndex, roundIndex)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Training"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
