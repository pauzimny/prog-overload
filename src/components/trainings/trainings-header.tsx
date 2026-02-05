import { Button } from "@/components/ui/button";
import { Copy, Plus } from "lucide-react";

interface TrainingsHeaderProps {
  onCopyUserId: () => void;
  onCreateWorkout: () => void;
}

export default function TrainingsHeader({
  onCopyUserId,
  onCreateWorkout,
}: TrainingsHeaderProps) {
  return (
    <div className="mb-8 flex flex-col md:flex-row gap-2 items-center justify-between">
      <div className="flex flex-col items-center gap-1 pb-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Workouts</h1>
        <p className="text-muted-foreground">
          Track and manage all your training sessions
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCopyUserId}
          title="Copy your User ID to clipboard"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy User ID
        </Button>
        <Button onClick={onCreateWorkout}>
          <Plus className="h-4 w-4 mr-2" />
          New Workout
        </Button>
      </div>
    </div>
  );
}
