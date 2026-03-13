import { CheckCircle, Circle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { Round } from "@/schemas/database";

interface RoundItemProps {
  round: Round;
  roundIndex: number;
  onToggleRoundDone: (roundId: string, currentDone: boolean) => void;
}

export const RoundItem = ({
  round,
  roundIndex,
  onToggleRoundDone,
}: RoundItemProps) => {
  if (!round) return null;
  const isDone = round?.done;

  return (
    <div
      key={round.id}
      className={`flex flex-col gap-y-4 text-sm grow w-full justify-between p-3 rounded-lg border transition-all duration-200 ${
        isDone
          ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-950/20 dark:to-teal-950/20 dark:border-emerald-800"
          : "bg-background border-border"
      }`}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleRoundDone(round.id!, round?.done)}
          className={`p-1 h-6 w-6 transition-all duration-200 ${
            isDone
              ? "hover:bg-emerald-200 dark:hover:bg-emerald-800"
              : "hover:bg-muted"
          }`}
          title={isDone ? "Mark as not done" : "Mark as done"}
        >
          {isDone ? (
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Badge
          variant={isDone ? "default" : "secondary"}
          className={`text-xs hidden md:block transition-all duration-200 ${
            isDone
              ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              : ""
          }`}
        >
          Set {roundIndex + 1}
        </Badge>
        <Badge
          variant={isDone ? "default" : "secondary"}
          className={`text-xs md:hidden transition-all duration-200 ${
            isDone
              ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              : ""
          }`}
        >
          {roundIndex + 1}
        </Badge>
        <span
          className={`font-medium transition-all duration-200 ${
            isDone
              ? "line-through text-emerald-700 dark:text-emerald-300"
              : "text-foreground"
          }`}
        >
          {round.weight} kg
        </span>
        <span
          className={`transition-all duration-200 ${
            isDone
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
          }`}
        >
          ×
        </span>
        <span
          className={`font-medium transition-all duration-200 ${
            isDone
              ? "line-through text-emerald-700 dark:text-emerald-300"
              : "text-foreground"
          }`}
        >
          {round.reps} reps
        </span>
      </div>
      {round.comments && (
        <span
          className={`italic transition-all duration-200 ${
            isDone
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
          }`}
        >
          ({round.comments})
        </span>
      )}
    </div>
  );
};
