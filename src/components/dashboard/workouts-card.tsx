import { Dumbbell } from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useRouter } from "next/navigation";

export const WorkoutsCard = () => {
  const router = useRouter();
  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={() => router.push("/trainings")}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Your Workouts
        </CardTitle>
        <CardDescription>
          View and manage your existing workout sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          onClick={() => router.push("/trainings")}
        >
          View Workouts
        </Button>
      </CardContent>
    </Card>
  );
};
