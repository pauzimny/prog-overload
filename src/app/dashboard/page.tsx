"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, Copy, Calendar } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import CreateTrainingForm from "@/components/create-training-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import {
  getUserTrainings,
  type TrainingWithExercises,
} from "@/lib/database-operations";
import { format } from "date-fns";
import { isAdmin } from "@/lib/admin";

export default function Dashboard() {
  const { user } = useAuth();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [plans, setPlans] = useState<TrainingWithExercises[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();

  const fetchPlans = async () => {
    if (!user) return;

    try {
      setPlansLoading(true);
      const allTrainings = await getUserTrainings(user.id);
      const planTrainings = allTrainings
        .filter((training) => training.status === "plan")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      setPlans(planTrainings);
    } catch (err: any) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user]);

  // Debug admin status - remove this later
  useEffect(() => {
    if (user) {
      isAdmin(user.id);
    }
  }, [user]);

  const copyUserIdToClipboard = () => {
    if (user?.id) {
      navigator.clipboard
        .writeText(user.id)
        .then(() => {
          toast({ message: "User ID copied to clipboard!", type: "success" });
        })
        .catch((err) => {
          console.error("Failed to copy user ID: ", err);
          toast({ message: "Failed to copy User ID", type: "error" });
        });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user?.email?.split("@")[0]}!
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your workouts and track your fitness journey
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUserIdToClipboard}
                  title="Copy your User ID to clipboard"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy User ID
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Plans Card */}
              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Plans
                  </CardTitle>
                  <CardDescription>Your upcoming workout plans</CardDescription>
                </CardHeader>
                <CardContent>
                  {plansLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Loading plans...
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No plans yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {plans.slice(0, 3).map((plan) => (
                        <div key={plan.id} className="text-sm">
                          <div className="font-medium">
                            {plan.exercises[0]?.name || "Untitled Plan"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {format(new Date(plan.created_at), "MMM d")}
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
                    variant="outline"
                    className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => router.push("/trainings")}
                  >
                    View All Plans
                  </Button>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
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
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => router.push("/trainings")}
                  >
                    View Workouts
                  </Button>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add New Workout
                  </CardTitle>
                  <CardDescription>
                    Create a new workout session and track your progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full transition-colors"
                    onClick={() => setIsCreateFormOpen(true)}
                  >
                    Add Workout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <CreateTrainingForm
        isOpen={isCreateFormOpen}
        onClose={() => {
          setIsCreateFormOpen(false);
          fetchPlans(); // Refresh plans after creating a new training
        }}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ProtectedRoute>
  );
}
