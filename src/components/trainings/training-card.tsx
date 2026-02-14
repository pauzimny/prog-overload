import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Calendar, Clock, CheckCircle, Circle } from "lucide-react";
import { format } from "date-fns";
import { ExerciseItem } from "./excercise-item";
import { TrainingActions } from "./training-actions";
import { Exercise, TrainingWithExercises } from "@/schemas/database";

interface TrainingCardProps {
  training: TrainingWithExercises;
  onStartWorkout: (training: TrainingWithExercises) => void;
  onSetAsDone: (training?: TrainingWithExercises) => void;
  onCopyTraining: (training: TrainingWithExercises) => void;
  onDeleteTraining: (trainingId: string) => void;
  onToggleStatus: (trainingId: string, currentStatus: "plan" | "done") => void;
  onToggleRoundDone: (roundId: string, currentDone: boolean) => void;
}

export default function TrainingCard({
  training,
  onStartWorkout,
  onSetAsDone,
  onCopyTraining,
  onDeleteTraining,
  onToggleStatus,
  onToggleRoundDone,
}: TrainingCardProps) {
  return (
    <Card key={training.id} className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col-reverse md:flex-row gap-2 items-start justify-between w-full">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(
                  new Date(training.created_at as string),
                  "MMMM d, yyyy",
                )}
              </span>
              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(training.created_at as string), "h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={training.status === "done" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => onToggleStatus(training.id!, training.status)}
              >
                {training.status === "done" ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <Circle className="h-3 w-3 mr-1" />
                )}
                {training.status === "done" ? "Done" : "Plan"}
              </Badge>
              <Badge variant="secondary">
                {training.exercises.length}{" "}
                {training.exercises.length === 1 ? "Exercise" : "Exercises"}
              </Badge>
              <Badge variant="outline">
                {training.exercises.reduce(
                  (total: number, exercise: any) =>
                    total + exercise.rounds.length,
                  0,
                )}{" "}
                Total Sets
              </Badge>
            </div>
          </div>
          <TrainingActions
            training={training}
            onStartWorkout={onStartWorkout}
            onSetAsDone={onSetAsDone}
            onCopyTraining={onCopyTraining}
            onDeleteTraining={onDeleteTraining}
          />
        </div>
      </CardHeader>

      {training.comments && (
        <div className="px-6 pb-2">
          <p className="text-sm text-muted-foreground italic">
            "{training.comments}"
          </p>
        </div>
      )}

      <CardContent className="space-y-4">
        {training.exercises.map((exercise: Exercise, exerciseIndex: number) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            exerciseIndex={exerciseIndex}
            totalExercises={training.exercises.length}
            onToggleRoundDone={onToggleRoundDone}
          />
        ))}
      </CardContent>
    </Card>
  );
}
