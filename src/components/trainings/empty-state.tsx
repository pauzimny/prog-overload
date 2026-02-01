import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateWorkout: () => void;
}

export default function EmptyState({ onCreateWorkout }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
        <p className="text-muted-foreground mb-4">
          Start tracking your fitness journey by creating your first workout
        </p>
        <Button onClick={onCreateWorkout}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Workout
        </Button>
      </CardContent>
    </Card>
  );
}
