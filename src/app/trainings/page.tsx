"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, Calendar, Clock, Trash2, Edit, Plus } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import CreateTrainingForm from "@/components/create-training-form";
import {
  getUserTrainings,
  type TrainingWithExercises,
} from "@/lib/database-operations";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function TrainingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [trainings, setTrainings] = useState<TrainingWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const fetchTrainings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getUserTrainings(user.id);
      setTrainings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [user]);

  const handleCreateSuccess = () => {
    setIsCreateFormOpen(false);
    fetchTrainings();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-4 py-20">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading your workouts...
                </p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Your Workouts
                </h1>
                <p className="text-muted-foreground">
                  Track and manage all your training sessions
                </p>
              </div>
              <Button onClick={() => setIsCreateFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Workout
              </Button>
            </div>

            {error && (
              <div className="mb-6 text-sm text-destructive bg-destructive/10 p-3 rounded">
                {error}
              </div>
            )}

            {trainings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No workouts yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your fitness journey by creating your first
                    workout
                  </p>
                  <Button onClick={() => setIsCreateFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Workout
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {trainings.map((training) => (
                  <Card key={training.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {format(
                                new Date(training.created_at),
                                "MMMM d, yyyy",
                              )}
                            </span>
                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(training.created_at), "h:mm a")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {training.exercises.length}{" "}
                              {training.exercises.length === 1
                                ? "Exercise"
                                : "Exercises"}
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
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                      {training.exercises.map(
                        (exercise: any, exerciseIndex: number) => (
                          <div key={exercise.id} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Dumbbell className="h-4 w-4 text-primary" />
                              <h4 className="font-semibold">{exercise.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {exercise.rounds.length}{" "}
                                {exercise.rounds.length === 1 ? "Set" : "Sets"}
                              </Badge>
                            </div>

                            <div className="ml-6 space-y-2">
                              {exercise.rounds.map(
                                (round: any, roundIndex: number) => (
                                  <div
                                    key={round.id}
                                    className="flex items-center gap-4 text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Set {roundIndex + 1}
                                      </Badge>
                                      <span className="font-medium">
                                        {round.weight} kg
                                      </span>
                                      <span className="text-muted-foreground">
                                        ×
                                      </span>
                                      <span className="font-medium">
                                        {round.reps} reps
                                      </span>
                                    </div>
                                    {round.comments && (
                                      <span className="text-muted-foreground italic">
                                        ({round.comments})
                                      </span>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>

                            {exerciseIndex < training.exercises.length - 1 && (
                              <Separator className="ml-6" />
                            )}
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateTrainingForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
      />
    </ProtectedRoute>
  );
}
