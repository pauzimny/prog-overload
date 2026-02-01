"use client";

import React, { useState, useEffect } from "react";
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
import {
  Users,
  Dumbbell,
  Calendar,
  Activity,
  Shield,
  Upload,
  UserPlus,
  Trash2,
} from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { supabase } from "@/lib/supabase";
import { isAdmin, getAllUsers } from "@/lib/admin";
import { Round } from "@/schemas/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [users, setUsers] = useState<any[]>([]);
  const [uploadJson, setUploadJson] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [userTrainings, setUserTrainings] = useState<{ [key: string]: any[] }>(
    {},
  );
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

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
      fetchUsers();
    };

    checkAdminStatus();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);

      // Fetch trainings for each user
      const trainingsData: { [key: string]: any[] } = {};
      for (const user of usersData) {
        const { data } = await supabase
          .from("trainings")
          .select("*")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false });
        trainingsData[user.user_id] = data || [];
      }
      setUserTrainings(trainingsData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const toggleUserExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const deleteTraining = async (trainingId: string, userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this training? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      // Delete rounds first (due to foreign key constraints)
      const { data: exercises } = await supabase
        .from("exercises")
        .select("id")
        .eq("training_id", trainingId);

      if (exercises && exercises.length > 0) {
        const exerciseIds = exercises.map((ex) => ex.id);
        await supabase.from("rounds").delete().in("exercise_id", exerciseIds);
      }

      // Delete exercises
      await supabase.from("exercises").delete().eq("training_id", trainingId);

      // Delete training
      const { error } = await supabase
        .from("trainings")
        .delete()
        .eq("id", trainingId);

      if (error) throw error;

      // Refresh trainings for this user
      const { data } = await supabase
        .from("trainings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setUserTrainings((prev) => ({
        ...prev,
        [userId]: data || [],
      }));

      // Refresh stats
      fetchAdminStats();

      alert("Training deleted successfully!");
    } catch (error) {
      console.error("Failed to delete training:", error);
      alert("Failed to delete training. Please try again.");
    }
  };

  const uploadTraining = async () => {
    if (!selectedUserId || !uploadJson) {
      alert("Please select a user and provide JSON content");
      return;
    }

    try {
      const trainingData = JSON.parse(uploadJson);

      let exercises = [];
      let comments = "";

      if (trainingData.training && trainingData.exercises) {
        exercises = trainingData.exercises;
        comments = trainingData.training.comments || "";
      } else if (trainingData.exercises) {
        exercises = trainingData.exercises;
        comments = trainingData.comments || "";
      } else {
        throw new Error("Invalid format: exercises array not found");
      }

      const { error: trainingError } = await supabase.from("trainings").insert({
        user_id: selectedUserId,
        status: "plan",
        comments: comments,
        created_at: new Date().toISOString(),
      });

      if (trainingError) throw trainingError;

      const { data: createdTraining } = await supabase
        .from("trainings")
        .select("id")
        .eq("user_id", selectedUserId)
        .eq("status", "plan")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!createdTraining)
        throw new Error("Failed to retrieve created training");

      for (const exercise of exercises) {
        const { data: createdExercise, error: exerciseError } = await supabase
          .from("exercises")
          .insert({
            training_id: createdTraining.id,
            name: exercise.name,
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (exerciseError) throw exerciseError;

        if (exercise.rounds && Array.isArray(exercise.rounds)) {
          const roundsToInsert = exercise.rounds.map((round: Round) => ({
            exercise_id: createdExercise.id,
            weight: round.weight || 0,
            reps: round.reps || 0,
            comments: round.comments || null,
            created_at: new Date().toISOString(),
          }));

          const { error: roundsError } = await supabase
            .from("rounds")
            .insert(roundsToInsert);

          if (roundsError) throw roundsError;
        }
      }

      setUploadJson("");
      setSelectedUserId("");
      setIsUploadDialogOpen(false);

      fetchAdminStats();

      alert("Training uploaded successfully!");
    } catch (error: any) {
      console.error("Failed to upload training:", error);
      alert(
        `Failed to upload training: ${error?.message || "Please check the JSON format."}`,
      );
    }
  };

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

            {/* Users Table */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      Manage users and upload training plans
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Training
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Upload Training Plan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="user-select">Select User</Label>
                          <select
                            id="user-select"
                            className="w-full p-2 border rounded"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                          >
                            <option value="">Choose a user...</option>
                            {users.map((user) => (
                              <option key={user.user_id} value={user.user_id}>
                                {user.profiles?.email || "Unknown Email"} (
                                {user.role})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="json-content">Training JSON</Label>
                          <Textarea
                            id="json-content"
                            placeholder="Paste training JSON here..."
                            value={uploadJson}
                            onChange={(e) => setUploadJson(e.target.value)}
                            rows={15}
                            className="min-h-[300px] resize-y"
                          />
                        </div>
                        <div className="flex gap-2 sticky bottom-0 bg-background py-2">
                          <Button
                            onClick={uploadTraining}
                            disabled={!selectedUserId || !uploadJson}
                          >
                            Upload Training
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsUploadDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No users found
                    </p>
                  ) : (
                    <div className="border rounded-lg">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">User</th>
                            <th className="text-left p-3">Role</th>
                            <th className="text-left p-3">Created</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <React.Fragment key={user.user_id}>
                              <tr className="border-b">
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        toggleUserExpanded(user.user_id)
                                      }
                                    >
                                      {expandedUsers.has(user.user_id)
                                        ? "▼"
                                        : "▶"}
                                    </Button>
                                    <div>
                                      <div className="font-medium">
                                        {user.profiles?.email ||
                                          "Unknown Email"}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        ID: {user.user_id.slice(0, 8)}...
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge
                                    variant={
                                      user.role === "admin"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {user.role}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <div className="text-sm">
                                    {new Date(
                                      user.created_at,
                                    ).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedUserId(user.user_id);
                                        setIsUploadDialogOpen(true);
                                      }}
                                    >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload Training
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                              {expandedUsers.has(user.user_id) && (
                                <tr>
                                  <td colSpan={4} className="p-0">
                                    <div className="bg-muted/50 p-4 border-t">
                                      <h4 className="font-medium mb-3">
                                        User Trainings (
                                        {userTrainings[user.user_id]?.length ||
                                          0}
                                        )
                                      </h4>
                                      {userTrainings[user.user_id]?.length ===
                                      0 ? (
                                        <p className="text-muted-foreground text-sm">
                                          No trainings found
                                        </p>
                                      ) : (
                                        <div className="space-y-2">
                                          {userTrainings[user.user_id].map(
                                            (training: any) => (
                                              <div
                                                key={training.id}
                                                className="flex items-center justify-between bg-background p-3 rounded border"
                                              >
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <Badge
                                                      variant={
                                                        training.status ===
                                                        "done"
                                                          ? "default"
                                                          : "secondary"
                                                      }
                                                    >
                                                      {training.status}
                                                    </Badge>
                                                    <span className="font-medium">
                                                      {training.exercises
                                                        ?.length || 0}{" "}
                                                      exercises
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                      {new Date(
                                                        training.created_at,
                                                      ).toLocaleDateString()}
                                                    </span>
                                                  </div>
                                                  {training.comments && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                      {training.comments}
                                                    </p>
                                                  )}
                                                </div>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() =>
                                                    deleteTraining(
                                                      training.id,
                                                      user.user_id,
                                                    )
                                                  }
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
