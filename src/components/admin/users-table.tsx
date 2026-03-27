import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink, Upload } from "lucide-react";

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
  onUploadTraining: (userId: string) => void;
}

export default function UsersTable({
  users,
  userTrainings,
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
  onUploadTraining: () => void;
}

function UserTableRow({
  user,
  trainings,
  onUploadTraining,
}: UserTableRowProps) {
  return (
    <tr className="border-b">
      <td className="p-3">
        <div>
          <div className="font-medium">{user.profiles?.email || "Unknown Email"}</div>
          <div className="text-sm text-muted-foreground">ID: {user.user_id.slice(0, 8)}...</div>
          <div className="text-xs text-muted-foreground mt-1">
            {trainings.length} trainings
          </div>
        </div>
      </td>
      <td className="p-3">
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role}
        </Badge>
      </td>
      <td className="p-3">
        <div className="text-sm">{new Date(user.created_at).toLocaleDateString()}</div>
      </td>
      <td className="p-3">
        <div className="flex gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/admin/users/${user.user_id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Details
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={onUploadTraining}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Training
          </Button>
        </div>
      </td>
    </tr>
  );
}
