"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimerControls } from "@/components/timer/timer-controls";
import { TimerDisplay } from "@/components/timer/timer-display";
import { useSessionTimer } from "@/hooks/use-session-timer";

export default function TimerPage() {
  const searchParams = useSearchParams();

  const defaultMinutes = useMemo(() => {
    const parsed = Number(searchParams.get("minutes") || 1);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);

  const [direction, setDirection] = useState<"up" | "down">("down");
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [totalSets, setTotalSets] = useState(1);

  const targetSeconds = Math.max(minutes, 1) * 60;

  const {
    isRunning,
    isPreCountdownActive,
    countdownSeconds,
    seconds,
    currentSet,
    start,
    pause,
    reset,
  } = useSessionTimer({
    targetSeconds,
    direction,
    totalSets: Math.max(totalSets, 1),
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 pb-20 pt-4 py-20">
          <div className="mx-auto max-w-2xl space-y-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/kettlebell">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Session Timer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <TimerDisplay
                  seconds={seconds}
                  direction={direction}
                  targetSeconds={targetSeconds}
                  currentSet={currentSet}
                  totalSets={Math.max(totalSets, 1)}
                  isPreCountdownActive={isPreCountdownActive}
                  countdownSeconds={countdownSeconds}
                />

                <TimerControls
                  direction={direction}
                  minutes={Math.max(minutes, 1)}
                  totalSets={Math.max(totalSets, 1)}
                  isRunning={isRunning}
                  onDirectionChange={setDirection}
                  onMinutesChange={setMinutes}
                  onSetsChange={setTotalSets}
                  onStart={start}
                  onPause={pause}
                  onReset={reset}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
