"use client";

import { useState, useRef, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Check,
  Dumbbell,
  CheckCircle,
  Circle,
  Loader2,
} from "lucide-react";
import { TrainingWithExercises } from "@/schemas/database";
import {
  updateTrainingStatus,
  updateRound,
  updateExercise,
  createRound,
  createExercise,
} from "@/lib/database-operations";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";

interface WorkoutTimerProps {
  training: TrainingWithExercises;
  onComplete: () => void;
  preserveStatus?: boolean;
}

export default function WorkoutTimer({
  training,
  onComplete,
  preserveStatus = false,
}: WorkoutTimerProps) {
  const [isRunning, setIsRunning] = useState(true); // Auto-start
  // const [seconds, setSeconds] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(() => {
    // Find the first active exercise, default to first exercise if none active
    const activeExerciseIndex = training.exercises.findIndex((ex) => ex.active);
    return activeExerciseIndex >= 0 ? activeExerciseIndex : 0;
  });
  // const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [editedTraining, setEditedTraining] = useState(() => {
    // Ensure all rounds have done field with default false and maintain original order
    return {
      ...training,
      exercises: training.exercises.map((exercise) => ({
        ...exercise,
        rounds: exercise.rounds
          .map((round) => ({
            ...round,
            done: round.done || false, // Default to false if undefined
          }))
          .sort(
            (a, b) =>
              new Date(a.created_at || 0).getTime() -
              new Date(b.created_at || 0).getTime(),
          ),
      })),
    };
  });
  const [isCompleting, setIsCompleting] = useState(false);
  const [switchingExerciseIndex, setSwitchingExerciseIndex] = useState<number | null>(null);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [pendingSaveRounds, setPendingSaveRounds] = useState<Set<string>>(new Set());
  const [pendingToggleRounds, setPendingToggleRounds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const getRoundActionKey = (exerciseIndex: number, roundIndex: number) =>
    `${exerciseIndex}-${roundIndex}`;

  const addPendingRound = (
    setter: Dispatch<SetStateAction<Set<string>>>,
    key: string,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const removePendingRound = (
    setter: Dispatch<SetStateAction<Set<string>>>,
    key: string,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  // useEffect(() => {
  //   if (isRunning) {
  //     intervalRef.current = setInterval(() => {
  //       setSeconds((prev) => prev + 1);
  //     }, 1000);
  //   } else {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //   }

  //   return () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //   };
  // }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleExerciseChange = async (exerciseIndex: number) => {
    if (isCompleting || switchingExerciseIndex !== null) return;

    setSwitchingExerciseIndex(exerciseIndex);
    try {
      const newExercise = editedTraining.exercises[exerciseIndex];

      // Set all exercises to inactive
      for (const exercise of editedTraining.exercises) {
        if (exercise.id) {
          await updateExercise(exercise.id, { active: false });
        }
      }

      // Set selected exercise as active
      if (newExercise.id) {
        await updateExercise(newExercise.id, { active: true });
      }

      setCurrentExerciseIndex(exerciseIndex);
      toast({ message: "Switched to exercise", type: "success" });
    } catch (error) {
      console.error("Failed to switch exercise:", error);
      toast({ message: "Failed to switch exercise", type: "error" });
    } finally {
      setSwitchingExerciseIndex(null);
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      // Update all rounds with edited values including done status
      for (let exerciseIndex = 0; exerciseIndex < editedTraining.exercises.length; exerciseIndex++) {
        const exercise = editedTraining.exercises[exerciseIndex];

        for (let roundIndex = 0; roundIndex < exercise.rounds.length; roundIndex++) {
          await persistRound(exerciseIndex, roundIndex);
        }
      }

      if (!preserveStatus) {
        await updateTrainingStatus(training.id!, "done");
      }

      toast({
        message: preserveStatus
          ? "Workout changes saved successfully!"
          : "Workout completed successfully!",
        type: "success",
      });
      onComplete();
    } catch (error) {
      console.error("Failed to complete workout:", error);

      const errorMessage =
        error instanceof Error && error.message
          ? `Failed to complete workout: ${error.message}`
          : "Failed to complete workout";

      toast({ message: errorMessage, type: "error" });
    } finally {
      setIsCompleting(false);
    }
  };

  const updateRoundData = (
    exerciseIndex: number,
    roundIndex: number,
    field: "weight" | "reps" | "comments",
    value: string | number,
  ) => {
    const newTraining = { ...editedTraining };
    newTraining.exercises[exerciseIndex].rounds[roundIndex] = {
      ...newTraining.exercises[exerciseIndex].rounds[roundIndex],
      [field]: value,
    };
    setEditedTraining(newTraining);
  };

  const addRound = (exerciseIndex: number) => {
    const newTraining = { ...editedTraining };
    newTraining.exercises[exerciseIndex].rounds.push({
      id: `temp-${Date.now()}`,
      exercise_id: newTraining.exercises[exerciseIndex].id!,
      weight: 0,
      reps: 0,
      comments: "",
      done: false, // Add done field with default false
      created_at: new Date().toISOString(),
      // updated_at: new Date().toISOString(), // Add updated_at field
    });
    setEditedTraining(newTraining);
  };

  const addExercise = async () => {
    if (isCompleting || isAddingExercise) return;

    const trimmedName = newExerciseName.trim();
    if (!trimmedName) {
      toast({ message: "Exercise name is required", type: "error" });
      return;
    }

    if (!editedTraining.id) {
      toast({ message: "Cannot add exercise to this workout", type: "error" });
      return;
    }

    setIsAddingExercise(true);

    try {
      const createdExercise = await createExercise({
        training_id: editedTraining.id,
        name: trimmedName,
        active: false,
      });

      setEditedTraining((prev) => {
        const next = { ...prev };
        next.exercises = [
          ...prev.exercises,
          {
            ...createdExercise,
            rounds: [
              {
                id: `temp-${Date.now()}`,
                exercise_id: createdExercise.id,
                weight: 0,
                reps: 0,
                comments: "",
                done: false,
                created_at: new Date().toISOString(),
              },
            ],
          },
        ];
        return next;
      });

      setCurrentExerciseIndex(editedTraining.exercises.length);
      setNewExerciseName("");
      toast({ message: "Exercise added", type: "success" });
    } catch (error) {
      console.error("Failed to add exercise:", error);
      toast({ message: "Failed to add exercise", type: "error" });
    } finally {
      setIsAddingExercise(false);
    }
  };

  const persistRound = async (exerciseIndex: number, roundIndex: number) => {
    const exercise = editedTraining.exercises[exerciseIndex];
    const round = exercise.rounds[roundIndex];

    if (!round || !exercise?.id) {
      throw new Error("Round or exercise not found");
    }

    if ((round.weight ?? 0) <= 0 || (round.reps ?? 0) <= 0) {
      throw new Error("Weight and reps must be greater than 0");
    }

    const roundId = round.id;

    if (!roundId || roundId.startsWith("temp-")) {
      const createdRound = await createRound({
        exercise_id: exercise.id,
        weight: round.weight,
        reps: round.reps,
        comments: round.comments,
        done: round.done || false,
      });

      setEditedTraining((prev) => {
        const next = { ...prev };
        next.exercises = [...prev.exercises];
        next.exercises[exerciseIndex] = {
          ...prev.exercises[exerciseIndex],
          rounds: [...prev.exercises[exerciseIndex].rounds],
        };

        next.exercises[exerciseIndex].rounds[roundIndex] = {
          ...next.exercises[exerciseIndex].rounds[roundIndex],
          id: createdRound.id,
          created_at: createdRound.created_at,
        };

        return next;
      });

      return;
    }

    await updateRound(roundId, {
      weight: round.weight,
      reps: round.reps,
      comments: round.comments,
      done: round.done,
    });
  };

  const removeRound = (exerciseIndex: number, roundIndex: number) => {
    const newTraining = { ...editedTraining };
    if (newTraining.exercises[exerciseIndex].rounds.length > 1) {
      newTraining.exercises[exerciseIndex].rounds.splice(roundIndex, 1);
      setEditedTraining(newTraining);
    }
  };

  const toggleRoundDone = async (exerciseIndex: number, roundIndex: number) => {
    if (isCompleting) return;

    const round = editedTraining.exercises[exerciseIndex].rounds[roundIndex];
    const currentDoneStatus = round.done || false; // Handle undefined case
    const newDoneStatus = !currentDoneStatus;
    const roundActionKey = getRoundActionKey(exerciseIndex, roundIndex);

    addPendingRound(setPendingToggleRounds, roundActionKey);

    try {
      // Update local state
      const newTraining = { ...editedTraining };
      newTraining.exercises[exerciseIndex].rounds[roundIndex] = {
        ...round,
        done: newDoneStatus,
      };
      setEditedTraining(newTraining);

      // Update in database
      const roundId = round.id;

      if (!roundId || roundId.startsWith("temp-")) {
        const createdRound = await createRound({
          exercise_id: round.exercise_id,
          weight: round.weight,
          reps: round.reps,
          comments: round.comments,
          done: newDoneStatus,
        });

        newTraining.exercises[exerciseIndex].rounds[roundIndex] = {
          ...newTraining.exercises[exerciseIndex].rounds[roundIndex],
          id: createdRound.id,
          created_at: createdRound.created_at,
        };
        setEditedTraining(newTraining);
      } else {
        await updateRound(roundId, {
          done: newDoneStatus,
        });
      }

      toast({
        message: `Round ${roundIndex + 1} marked as ${newDoneStatus ? "done" : "not done"}!`,
        type: "success",
      });
    } catch (error) {
      // Revert optimistic toggle when persistence fails.
      setEditedTraining((prev) => {
        const next = { ...prev };
        next.exercises = [...prev.exercises];
        next.exercises[exerciseIndex] = {
          ...prev.exercises[exerciseIndex],
          rounds: [...prev.exercises[exerciseIndex].rounds],
        };
        next.exercises[exerciseIndex].rounds[roundIndex] = {
          ...next.exercises[exerciseIndex].rounds[roundIndex],
          done: currentDoneStatus,
        };
        return next;
      });

      console.error("Failed to update round status:", error);
      toast({ message: "Failed to update round status", type: "error" });
    } finally {
      removePendingRound(setPendingToggleRounds, roundActionKey);
    }
  };

  const saveRound = async (exerciseIndex: number, roundIndex: number) => {
    if (isCompleting) return;

    const roundActionKey = getRoundActionKey(exerciseIndex, roundIndex);
    addPendingRound(setPendingSaveRounds, roundActionKey);

    try {
      await persistRound(exerciseIndex, roundIndex);

      toast({
        message: `Round ${roundIndex + 1} saved successfully!`,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save round:", error);
      toast({ message: "Failed to save round", type: "error" });
    } finally {
      removePendingRound(setPendingSaveRounds, roundActionKey);
    }
  };

  const currentExercise = editedTraining.exercises[currentExerciseIndex];

  return (
    <div className="space-y-6">
      {/* Small Timer Display */}
      <Card className="text-center">
        <CardContent className="py-4">
          {/* <div className="text-2xl font-mono font-bold text-primary mb-2">
            {formatTime(seconds)}
          </div> */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleStartPause}
              variant={isRunning ? "secondary" : "default"}
              size="sm"
              disabled={isCompleting || isAddingExercise}
            >
              {isRunning ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              onClick={handleComplete}
              variant="default"
              size="sm"
              disabled={isCompleting || isAddingExercise}
            >
              {isCompleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {isCompleting ? "Completing..." : "Complete"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {editedTraining.exercises.map((exercise, index) => {
              const isSwitchingThisExercise = switchingExerciseIndex === index;

              return (
                <Button
                  key={`exercise-${exercise.id}`}
                  variant={index === currentExerciseIndex ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleExerciseChange(index)}
                  disabled={
                    isCompleting ||
                    isAddingExercise ||
                    switchingExerciseIndex !== null
                  }
                >
                  {isSwitchingThisExercise ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Dumbbell className="h-4 w-4 mr-2" />
                  )}
                  {exercise.name}
                  {exercise.active && (
                    <Badge variant="secondary" className="ml-auto">
                      Active
                    </Badge>
                  )}
                </Button>
              );
            })}

            <div className="flex items-center gap-2 pt-2">
              <Input
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="New exercise name"
                disabled={isCompleting || isAddingExercise}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExercise();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={addExercise}
                disabled={
                  isCompleting || isAddingExercise || !newExerciseName.trim()
                }
              >
                {isAddingExercise ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {isAddingExercise ? "Adding..." : "Add Exercise"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Rounds */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rounds</CardTitle>
            <Button onClick={() => addRound(currentExerciseIndex)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Round
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentExercise?.rounds.map((round, roundIndex) => {
            const isDone = round.done === true;
            const roundActionKey = getRoundActionKey(currentExerciseIndex, roundIndex);
            const isSavingRound = pendingSaveRounds.has(roundActionKey);
            const isTogglingRound = pendingToggleRounds.has(roundActionKey);
            const isRoundBusy = isCompleting || isSavingRound || isTogglingRound;
            return (
              <div
                key={round.id}
                className={`space-y-3 p-3 rounded-lg border transition-all duration-200 ${
                  isDone
                    ? "bg-linear-to-r from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-950/20 dark:to-teal-950/20 dark:border-emerald-800"
                    : "bg-background border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleRoundDone(currentExerciseIndex, roundIndex)
                      }
                      disabled={isRoundBusy}
                      className={`p-1 h-6 w-6 transition-all duration-200 ${
                        isDone
                          ? "hover:bg-emerald-200 dark:hover:bg-emerald-800"
                          : "hover:bg-muted"
                      }`}
                      title={isDone ? "Mark as not done" : "Mark as done"}
                    >
                      {isTogglingRound ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : isDone ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Badge
                      variant={isDone ? "default" : "secondary"}
                      className={`transition-all duration-200 ${
                        isDone
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                          : ""
                      }`}
                    >
                      Round {roundIndex + 1}
                    </Badge>
                  </div>
                  {currentExercise.rounds.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeRound(currentExerciseIndex, roundIndex)
                      }
                      disabled={isRoundBusy}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveRound(currentExerciseIndex, roundIndex)}
                    disabled={isRoundBusy}
                    className={`transition-all duration-200 ${
                      isDone
                        ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    {isSavingRound ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {isSavingRound ? "Saving..." : "Save"}
                  </Button>
                </div>

                <div
                  className={`grid grid-cols-2 gap-4 transition-all duration-200 ${
                    isDone ? "opacity-75" : ""
                  }`}
                >
                  <div>
                    <Label htmlFor={`weight-${roundIndex}`}>Weight (kg)</Label>
                    <Input
                      id={`weight-${roundIndex}`}
                      type="number"
                      step="0.5"
                      value={round.weight ?? ""}
                      min="0"
                      disabled={isRoundBusy}
                      onChange={(e) => {
                        updateRoundData(
                          currentExerciseIndex,
                          roundIndex,
                          "weight",
                          Number.isNaN(e.target.valueAsNumber)
                            ? ""
                            : e.target.valueAsNumber,
                        );
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reps-${roundIndex}`}>Reps</Label>
                    <Input
                      id={`reps-${roundIndex}`}
                      type="number"
                      value={round.reps}
                      min="0"
                      disabled={isRoundBusy}
                      onChange={(e) => {
                        updateRoundData(
                          currentExerciseIndex,
                          roundIndex,
                          "reps",
                          Number.isNaN(e.target.valueAsNumber)
                            ? ""
                            : e.target.valueAsNumber,
                        );
                      }}
                    />
                  </div>
                </div>
                <Textarea
                  id={`comments-${roundIndex}`}
                  placeholder="Optional notes about this round"
                  value={round.comments || ""}
                  disabled={isRoundBusy}
                  onChange={(e) =>
                    updateRoundData(
                      currentExerciseIndex,
                      roundIndex,
                      "comments",
                      e.target.value,
                    )
                  }
                />

                {roundIndex < currentExercise.rounds.length - 1 && (
                  <Separator />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
