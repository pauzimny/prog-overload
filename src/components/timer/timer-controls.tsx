import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pause, Play, RotateCcw } from "lucide-react";

interface TimerControlsProps {
  direction: "up" | "down";
  minutes: number;
  totalSets: number;
  isRunning: boolean;
  onDirectionChange: (value: "up" | "down") => void;
  onMinutesChange: (value: number) => void;
  onSetsChange: (value: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  direction,
  minutes,
  totalSets,
  isRunning,
  onDirectionChange,
  onMinutesChange,
  onSetsChange,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Direction</Label>
          <Select value={direction} onValueChange={onDirectionChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="up">Count Up (0 → target)</SelectItem>
              <SelectItem value="down">Count Down (target → 0)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Minutes</Label>
          <Input
            type="number"
            min={1}
            value={minutes}
            onChange={(event) => onMinutesChange(Number(event.target.value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <Label>Set Count</Label>
          <Input
            type="number"
            min={1}
            value={totalSets}
            onChange={(event) => onSetsChange(Number(event.target.value) || 1)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        {isRunning ? (
          <Button onClick={onPause} variant="secondary">
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
        ) : (
          <Button onClick={onStart}>
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
        )}

        <Button onClick={onReset} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
