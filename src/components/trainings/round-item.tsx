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
  return (
    <div
      key={round.id}
      className="flex flex-col gap-y-4 text-sm grow w-full justify-between"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleRoundDone(round.id!, round?.done)}
          className="p-1 h-6 w-6"
          title={round?.done ? "Mark as not done" : "Mark as done"}
        >
          {round?.done ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Badge variant="secondary" className="text-xs hidden md:block">
          Set {roundIndex + 1}
        </Badge>
        <Badge variant="secondary" className="text-xs md:hidden">
          {roundIndex + 1}
        </Badge>
        <span
          className={`font-medium ${round.done ? "line-through text-muted-foreground" : ""}`}
        >
          {round.weight} kg
        </span>
        <span className="text-muted-foreground">×</span>
        <span
          className={`font-medium ${round.done ? "line-through text-muted-foreground" : ""}`}
        >
          {round.reps} reps
        </span>
      </div>
      {round.comments && (
        <span className="text-muted-foreground italic">({round.comments})</span>
      )}
    </div>
  );
};
