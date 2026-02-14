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
import { Dumbbell, Plus, Copy } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import CreateTrainingForm from "@/components/create-training-form";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import {
  getUserTrainings,
  type TrainingWithExercises,
} from "@/lib/database-operations";
import { isAdmin } from "@/lib/admin";
import { PlansCard } from "@/components/dashboard/plans-card";
import { WorkoutsCard } from "@/components/dashboard/workouts-card";

export default function Dashboard() {
  const { user } = useAuth();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [plans, setPlans] = useState<TrainingWithExercises[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();

  const fetchPlans = useCallback(async () => {
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
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setPlansLoading(false);
    }
  }, [user]);

  // todo: replace with useQuery
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Debug admin status - remove this later
  useEffect(() => {
    if (user) {
      isAdmin(user.id);
    }
  }, [user]);

  // const copyUserIdToClipboard = () => {
  //   if (user?.id) {
  //     navigator.clipboard
  //       .writeText(user.id)
  //       .then(() => {
  //         toast({ message: "User ID copied to clipboard!", type: "success" });
  //       })
  //       .catch((err) => {
  //         console.error("Failed to copy user ID: ", err);
  //         toast({ message: "Failed to copy User ID", type: "error" });
  //       });
  //   }
  // };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 pb-20 pt-4 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-4">
                <div>
                  <h1 className="md:text-2xl text-xl font-bold tracking-tight">
                    Welcome back, {user?.email?.split("@")[0]}!
                  </h1>
                  <p className="md:text-base text-sm text-muted-foreground">
                    Manage your workouts and track your fitness journey
                  </p>
                </div>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUserIdToClipboard}
                  title="Copy your User ID to clipboard"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy User ID
                </Button> */}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <PlansCard plans={plans} plansLoading={plansLoading} />

              <WorkoutsCard />

              <Card
                className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                onClick={() => setIsCreateFormOpen(true)}
              >
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
                    variant="outline"
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
