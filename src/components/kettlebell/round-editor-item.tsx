import { CheckCircle, Circle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KettlebellTrainingWithExercises } from "@/lib/kettlebell-operations";

type KettlebellExercise =
  KettlebellTrainingWithExercises["kettlebell_exercises"][number];
type KettlebellRound = KettlebellExercise["kettlebell_rounds"][number];

interface RoundEditorItemProps {
  round: KettlebellRound;
  roundIndex: number;
  isSaving: boolean;
  onToggleCompleted: (roundId: string, currentCompleted: boolean) => void;
  onSaveRound: (roundId: string) => void;
  onUpdateRound: (
    roundId: string,
    updater: (round: KettlebellRound) => KettlebellRound,
  ) => void;
}

export function RoundEditorItem({
  round,
  roundIndex,
  isSaving,
  onToggleCompleted,
  onSaveRound,
  onUpdateRound,
}: RoundEditorItemProps) {
  return (
    <div
      className={`border rounded-md p-3 space-y-2 ${
        round.completed
          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
          : "bg-background"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-1"
            onClick={() => onToggleCompleted(round.id, round.completed)}
            disabled={isSaving}
          >
            {round.completed ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Badge variant={round.completed ? "default" : "secondary"}>
            Round {roundIndex + 1}
          </Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSaveRound(round.id)}
          disabled={isSaving}
        >
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <div>
          <Label className="text-xs">Weight</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={round.weight ?? 0}
            onChange={(event) => {
              const value = Number(event.target.value) || 0;
              onUpdateRound(round.id, (current) => ({
                ...current,
                weight: value,
              }));
            }}
          />
        </div>

        <div>
          <Label className="text-xs">Type</Label>
          <Select
            value={round.reps != null ? "reps" : "time"}
            onValueChange={(value: "reps" | "time") => {
              onUpdateRound(round.id, (current) => ({
                ...current,
                reps: value === "reps" ? current.reps ?? 1 : null,
                time_minutes:
                  value === "time" ? current.time_minutes ?? 1 : null,
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reps">Reps</SelectItem>
              <SelectItem value="time">Time (min)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">
            {round.reps != null ? "Reps" : "Time (min)"}
          </Label>
          <Input
            type="number"
            min="1"
            value={round.reps != null ? round.reps : round.time_minutes ?? 1}
            onChange={(event) => {
              const value = Number(event.target.value) || 1;
              onUpdateRound(round.id, (current) =>
                current.reps != null
                  ? { ...current, reps: value }
                  : { ...current, time_minutes: value },
              );
            }}
          />
        </div>

        <div>
          <Label className="text-xs">Comments</Label>
          <Input
            value={round.comments ?? ""}
            onChange={(event) => {
              onUpdateRound(round.id, (current) => ({
                ...current,
                comments: event.target.value || null,
              }));
            }}
            placeholder="Optional"
          />
        </div>
      </div>
    </div>
  );
}
