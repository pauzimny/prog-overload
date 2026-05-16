import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserTableRow
                key={user.user_id}
                user={user}
                trainings={userTrainings[user.user_id] || []}
                onUploadTraining={() => onUploadTraining(user.user_id)}
              />
            ))}
          </TableBody>
        </Table>
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
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{user.profiles?.email || "Unknown Email"}</div>
          <div className="text-sm text-muted-foreground">
            ID: {user.user_id.slice(0, 8)}...
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {trainings.length} trainings
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">{new Date(user.created_at).toLocaleDateString()}</div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary" className="flex-1 sm:flex-none min-w-10 h-full">
            <Link href={`/admin/users/${user.user_id}`}>
              <ExternalLink className="h-9! w-4 sm:mr-2" />
              <span className="hidden sm:inline">Details</span>
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={onUploadTraining} className="flex-1 sm:flex-none min-w-10">
            <Upload className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Upload Training</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
