import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  user_id: string;
  profiles?: {
    email: string;
  };
  role: string;
}

interface UploadTrainingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  selectedUserId: string;
  onUserIdChange: (userId: string) => void;
  uploadJson: string;
  onUploadJsonChange: (json: string) => void;
  onUpload: () => void;
}

export default function UploadTrainingDialog({
  isOpen,
  onOpenChange,
  users,
  selectedUserId,
  onUserIdChange,
  uploadJson,
  onUploadJsonChange,
  onUpload,
}: UploadTrainingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={(e) => onUserIdChange(e.target.value)}
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.profiles?.email || "Unknown Email"} ({user.role})
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
              onChange={(e) => onUploadJsonChange(e.target.value)}
              rows={15}
              className="min-h-[300px] resize-y"
            />
          </div>
          <div className="flex gap-2 sticky bottom-0 bg-background py-2">
            <Button
              onClick={onUpload}
              disabled={!selectedUserId || !uploadJson}
            >
              Upload Training
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
