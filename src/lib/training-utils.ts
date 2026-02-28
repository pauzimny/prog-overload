import type { TrainingWithExercises } from "@/schemas/database";

export function copyTrainingToClipboard(training: TrainingWithExercises) {
  // Check if training and exercises exist
  if (!training || !training.exercises || !Array.isArray(training.exercises)) {
    return Promise.resolve({
      success: false,
      message: "No training data available to copy",
    });
  }

  console.log("Training data for copy:", JSON.stringify(training, null, 2));

  const exercisesList = training.exercises
    .map((exercise) => {
      // Check if exercise and rounds exist
      if (!exercise || !exercise.rounds || !Array.isArray(exercise.rounds)) {
        return `${exercise?.name || "Unknown Exercise"}: No data available`;
      }

      const roundsList = exercise.rounds
        .map((round) => {
          const doneStatus = round.done ? "✓" : "○";
          return `${doneStatus} ${round.weight || 0}kg × ${round.reps || 0}${
            round.comments ? ` (${round.comments})` : ""
          }`;
        })
        .join(", ");
      return `${exercise.name || "Unknown Exercise"}: ${roundsList}`;
    })
    .join("\n");

  const comment = training.comments
    ? `\n\nDodatkowy komentarz: ${training.comments}`
    : "";

  const statusInfo =
    training.status === "done"
      ? "Trening zakończony"
      : training.status === "active"
        ? "Trening w trakcie"
        : "Planowany trening";

  const textToCopy = `${statusInfo}:\n${exercisesList}${comment}\n\nLegendy: ✓ - zrobione, ○ - niezrobione`;

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
