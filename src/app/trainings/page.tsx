"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/protected-route";
import CreateTrainingForm from "@/components/create-training-form";
import WorkoutTimer from "@/components/workout-timer";
import TrainingCard from "@/components/trainings/training-card";
import EmptyState from "@/components/trainings/empty-state";
import TrainingsHeader from "@/components/trainings/trainings-header";
import { useTrainingOperations } from "@/hooks/use-training-operations";
import { getUserTrainings } from "@/lib/database-operations";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { TrainingWithExercises } from "@/schemas/database";

export default function TrainingsPage() {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<TrainingWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [activeWorkout, setActiveWorkout] =
    useState<TrainingWithExercises | null>(null);
  const { toasts, removeToast } = useToast();
  const {
    copyTrainingToClipboard,
    copyUserIdToClipboard,
    toggleTrainingStatus,
    deleteTraining,
    setTrainingAsDone,
    toggleRoundDoneStatus,
  } = useTrainingOperations();

  const fetchTrainings = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleCreateSuccess = () => {
    setIsCreateFormOpen(false);
    fetchTrainings();
  };

  const startWorkout = (training: TrainingWithExercises) => {
    setActiveWorkout(training);
  };

  const completeWorkout = () => {
    setActiveWorkout(null);
    fetchTrainings(); // Refresh the list to show updated status
  };

  const handleToggleStatus = async (
    trainingId: string,
    currentStatus: "plan" | "done",
  ) => {
    const success = await toggleTrainingStatus(trainingId, currentStatus);
    if (success) {
      fetchTrainings(); // Refresh the list
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    const success = await deleteTraining(trainingId);
    if (success) {
      fetchTrainings(); // Refresh the list
    }
  };

  const handleSetAsDone = async (training?: TrainingWithExercises) => {
    if (!training) return;
    const success = await setTrainingAsDone(training);

    if (success) {
      fetchTrainings(); // Refresh list
    }
  };

  const handleToggleRoundDone = async (
    roundId: string,
    currentDone: boolean,
  ) => {
    const success = await toggleRoundDoneStatus(roundId, currentDone);
    if (success) {
      fetchTrainings(); // Refresh list to show updated round status
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-linear-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-3 py-20">
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
        <div className="container mx-auto px-4 pb-20 pt-4 py-20">
          <div className="mx-auto max-w-6xl">
            {/* Show Workout Timer when active */}
            {activeWorkout ? (
              <WorkoutTimer
                training={activeWorkout}
                onComplete={completeWorkout}
              />
            ) : (
              <>
                {/* Header */}
                <TrainingsHeader
                  onCopyUserId={copyUserIdToClipboard}
                  onCreateWorkout={() => setIsCreateFormOpen(true)}
                />

                {error && (
                  <div className="mb-6 text-sm text-destructive bg-destructive/10 p-3 rounded">
                    {error}
                  </div>
                )}

                {trainings.length === 0 ? (
                  <EmptyState
                    onCreateWorkout={() => setIsCreateFormOpen(true)}
                  />
                ) : (
                  <div className="space-y-6">
                    {trainings.map((training) => (
                      <TrainingCard
                        key={training.id}
                        training={training}
                        onStartWorkout={startWorkout}
                        onSetAsDone={handleSetAsDone}
                        onCopyTraining={copyTrainingToClipboard}
                        onDeleteTraining={handleDeleteTraining}
                        onToggleStatus={handleToggleStatus}
                        onToggleRoundDone={handleToggleRoundDone}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <CreateTrainingForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ProtectedRoute>
  );
}
