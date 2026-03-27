"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/protected-route";
import UserTrainings from "@/components/admin/user-trainings";
import { isAdmin } from "@/lib/admin";
import {
  deleteTraining,
  fetchUsersWithTrainings,
  refreshUserTrainings,
} from "@/lib/admin-operations";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminUser = {
  user_id: string;
  profiles?: {
    email: string;
  };
  role: string;
  created_at: string;
};

export default function UserDetailsPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [trainings, setTrainings] = useState<any[]>([]);

  const loadUserDetails = useCallback(async () => {
    if (!userId) {
      setError("Invalid user id.");
      return;
    }

    const { users, userTrainings } = await fetchUsersWithTrainings();
    const matchedUser = users.find((u: AdminUser) => u.user_id === userId);

    if (!matchedUser) {
      setError("User not found.");
      return;
    }

    setSelectedUser(matchedUser);
    setTrainings(userTrainings[userId] || []);
  }, [userId]);

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      if (authLoading) {
        return;
      }

      try {
        setError(null);

        if (!user) {
          setError("Please log in to access admin panel.");
          return;
        }

        const adminStatus = await isAdmin(user.id);
        setIsAdminUser(adminStatus);

        if (!adminStatus) {
          setError("Access denied. Admin privileges required.");
          return;
        }

        await loadUserDetails();
      } catch (err) {
        console.error("Failed to load user details:", err);
        setError("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoad();
  }, [authLoading, user, loadUserDetails]);

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
      const updatedTrainings = await refreshUserTrainings(userId);
      setTrainings(updatedTrainings);
      alert("Training deleted successfully!");
    } catch (err) {
      console.error("Failed to delete training:", err);
      alert("Failed to delete training. Please try again.");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
          <div className="container mx-auto px-4 pb-20 pt-4 py-20">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading user details...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !isAdminUser || !selectedUser) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
          <div className="container mx-auto px-4 pb-20 pt-4 py-20">
            <div className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">
                {error || "Admin privileges required"}
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/admin">Back to Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 pb-20 pt-4 py-20">
          <div className="mx-auto max-w-6xl space-y-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>{selectedUser.profiles?.email || "Unknown Email"}</CardTitle>
                <CardDescription>
                  ID: {selectedUser.user_id} • Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>
                  {selectedUser.role}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Trainings</CardTitle>
                <CardDescription>
                  Trainings summary for this user
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <UserTrainings
                  trainings={trainings}
                  userId={selectedUser.user_id}
                  onDeleteTraining={handleDeleteTraining}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
