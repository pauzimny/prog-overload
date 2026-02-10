"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Upload, Trash2, User } from "lucide-react";
import type { TrainingWithExercises } from "@/lib/database-operations";

interface MobileUsersTableProps {
  users: any[];
  userTrainings: { [key: string]: any[] };
  expandedUsers: Set<string>;
  onToggleUserExpanded: (userId: string) => void;
  onDeleteTraining: (trainingId: string, userId: string) => void;
  onUploadTraining: (userId: string) => void;
}

export default function MobileUsersTable({
  users,
  userTrainings,
  expandedUsers,
  onToggleUserExpanded,
  onDeleteTraining,
  onUploadTraining,
}: MobileUsersTableProps) {
  const formatTrainingCount = (userId: string) => {
    const trainings = userTrainings[userId] || [];
    const totalTrainings = trainings.length;
    const completedTrainings = trainings.filter((t: any) => t.status === "done").length;
    return `${completedTrainings}/${totalTrainings} completed`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return { label: "Completed", variant: "default" as const };
      case "plan":
        return { label: "Planned", variant: "secondary" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold px-1">Users Management</h2>
      
      {/* Upload Training Button */}
      <Card>
        <CardContent className="p-4">
          <Button
            onClick={() => {}}
            className="w-full"
            size="lg"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Training for User
          </Button>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.user_id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* User Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer bg-muted/30"
                onClick={() => onToggleUserExpanded(user.user_id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{user.email || user.user_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTrainingCount(user.user_id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUploadTraining(user.user_id);
                    }}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  {expandedUsers.has(user.user_id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Expandable Trainings */}
              {expandedUsers.has(user.user_id) && (
                <div className="border-t bg-muted/20">
                  {userTrainings[user.user_id]?.length > 0 ? (
                    <div className="p-4 space-y-3">
                      {userTrainings[user.user_id].map((training: any) => {
                        const statusBadge = getStatusBadge(training.status);
                        return (
                          <div
                            key={training.id}
                            className="flex items-center justify-between p-3 bg-background rounded-lg border"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {training.exercises?.[0]?.name || "Training"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(training.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusBadge.variant} className="text-xs">
                                {statusBadge.label}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  onDeleteTraining(training.id, user.user_id)
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">No trainings found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUploadTraining(user.user_id)}
                        className="mt-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload First Training
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
