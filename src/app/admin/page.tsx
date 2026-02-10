"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Shield, Menu, X } from "lucide-react";
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
import MobileAdminStats from "@/components/admin/mobile-admin-stats";
import MobileUsersTable from "@/components/admin/mobile-users-table";
import MobileUploadTrainingDialog from "@/components/admin/mobile-upload-training-dialog";
import { useAdminToast } from "@/hooks/use-admin-toast";
import { Button } from "@/components/ui/button";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      toast({
        message: "Training deleted successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete training:", error);
      toast({
        message: "Failed to delete training. Please try again.",
        type: "error",
      });
    }
  };

  const handleUploadTraining = async () => {
    if (!selectedUserId || !uploadJson) {
      toast({
        message: "Please select a user and provide JSON content",
        type: "error",
      });
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

      toast({
        message: "Training uploaded successfully!",
        type: "success",
      });
    } catch (error: any) {
      console.error("Failed to upload training:", error);
      toast({
        message: `Failed to upload training: ${error?.message || "Please check JSON format."}`,
        type: "error",
      });
    }
  };

  const handleUploadTrainingForUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsUploadDialogOpen(true);
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading admin dashboard...
              </p>
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
          <div className="container mx-auto px-4 pb-20 pt-4 py-20">
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
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-50 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
            <div
              className="fixed inset-0 bg-black/20"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-80 bg-background shadow-xl overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Admin Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast({
                        message: "Test toast notification!",
                        type: "success",
                      })
                    }
                    className="w-full"
                  >
                    Test Toast
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="container mx-auto px-4 pb-20 pt-4 py-20">
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
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-20 pt-4">
          <div className="mx-auto max-w-6xl">
            {/* Mobile Stats */}
            <div className="lg:hidden mb-8">
              <MobileAdminStats stats={stats} />
            </div>

            {/* Desktop Stats */}
            <div className="hidden lg:block mb-8">
              <MobileAdminStats stats={stats} />
            </div>

            {/* Users Table */}
            <div className="mb-8">
              <MobileUsersTable
                users={users}
                userTrainings={userTrainings}
                expandedUsers={expandedUsers}
                onToggleUserExpanded={toggleUserExpanded}
                onDeleteTraining={handleDeleteTraining}
                onUploadTraining={handleUploadTrainingForUser}
              />
            </div>

            {/* Upload Training Dialog */}
            <MobileUploadTrainingDialog
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
    </ProtectedRoute>
  );
}
