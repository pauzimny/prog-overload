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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();

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
              <div className="flex items-center justify-between mb-4">
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

            <div className="grid gap-6 md:grid-cols-2">
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
        onClose={() => setIsCreateFormOpen(false)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ProtectedRoute>
  );
}
