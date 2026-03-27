import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KettlebellTrainingWithExercises } from "@/lib/kettlebell-operations";

interface TrainingHeaderCardProps {
  training: KettlebellTrainingWithExercises;
  savingTrainingStatus: boolean;
  onToggleTrainingCompleted: () => void;
}

export function TrainingHeaderCard({
  training,
  savingTrainingStatus,
  onToggleTrainingCompleted,
}: TrainingHeaderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{training.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant={training.completed ? "default" : "secondary"}>
            {training.completed ? "Completed" : "Plan"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTrainingCompleted}
            disabled={savingTrainingStatus}
          >
            {training.completed ? "Mark as Plan" : "Mark as Completed"}
          </Button>
        </div>
        <p className="text-muted-foreground">
          Created: {new Date(training.created_at).toLocaleString()}
        </p>
        {training.comments && <p>{training.comments}</p>}
      </CardContent>
    </Card>
  );
}
