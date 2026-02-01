"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Dumbbell, Calendar, Activity, Shield } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

interface AdminStats {
  totalUsers: number;
  totalTrainings: number;
  totalPlans: number;
  totalDone: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setError("Please log in to access admin panel.");
        setLoading(false);
        return;
      }

      const adminStatus = await isAdmin(user.id);
      setIsAdminUser(adminStatus);

      if (!adminStatus) {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      fetchAdminStats();
    };

    checkAdminStatus();
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get total users count
      const { count: totalUsers } = await supabase
        .from("auth.users")
        .select("*", { count: "exact", head: true });

      // Get total trainings
      const { count: totalTrainings } = await supabase
        .from("trainings")
        .select("*", { count: "exact", head: true });

      // Get plans count
      const { count: totalPlans } = await supabase
        .from("trainings")
        .select("*", { count: "exact", head: true })
        .eq("status", "plan");

      // Get done trainings count
      const { count: totalDone } = await supabase
        .from("trainings")
        .select("*", { count: "exact", head: true })
        .eq("status", "done");

      // Get recent activity (last 10 trainings)
      const { data: recentTrainings } = await supabase
        .from("trainings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      const recentActivity =
        recentTrainings?.map((training) => ({
          id: training.id,
          type:
            training.status === "done"
              ? "workout_completed"
              : "workout_planned",
          description: `User ${training.status === "done" ? "completed" : "planned"} a workout`,
          timestamp: training.created_at,
        })) || [];

      setStats({
        totalUsers: totalUsers || 0,
        totalTrainings: totalTrainings || 0,
        totalPlans: totalPlans || 0,
        totalDone: totalDone || 0,
        recentActivity,
      });
    } catch (err: any) {
      console.error("Failed to fetch admin stats:", err);
      setError("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-4 py-20">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading admin dashboard...
                </p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !isAdminUser) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">
                {error || "Admin privileges required"}
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-8 w-8" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage users and monitor platform activity
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Trainings
                  </CardTitle>
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalTrainings}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All workout sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Plans
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPlans}</div>
                  <p className="text-xs text-muted-foreground">Workout plans</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalDone}</div>
                  <p className="text-xs text-muted-foreground">
                    Finished workouts
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest workout activities across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentActivity.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  ) : (
                    stats?.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            activity.type === "workout_completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {activity.type === "workout_completed"
                            ? "Completed"
                            : "Planned"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
