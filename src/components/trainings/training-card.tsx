import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Trash2,
  Copy,
  CheckCircle,
  Circle,
  Play,
  Check,
  Dumbbell,
} from "lucide-react";
import { format } from "date-fns";
import type { TrainingWithExercises } from "@/lib/database-operations";

interface TrainingCardProps {
  training: TrainingWithExercises;
  onStartWorkout: (training: TrainingWithExercises) => void;
  onSetAsDone: (training: TrainingWithExercises) => void;
  onCopyTraining: (training: TrainingWithExercises) => void;
  onDeleteTraining: (trainingId: string) => void;
  onToggleStatus: (trainingId: string, currentStatus: "plan" | "done") => void;
}

export default function TrainingCard({
  training,
  onStartWorkout,
  onSetAsDone,
  onCopyTraining,
  onDeleteTraining,
  onToggleStatus,
}: TrainingCardProps) {
  return (
    <Card key={training.id} className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col-reverse md:flex-row gap-2 items-start justify-between w-full">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(training.created_at), "MMMM d, yyyy")}
              </span>
              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(training.created_at), "h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={training.status === "done" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => onToggleStatus(training.id, training.status)}
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
        {training.exercises.map((exercise: any, exerciseIndex: number) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            exerciseIndex={exerciseIndex}
            totalExercises={training.exercises.length}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface TrainingActionsProps {
  training: TrainingWithExercises;
  onStartWorkout: (training: TrainingWithExercises) => void;
  onSetAsDone: (training: TrainingWithExercises) => void;
  onCopyTraining: (training: TrainingWithExercises) => void;
  onDeleteTraining: (trainingId: string) => void;
}

function TrainingActions({
  training,
  onStartWorkout,
  onSetAsDone,
  onCopyTraining,
  onDeleteTraining,
}: TrainingActionsProps) {
  return (
    <div className="flex flex-col-reverse md:flex-row gap-2">
      {training.status === "plan" && (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onStartWorkout(training)}
            title="Start this workout"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Workout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetAsDone(training)}
            title="Mark this training as done"
          >
            <Check className="h-4 w-4 mr-2" />
            Set as Done
          </Button>
        </div>
      )}
      <div className="flex gap-2 justify-end w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopyTraining(training)}
          title="Copy training summary to clipboard"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteTraining(training.id)}
          title="Delete this workout"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface ExerciseItemProps {
  exercise: any;
  exerciseIndex: number;
  totalExercises: number;
}

function ExerciseItem({
  exercise,
  exerciseIndex,
  totalExercises,
}: ExerciseItemProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-primary" />
        <h4 className="font-semibold">{exercise.name}</h4>
        <Badge variant="outline" className="text-xs">
          {exercise.rounds.length}{" "}
          {exercise.rounds.length === 1 ? "Set" : "Sets"}
        </Badge>
      </div>

      <div className="ml-6 space-y-2">
        {exercise.rounds.map((round: any, roundIndex: number) => (
          <RoundItem key={round.id} round={round} roundIndex={roundIndex} />
        ))}
      </div>

      {exerciseIndex < totalExercises - 1 && <Separator className="ml-6" />}
    </div>
  );
}

interface RoundItemProps {
  round: any;
  roundIndex: number;
}

function RoundItem({ round, roundIndex }: RoundItemProps) {
  return (
    <div
      key={round.id}
      className="flex items-center gap-4 text-sm grow w-full justify-between"
    >
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs hidden md:block">
          Set {roundIndex + 1}
        </Badge>
        <Badge variant="secondary" className="text-xs md:hidden">
          {roundIndex + 1}
        </Badge>
        <span className="font-medium">{round.weight} kg</span>
        <span className="text-muted-foreground">×</span>
        <span className="font-medium">{round.reps} reps</span>
      </div>
      {round.comments && (
        <span className="text-muted-foreground italic">({round.comments})</span>
      )}
    </div>
  );
}
