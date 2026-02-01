import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { updateTrainingStatus } from "@/lib/database-operations";
import type { TrainingWithExercises } from "@/lib/database-operations";
import { useToast } from "@/hooks/use-toast";

export function useTrainingOperations() {
  const { user } = useAuth();
  const { toast } = useToast();

  const copyTrainingToClipboard = (training: TrainingWithExercises) => {
    const exercisesList = training.exercises
      .map((exercise) => {
        const roundsList = exercise.rounds
          .map(
            (round) =>
              `${round.weight}kg × ${round.reps}${
                round.comments ? ` (${round.comments})` : ""
              }`,
          )
          .join(", ");
        return `${exercise.name}: ${roundsList}`;
      })
      .join("\n");

    const comment = training.comments
      ? `\n\nDodatkowy komentarz: ${training.comments}`
      : "";

    const textToCopy = `Na ostatnim treningu zrobiono:\n${exercisesList}${comment}`;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast({
          message: "Training summary copied to clipboard!",
          type: "success",
        });
      })
      .catch((err) => {
        console.error("Failed to copy training: ", err);
        toast({ message: "Failed to copy training summary", type: "error" });
      });
  };

  const copyUserIdToClipboard = () => {
    if (user?.id) {
      navigator.clipboard
        .writeText(user.id)
        .then(() => {
          toast({ message: "User ID copied to clipboard!", type: "success" });
        })
        .catch((err) => {
          console.error("Failed to copy user ID: ", err);
          toast({ message: "Failed to copy User ID", type: "error" });
        });
    }
  };

  const toggleTrainingStatus = async (
    trainingId: string,
    currentStatus: "plan" | "done",
  ) => {
    const newStatus = currentStatus === "plan" ? "done" : "plan";

    try {
      await updateTrainingStatus(trainingId, newStatus);
      toast({
        message: `Training marked as ${newStatus}!`,
        type: "success",
      });
      return true; // Indicate success
    } catch (err: any) {
      console.error("Failed to update training status: ", err);
      toast({
        message: "Failed to update training status",
        type: "error",
      });
      return false; // Indicate failure
    }
  };

  const deleteTraining = async (trainingId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this workout? This action cannot be undone.",
      )
    ) {
      return false; // User cancelled
    }

    try {
      // Delete rounds first (due to foreign key constraints)
      const { data: exercises } = await supabase
        .from("exercises")
        .select("id")
        .eq("training_id", trainingId);

      if (exercises && exercises.length > 0) {
        const exerciseIds = exercises.map((ex) => ex.id);
        await supabase.from("rounds").delete().in("exercise_id", exerciseIds);
      }

      // Delete exercises
      await supabase.from("exercises").delete().eq("training_id", trainingId);

      // Delete training
      const { error } = await supabase
        .from("trainings")
        .delete()
        .eq("id", trainingId);

      if (error) throw error;

      toast({
        message: "Workout deleted successfully!",
        type: "success",
      });
      return true; // Indicate success
    } catch (err: any) {
      console.error("Failed to delete workout: ", err);
      toast({
        message: "Failed to delete workout",
        type: "error",
      });
      return false; // Indicate failure
    }
  };

  const setTrainingAsDone = async (training: TrainingWithExercises) => {
    if (
      window.confirm("Are you sure you want to mark this training as done?")
    ) {
      return await toggleTrainingStatus(training.id, training.status);
    }
    return false;
  };

  return {
    copyTrainingToClipboard,
    copyUserIdToClipboard,
    toggleTrainingStatus,
    deleteTraining,
    setTrainingAsDone,
  };
}
