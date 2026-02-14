"use client";

import { Dumbbell } from "lucide-react";
import { RoundItem } from "./round-item";
import type { Exercise, Round } from "@/schemas/database";
import { Separator } from "../ui/separator";
// import { Badge } from "@/components/ui/badge";

interface ExerciseItemProps {
  exercise: Exercise;
  exerciseIndex: number;
  totalExercises: number;
  onToggleRoundDone: (roundId: string, currentDone: boolean) => void;
}

export const ExerciseItem = ({
  exercise,
  exerciseIndex,
  totalExercises,
  onToggleRoundDone,
}: ExerciseItemProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-primary" />
        <h4 className="font-semibold">{exercise.name}</h4>
        {/* <Badge variant="outline" className="text-xs">
          {exercise?.rounds?.length}{" "}
          {exercise?.rounds?.length === 1 ? "Set" : "Sets"}
        </Badge> */}
      </div>

      <div className="space-y-2">
        {exercise?.rounds?.map((round: Round, roundIndex: number) => (
          <RoundItem
            key={round.id}
            round={round}
            roundIndex={roundIndex}
            onToggleRoundDone={onToggleRoundDone}
          />
        ))}
      </div>

      {exerciseIndex < totalExercises - 1 && <Separator className="ml-6" />}
    </div>
  );
};
