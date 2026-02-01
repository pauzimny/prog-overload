"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Shield, Upload } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { isAdmin } from "@/lib/admin";
import {
  fetchAdminStats,
  deleteTraining,
  uploadTraining,
  fetchUsersWithTrainings,
  refreshUserTrainings,
  type AdminStats,
} from "@/lib/admin-operations";
import AdminStatsComponent from "@/components/admin/admin-stats";
import RecentActivity from "@/components/admin/recent-activity";
import UploadTrainingDialog from "@/components/admin/upload-training-dialog";
import UsersTable from "@/components/admin/users-table";
import { AdminToastContainer } from "@/components/admin/admin-toast-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminToast } from "@/hooks/use-admin-toast";

export default function AdminPage() {
  const { user } = useAuth();
  const { toasts, removeToast, toast } = useAdminToast();
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

      fetchAdminStatsData();
      fetchUsers();
    };

    checkAdminStatus();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { users, userTrainings } = await fetchUsersWithTrainings();
      setUsers(users);
      setUserTrainings(userTrainings);
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

  const handleDeleteTraining = async (trainingId: string, userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this training? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteTraining(trainingId, userId);

      // Refresh trainings for this user
      const updatedTrainings = await refreshUserTrainings(userId);
      setUserTrainings((prev) => ({
        ...prev,
        [userId]: updatedTrainings,
      }));

      // Refresh stats
      const updatedStats = await fetchAdminStatsData();
      setStats(updatedStats);

      alert("Training deleted successfully!");
    } catch (error) {
      console.error("Failed to delete training:", error);
      alert("Failed to delete training. Please try again.");
    }
  };

  const handleUploadTraining = async () => {
    if (!selectedUserId || !uploadJson) {
      alert("Please select a user and provide JSON content");
      return;
    }

    try {
      await uploadTraining(selectedUserId, uploadJson);

      setUploadJson("");
      setSelectedUserId("");
      setIsUploadDialogOpen(false);

      // Refresh stats
      const updatedStats = await fetchAdminStatsData();
      setStats(updatedStats);

      // Refresh users and trainings
      fetchUsers();

      alert("Training uploaded successfully!");
    } catch (error: any) {
      console.error("Failed to upload training:", error);
      alert(
        `Failed to upload training: ${error?.message || "Please check the JSON format."}`,
      );
    }
  };

  const fetchAdminStatsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await fetchAdminStats();
      setStats(statsData);
      return statsData;
    } catch (err: any) {
      console.error("Failed to fetch admin stats:", err);
      setError("Failed to load admin dashboard");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTrainingForUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsUploadDialogOpen(true);
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="h-8 w-8" />
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Manage users and monitor platform activity
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      message: "Test toast notification!",
                      type: "success",
                    })
                  }
                >
                  Test Toast
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <AdminStatsComponent stats={stats} />

            {/* Recent Activity */}
            <RecentActivity recentActivity={stats?.recentActivity || []} />

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
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Training
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <UsersTable
                  users={users}
                  userTrainings={userTrainings}
                  expandedUsers={expandedUsers}
                  onToggleUserExpanded={toggleUserExpanded}
                  onDeleteTraining={handleDeleteTraining}
                  onUploadTraining={handleUploadTrainingForUser}
                />
              </CardContent>
            </Card>

            {/* Upload Training Dialog */}
            <UploadTrainingDialog
              isOpen={isUploadDialogOpen}
              onOpenChange={setIsUploadDialogOpen}
              users={users}
              selectedUserId={selectedUserId}
              onUserIdChange={setSelectedUserId}
              uploadJson={uploadJson}
              onUploadJsonChange={setUploadJson}
              onUpload={handleUploadTraining}
            />
          </div>
        </div>
      </div>

      <AdminToastContainer toasts={toasts} onRemove={removeToast} />
    </ProtectedRoute>
  );
}
