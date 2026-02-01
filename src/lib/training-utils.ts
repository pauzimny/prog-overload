import type { TrainingWithExercises } from "@/lib/database-operations";

export function copyTrainingToClipboard(training: TrainingWithExercises | any) {
  // Check if training and exercises exist
  if (!training || !training.exercises || !Array.isArray(training.exercises)) {
    return Promise.resolve({
      success: false,
      message: "No training data available to copy",
    });
  }

  const exercisesList = training.exercises
    .map((exercise: any) => {
      // Check if exercise and rounds exist
      if (!exercise || !exercise.rounds || !Array.isArray(exercise.rounds)) {
        return `${exercise?.name || "Unknown Exercise"}: No data available`;
      }

      const roundsList = exercise.rounds
        .map(
          (round: any) =>
            `${round.weight || 0}kg × ${round.reps || 0}${
              round.comments ? ` (${round.comments})` : ""
            }`,
        )
        .join(", ");
      return `${exercise.name || "Unknown Exercise"}: ${roundsList}`;
    })
    .join("\n");

  const comment = training.comments
    ? `\n\nDodatkowy komentarz: ${training.comments}`
    : "";

  const textToCopy = `Na ostatnim treningu zrobiono:\n${exercisesList}${comment}`;

  return navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      return {
        success: true,
        message: "Training summary copied to clipboard!",
      };
    })
    .catch((err) => {
      console.error("Failed to copy training: ", err);
      return { success: false, message: "Failed to copy training summary" };
    });
}
