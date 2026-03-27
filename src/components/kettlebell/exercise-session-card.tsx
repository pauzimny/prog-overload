import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KettlebellTrainingWithExercises } from "@/lib/kettlebell-operations";
import { RoundEditorItem } from "./round-editor-item";

type KettlebellExercise =
  KettlebellTrainingWithExercises["kettlebell_exercises"][number];
type KettlebellRound = KettlebellExercise["kettlebell_rounds"][number];

interface ExerciseSessionCardProps {
  exercises: KettlebellExercise[];
  savingRoundIds: Set<string>;
  onToggleRoundCompleted: (roundId: string, currentCompleted: boolean) => void;
  onSaveRound: (roundId: string) => void;
  onUpdateRound: (
    roundId: string,
    updater: (round: KettlebellRound) => KettlebellRound,
  ) => void;
}

export function ExerciseSessionCard({
  exercises,
  savingRoundIds,
  onToggleRoundCompleted,
  onSaveRound,
  onUpdateRound,
}: ExerciseSessionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercises</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="border rounded-md p-3 space-y-2">
            <div className="font-medium">
              {exerciseIndex + 1}. {exercise.name}
            </div>
            <div className="space-y-3">
              {exercise.kettlebell_rounds.map((round, roundIndex) => (
                <RoundEditorItem
                  key={round.id}
                  round={round}
                  roundIndex={roundIndex}
                  isSaving={savingRoundIds.has(round.id)}
                  onToggleCompleted={onToggleRoundCompleted}
                  onSaveRound={onSaveRound}
                  onUpdateRound={onUpdateRound}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
