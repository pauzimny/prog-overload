import { TrainingWithExercises } from "@/schemas/database";
import { Calendar } from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface PlansCardProps {
  plans: TrainingWithExercises[];
  plansLoading: boolean;
}

export const PlansCard = ({ plans, plansLoading }: PlansCardProps) => {
  const router = useRouter();
  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={() => router.push("/trainings")}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Plans
        </CardTitle>
        <CardDescription>Your upcoming workout plans</CardDescription>
      </CardHeader>
      <CardContent>
        {plansLoading ? (
          <div className="text-sm text-muted-foreground">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="text-sm text-muted-foreground">No plans yet</div>
        ) : (
          <div className="space-y-2">
            {plans.slice(0, 3).map((plan) => (
              <div key={plan.id} className="text-sm">
                <div className="font-medium">
                  {plan.exercises[0]?.name || "Untitled Plan"}
                </div>
                <div className="text-muted-foreground text-xs">
                  {format(new Date(plan?.created_at || ""), "MMM d")}
                </div>
              </div>
            ))}
            {plans.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{plans.length - 3} more plans
              </div>
            )}
          </div>
        )}
        <Button
          className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          onClick={() => router.push("/trainings")}
        >
          View All Plans
        </Button>
      </CardContent>
    </Card>
  );
};
