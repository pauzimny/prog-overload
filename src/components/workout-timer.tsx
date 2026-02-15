"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";
import { TrainingWithExercises } from "@/schemas/database";
import { updateTrainingStatus, updateRound } from "@/lib/database-operations";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";

interface WorkoutTimerProps {
  training: TrainingWithExercises;
  onComplete: () => void;
}

export default function WorkoutTimer({
  training,
  onComplete,
}: WorkoutTimerProps) {
  const [isRunning, setIsRunning] = useState(true); // Auto-start
  // const [seconds, setSeconds] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  // const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [editedTraining, setEditedTraining] = useState(() => {
    // Ensure all rounds have done field with default false
    return {
      ...training,
      exercises: training.exercises.map((exercise) => ({
        ...exercise,
        rounds: exercise.rounds.map((round) => ({
          ...round,
          done: round.done || false, // Default to false if undefined
        })),
      })),
    };
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

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

  const handleComplete = async () => {
    try {
      // Update all rounds with edited values including done status
      for (const exercise of editedTraining.exercises) {
        for (const round of exercise.rounds) {
          await updateRound(round.id!, {
            weight: round.weight,
            reps: round.reps,
            comments: round.comments,
            done: round.done, // Preserve done status
          });
        }
      }

      // Mark training as done
      await updateTrainingStatus(training.id!, "done");

      toast({ message: "Workout completed successfully!", type: "success" });
      onComplete();
    } catch (error) {
      console.error("Failed to complete workout:", error);
      toast({ message: "Failed to complete workout", type: "error" });
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

  const removeRound = (exerciseIndex: number, roundIndex: number) => {
    const newTraining = { ...editedTraining };
    if (newTraining.exercises[exerciseIndex].rounds.length > 1) {
      newTraining.exercises[exerciseIndex].rounds.splice(roundIndex, 1);
      setEditedTraining(newTraining);
    }
  };

  const toggleRoundDone = async (exerciseIndex: number, roundIndex: number) => {
    const round = editedTraining.exercises[exerciseIndex].rounds[roundIndex];
    const currentDoneStatus = round.done || false; // Handle undefined case
    const newDoneStatus = !currentDoneStatus;

    try {
      // Update local state
      const newTraining = { ...editedTraining };
      newTraining.exercises[exerciseIndex].rounds[roundIndex] = {
        ...round,
        done: newDoneStatus,
      };

      // Update in database

      await updateRound(round.id!, {
        ...round,
        done: newDoneStatus,
      });
      // await updateRoundDoneStatus(round.id!, newDoneStatus);
      setEditedTraining(newTraining);

      toast({
        message: `Round ${roundIndex + 1} marked as ${newDoneStatus ? "done" : "not done"}!`,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update round status:", error);
      toast({ message: "Failed to update round status", type: "error" });
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
            >
              {isRunning ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button onClick={handleComplete} variant="default" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Complete
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
            {editedTraining.exercises.map((exercise, index) => (
              <Button
                key={`exercise-${exercise.id}`}
                variant={index === currentExerciseIndex ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setCurrentExerciseIndex(index)}
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                {exercise.name}
              </Button>
            ))}
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
          {currentExercise?.rounds.map((round, roundIndex) => (
            <div key={round.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleRoundDone(currentExerciseIndex, roundIndex)
                    }
                    className="p-1 h-6 w-6"
                    title={
                      round.done === true
                        ? "Mark as not done"
                        : round.done === false
                          ? "Mark as done"
                          : "Mark as done"
                    }
                  >
                    {round.done === true ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Badge variant="secondary">Round {roundIndex + 1}</Badge>
                </div>
                {currentExercise.rounds.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeRound(currentExerciseIndex, roundIndex)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div
                className={`grid grid-cols-2 gap-4 ${round.done === true ? "opacity-60" : ""}`}
              >
                <div>
                  <Label htmlFor={`weight-${roundIndex}`}>Weight (kg)</Label>
                  <Input
                    id={`weight-${roundIndex}`}
                    type="number"
                    step="0.5"
                    value={round.weight ?? ""}
                    min="0"
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
                onChange={(e) =>
                  updateRoundData(
                    currentExerciseIndex,
                    roundIndex,
                    "comments",
                    e.target.value,
                  )
                }
              />

              {roundIndex < currentExercise.rounds.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
