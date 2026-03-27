interface TimerDisplayProps {
  seconds: number;
  direction: "up" | "down";
  targetSeconds: number;
  currentSet: number;
  totalSets: number;
  isPreCountdownActive: boolean;
  countdownSeconds: number;
}

const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const secs = value % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export function TimerDisplay({
  seconds,
  direction,
  targetSeconds,
  currentSet,
  totalSets,
  isPreCountdownActive,
  countdownSeconds,
}: TimerDisplayProps) {
  const shownSeconds = direction === "down" ? Math.max(seconds, 0) : seconds;
  const progress =
    direction === "down"
      ? ((targetSeconds - Math.max(seconds, 0)) / Math.max(targetSeconds, 1)) * 100
      : (seconds / Math.max(targetSeconds, 1)) * 100;

  return (
    <div className="space-y-4">
      <div className="text-center">
        {isPreCountdownActive ? (
          <>
            <p className="text-sm text-muted-foreground mb-2">Starting in</p>
            <div className="text-[clamp(4rem,24vw,8rem)] leading-none font-mono font-bold tracking-wide">
              {Math.max(countdownSeconds, 0)}
            </div>
          </>
        ) : (
          <div className="text-[clamp(3.5rem,20vw,7rem)] leading-none font-mono font-bold tracking-wide">
            {formatTime(shownSeconds)}
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Set {currentSet} of {totalSets}
        </p>
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
