import { TrainingWithExercises } from "@/schemas/database";
import { Button } from "../ui/button";
import { Copy, Play, Trash2 } from "lucide-react";

interface TrainingActionsProps {
  training: TrainingWithExercises;
  onStartWorkout: (training: TrainingWithExercises) => void;
  onSetAsDone: (training: TrainingWithExercises) => void;
  onCopyTraining: (training: TrainingWithExercises) => void;
  onDeleteTraining: (trainingId: string) => void;
}
export const TrainingActions = ({
  training,
  onStartWorkout,
  onSetAsDone,
  onCopyTraining,
  onDeleteTraining,
}: TrainingActionsProps) => {
  return (
    <div className="flex flex-col-reverse md:flex-row gap-2 w-full">
      {training.status === "plan" && (
        <div className="flex gap-4 pb-2">
          <Button
            // variant="default"
            size="xs"
            onClick={() => onStartWorkout(training)}
            title="Start this workout"
          >
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => onSetAsDone(training)}
            title="Mark this training as done"
          >
            {/* <Check className="h-4 w-4 mr-2" /> */}
            Set as Done
          </Button>

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
              onClick={() => onDeleteTraining(training.id!)}
              title="Delete this workout"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
