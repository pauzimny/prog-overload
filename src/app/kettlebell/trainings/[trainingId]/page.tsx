"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import {
  getUserKettlebellTrainings,
  type KettlebellTrainingWithExercises,
} from "@/lib/kettlebell-operations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KettlebellTrainingPage() {
  const params = useParams<{ trainingId: string }>();
  const trainingId = params?.trainingId;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState<KettlebellTrainingWithExercises | null>(
    null,
  );

  useEffect(() => {
    const loadTraining = async () => {
      if (!user || !trainingId) return;

      try {
        setLoading(true);
        const trainings = await getUserKettlebellTrainings(user.id);
        const selected = trainings.find((item) => item.id === trainingId) || null;
        setTraining(selected);
      } catch (error) {
        console.error("Failed to load kettlebell training:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTraining();
  }, [user, trainingId]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 pb-20 pt-4 py-20">
          <div className="mx-auto max-w-4xl space-y-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/kettlebell">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Kettlebell
              </Link>
            </Button>

            {loading ? (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Loading training...
                </CardContent>
              </Card>
            ) : !training ? (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Training not found.
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{training.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Created: {new Date(training.created_at).toLocaleString()}
                    </p>
                    {training.comments && <p>{training.comments}</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Exercises</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {training.kettlebell_exercises.map((exercise, exerciseIndex) => (
                      <div key={exercise.id} className="border rounded-md p-3 space-y-2">
                        <div className="font-medium">
                          {exerciseIndex + 1}. {exercise.name}
                        </div>
                        <div className="space-y-1">
                          {exercise.kettlebell_rounds.map((round, roundIndex) => (
                            <div
                              key={round.id}
                              className="text-sm text-muted-foreground"
                            >
                              Round {roundIndex + 1}: {round.weight}kg •{" "}
                              {round.reps ? `${round.reps} reps` : `${round.time_minutes} min`}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
