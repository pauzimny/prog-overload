"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import {
  getUserKettlebellTrainings,
  updateKettlebellRound,
  updateKettlebellTraining,
  type KettlebellTrainingWithExercises,
} from "@/lib/kettlebell-operations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { TrainingHeaderCard } from "@/components/kettlebell/training-header-card";
import { ExerciseSessionCard } from "@/components/kettlebell/exercise-session-card";

type KettlebellExercise =
  KettlebellTrainingWithExercises["kettlebell_exercises"][number];
type KettlebellRound = KettlebellExercise["kettlebell_rounds"][number];

export default function KettlebellTrainingPage() {
  const params = useParams<{ trainingId: string }>();
  const trainingId = params?.trainingId;
  const { user } = useAuth();
  const { toasts, toast, removeToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState<KettlebellTrainingWithExercises | null>(
    null,
  );
  const [savingRoundIds, setSavingRoundIds] = useState<Set<string>>(new Set());
  const [savingTrainingStatus, setSavingTrainingStatus] = useState(false);

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

  const updateRoundInState = (
    roundId: string,
    updater: (round: KettlebellRound) => KettlebellRound,
  ) => {
    setTraining((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        kettlebell_exercises: prev.kettlebell_exercises.map((exercise) => ({
          ...exercise,
          kettlebell_rounds: exercise.kettlebell_rounds.map((round) =>
            round.id === roundId ? updater(round) : round,
          ),
        })),
      };
    });
  };

  const handleToggleRoundCompleted = async (
    roundId: string,
    currentCompleted: boolean,
  ) => {
    try {
      setSavingRoundIds((prev) => new Set(prev).add(roundId));

      updateRoundInState(roundId, (round) => ({
        ...round,
        completed: !currentCompleted,
      }));

      await updateKettlebellRound(roundId, {
        completed: !currentCompleted,
      });
    } catch (error) {
      updateRoundInState(roundId, (round) => ({
        ...round,
        completed: currentCompleted,
      }));
      toast({
        message: "Failed to update round completion.",
        type: "error",
      });
    } finally {
      setSavingRoundIds((prev) => {
        const next = new Set(prev);
        next.delete(roundId);
        return next;
      });
    }
  };

  const handleSaveRound = async (roundId: string) => {
    if (!training) return;

    const round = training.kettlebell_exercises
      .flatMap((exercise) => exercise.kettlebell_rounds)
      .find((item) => item.id === roundId);

    if (!round) return;

    if ((round.reps == null && round.time_minutes == null) || (round.reps != null && round.time_minutes != null)) {
      toast({
        message: "Round must contain either reps or time.",
        type: "error",
      });
      return;
    }

    try {
      setSavingRoundIds((prev) => new Set(prev).add(roundId));

      await updateKettlebellRound(roundId, {
        weight: round.weight,
        reps: round.reps ?? undefined,
        time_minutes: round.time_minutes ?? undefined,
        comments: round.comments ?? null,
        completed: round.completed,
      });

      toast({ message: "Round updated.", type: "success" });
    } catch (error) {
      toast({ message: "Failed to save round changes.", type: "error" });
    } finally {
      setSavingRoundIds((prev) => {
        const next = new Set(prev);
        next.delete(roundId);
        return next;
      });
    }
  };

  const handleToggleTrainingCompleted = async () => {
    if (!training) return;

    try {
      setSavingTrainingStatus(true);
      const nextCompleted = !training.completed;

      setTraining((prev) =>
        prev ? { ...prev, completed: nextCompleted } : prev,
      );

      await updateKettlebellTraining(training.id, { completed: nextCompleted });

      toast({
        message: nextCompleted
          ? "Training marked as completed."
          : "Training marked as active plan.",
        type: "success",
      });
    } catch (error) {
      setTraining((prev) =>
        prev ? { ...prev, completed: !prev.completed } : prev,
      );
      toast({
        message: "Failed to update training status.",
        type: "error",
      });
    } finally {
      setSavingTrainingStatus(false);
    }
  };

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
                <TrainingHeaderCard
                  training={training}
                  savingTrainingStatus={savingTrainingStatus}
                  onToggleTrainingCompleted={handleToggleTrainingCompleted}
                />

                <ExerciseSessionCard
                  exercises={training.kettlebell_exercises}
                  savingRoundIds={savingRoundIds}
                  onToggleRoundCompleted={handleToggleRoundCompleted}
                  onSaveRound={handleSaveRound}
                  onUpdateRound={updateRoundInState}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ProtectedRoute>
  );
}
