"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { getUserKettlebellTrainings, type KettlebellTrainingWithExercises } from "@/lib/kettlebell-operations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";

export default function KettlebellPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { toasts, toast, removeToast } = useToast();
  const [plans, setPlans] = useState<KettlebellTrainingWithExercises[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user) return;

      try {
        setPlansLoading(true);
        const trainings = await getUserKettlebellTrainings(user.id);
        setPlans(trainings.filter((training) => !training.completed));
      } catch (error) {
        console.error("Failed to fetch kettlebell plans:", error);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [user]);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      toast({
        message: "Kettlebell training created successfully!",
        type: "success",
      });
    }
  }, [searchParams, toast]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 pb-20 pt-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Kettlebell</CardTitle>
                  <CardDescription>Small module in progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create and manage kettlebell-specific trainings.
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Plans
                  </CardTitle>
                  <CardDescription>Your kettlebell training plans</CardDescription>
                </CardHeader>
                <CardContent>
                  {plansLoading ? (
                    <div className="text-sm text-muted-foreground">Loading plans...</div>
                  ) : plans.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No plans yet</div>
                  ) : (
                    <div className="space-y-3">
                      {plans.slice(0, 5).map((plan) => (
                        <div
                          key={plan.id}
                          className="flex items-center justify-between border rounded-md p-3"
                        >
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {plan.kettlebell_exercises.length} exercises • {new Date(plan.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/kettlebell/trainings/${plan.id}`}>Start</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="group transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add New Training
                  </CardTitle>
                  <CardDescription>
                    Start a new kettlebell training with exercises and rounds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/kettlebell/create">Add New Training</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ProtectedRoute>
  );
}
