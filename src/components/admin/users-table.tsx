import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import UserTrainings from "./user-trainings";

interface User {
  user_id: string;
  profiles?: {
    email: string;
  };
  role: string;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
  userTrainings: { [key: string]: any[] };
  expandedUsers: Set<string>;
  onToggleUserExpanded: (userId: string) => void;
  onDeleteTraining: (trainingId: string, userId: string) => void;
  onUploadTraining: (userId: string) => void;
}

export default function UsersTable({
  users,
  userTrainings,
  expandedUsers,
  onToggleUserExpanded,
  onDeleteTraining,
  onUploadTraining,
}: UsersTableProps) {
  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No users found</p>
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
                <UserTableRow
                  key={user.user_id}
                  user={user}
                  trainings={userTrainings[user.user_id] || []}
                  isExpanded={expandedUsers.has(user.user_id)}
                  onToggleExpanded={() => onToggleUserExpanded(user.user_id)}
                  onDeleteTraining={onDeleteTraining}
                  onUploadTraining={() => onUploadTraining(user.user_id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface UserTableRowProps {
  user: User;
  trainings: any[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onDeleteTraining: (trainingId: string, userId: string) => void;
  onUploadTraining: () => void;
}

function UserTableRow({
  user,
  trainings,
  isExpanded,
  onToggleExpanded,
  onDeleteTraining,
  onUploadTraining,
}: UserTableRowProps) {
  return (
    <>
      <tr className="border-b">
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onToggleExpanded}>
              {isExpanded ? "▼" : "▶"}
            </Button>
            <div>
              <div className="font-medium">
                {user.profiles?.email || "Unknown Email"}
              </div>
              <div className="text-sm text-muted-foreground">
                ID: {user.user_id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </td>
        <td className="p-3">
          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
            {user.role}
          </Badge>
        </td>
        <td className="p-3">
          <div className="text-sm">
            {new Date(user.created_at).toLocaleDateString()}
          </div>
        </td>
        <td className="p-3">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onUploadTraining}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Training
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={4} className="p-0">
            <UserTrainings
              trainings={trainings}
              userId={user.user_id}
              onDeleteTraining={onDeleteTraining}
            />
          </td>
        </tr>
      )}
    </>
  );
}
