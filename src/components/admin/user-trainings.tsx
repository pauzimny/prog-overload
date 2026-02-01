import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy } from "lucide-react";
import { copyTrainingToClipboard } from "@/lib/training-utils";
import { useAdminToast } from "@/hooks/use-admin-toast";

interface UserTrainingsProps {
  trainings: any[];
  userId: string;
  onDeleteTraining: (trainingId: string, userId: string) => void;
}

export default function UserTrainings({
  trainings,
  userId,
  onDeleteTraining,
}: UserTrainingsProps) {
  const { toast } = useAdminToast();

  const handleCopyTraining = async (training: any) => {
    const result = await copyTrainingToClipboard(training);
    toast({
      message: result.message,
      type: result.success ? "success" : "error",
    });
  };

  return (
    <div className="bg-muted/50 p-4 border-t">
      <h4 className="font-medium mb-3">User Trainings ({trainings.length})</h4>
      {trainings.length === 0 ? (
        <p className="text-muted-foreground text-sm">No trainings found</p>
      ) : (
        <div className="space-y-2">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="flex items-center justify-between bg-background p-3 rounded border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      training.status === "done" ? "default" : "secondary"
                    }
                  >
                    {training.status}
                  </Badge>
                  <span className="font-medium">
                    {training.exercises?.length || 0} exercises
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(training.created_at).toLocaleDateString()}
                  </span>
                </div>
                {training.comments && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {training.comments}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyTraining(training)}
                  title="Copy training summary to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteTraining(training.id, userId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
