"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Dumbbell, Plus, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { createKettlebellTrainingWithExercises } from "@/lib/kettlebell-operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";

type RoundMetricType = "reps" | "time";

type FormRound = {
  weight: number;
  metricType: RoundMetricType;
  metricValue: number;
  comments: string;
};

type FormExercise = {
  name: string;
  rounds: FormRound[];
};

const defaultRound = (): FormRound => ({
  weight: 0,
  metricType: "reps",
  metricValue: 0,
  comments: "",
});

export default function CreateKettlebellTrainingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [trainingName, setTrainingName] = useState("");
  const [trainingComments, setTrainingComments] = useState("");
  const [linksInput, setLinksInput] = useState("");
  const [exercises, setExercises] = useState<FormExercise[]>([
    { name: "", rounds: [defaultRound()] },
  ]);

  const addExercise = () => {
    setExercises((prev) => [...prev, { name: "", rounds: [defaultRound()] }]);
  };

  const removeExercise = (exerciseIndex: number) => {
    setExercises((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, index) => index !== exerciseIndex);
    });
  };

  const updateExerciseName = (exerciseIndex: number, value: string) => {
    setExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex ? { ...exercise, name: value } : exercise,
      ),
    );
  };

  const addRound = (exerciseIndex: number) => {
    setExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, rounds: [...exercise.rounds, defaultRound()] }
          : exercise,
      ),
    );
  };

  const removeRound = (exerciseIndex: number, roundIndex: number) => {
    setExercises((prev) =>
      prev.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;
        if (exercise.rounds.length <= 1) return exercise;

        return {
          ...exercise,
          rounds: exercise.rounds.filter((_, i) => i !== roundIndex),
        };
      }),
    );
  };

  const updateRound = (
    exerciseIndex: number,
    roundIndex: number,
    updates: Partial<FormRound>,
  ) => {
    setExercises((prev) =>
      prev.map((exercise, exIndex) => {
        if (exIndex !== exerciseIndex) return exercise;

        return {
          ...exercise,
          rounds: exercise.rounds.map((round, rdIndex) =>
            rdIndex === roundIndex ? { ...round, ...updates } : round,
          ),
        };
      }),
    );
  };

  const resetForm = () => {
    setTrainingName("");
    setTrainingComments("");
    setLinksInput("");
    setExercises([{ name: "", rounds: [defaultRound()] }]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast({ message: "You must be logged in.", type: "error" });
      return;
    }

    if (!trainingName.trim()) {
      toast({ message: "Training name is required.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const validExercises = exercises
        .map((exercise) => ({
          name: exercise.name.trim(),
          rounds: exercise.rounds
            .filter((round) => round.metricValue > 0)
            .map((round) => ({
              weight: round.weight,
              reps: round.metricType === "reps" ? round.metricValue : undefined,
              time_minutes:
                round.metricType === "time" ? round.metricValue : undefined,
              comments: round.comments.trim() || null,
              completed: false,
            })),
        }))
        .filter((exercise) => exercise.name.length > 0 && exercise.rounds.length > 0);

      if (validExercises.length === 0) {
        throw new Error("Add at least one exercise with at least one valid round.");
      }

      const links = linksInput
        .split("\n")
        .map((link) => link.trim())
        .filter(Boolean);

      await createKettlebellTrainingWithExercises(
        {
          user_id: user.id,
          name: trainingName.trim(),
          completed: false,
          comments: trainingComments.trim() || null,
          links,
        },
        validExercises,
      );

      toast({
        message: "Kettlebell training created successfully!",
        type: "success",
      });
      resetForm();
      router.push("/kettlebell?created=1");
    } catch (error: any) {
      toast({
        message: error?.message || "Failed to create kettlebell training.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 pb-20 pt-4 py-20">
          <div className="mx-auto max-w-5xl space-y-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/kettlebell">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Kettlebell
              </Link>
            </Button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Kettlebell Training</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="training-name">Training Name</Label>
                    <Input
                      id="training-name"
                      placeholder="e.g., Full Body Kettlebell Session"
                      value={trainingName}
                      onChange={(event) => setTrainingName(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="training-comments">Comments</Label>
                    <Textarea
                      id="training-comments"
                      placeholder="Optional training notes"
                      value={trainingComments}
                      onChange={(event) => setTrainingComments(event.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="training-links">Links (one per line)</Label>
                    <Textarea
                      id="training-links"
                      placeholder="https://example.com/video-1\nhttps://example.com/video-2"
                      value={linksInput}
                      onChange={(event) => setLinksInput(event.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Exercises</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addExercise}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <div className="space-y-2">
                          <Label htmlFor={`exercise-name-${exerciseIndex}`}>
                            Exercise Name
                          </Label>
                          <Input
                            id={`exercise-name-${exerciseIndex}`}
                            placeholder="e.g., Kettlebell Swing"
                            value={exercise.name}
                            onChange={(event) =>
                              updateExerciseName(exerciseIndex, event.target.value)
                            }
                            required
                          />
                        </div>

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
                            <div key={roundIndex} className="grid gap-2 md:grid-cols-5 items-end">
                              <div>
                                <Label className="text-xs">Weight</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  placeholder="0"
                                  value={round.weight || ""}
                                  onChange={(event) =>
                                    updateRound(exerciseIndex, roundIndex, {
                                      weight: Number(event.target.value) || 0,
                                    })
                                  }
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Type</Label>
                                <Select
                                  value={round.metricType}
                                  onValueChange={(value: RoundMetricType) =>
                                    updateRound(exerciseIndex, roundIndex, {
                                      metricType: value,
                                      metricValue: 0,
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="reps">Reps</SelectItem>
                                    <SelectItem value="time">Time (min)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-xs">
                                  {round.metricType === "reps" ? "Reps" : "Time (min)"}
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="0"
                                  value={round.metricValue || ""}
                                  onChange={(event) =>
                                    updateRound(exerciseIndex, roundIndex, {
                                      metricValue: Number(event.target.value) || 0,
                                    })
                                  }
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Comments</Label>
                                <Input
                                  placeholder="Optional"
                                  value={round.comments}
                                  onChange={(event) =>
                                    updateRound(exerciseIndex, roundIndex, {
                                      comments: event.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div>
                                {exercise.rounds.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRound(exerciseIndex, roundIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Kettlebell Training"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/kettlebell">Cancel</Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ProtectedRoute>
  );
}
