"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";

interface MobileUploadTrainingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: any[];
  selectedUserId: string;
  onUserIdChange: (userId: string) => void;
  uploadJson: string;
  onUploadJsonChange: (json: string) => void;
  onUpload: () => void;
}

export default function MobileUploadTrainingDialog({
  isOpen,
  onOpenChange,
  users,
  selectedUserId,
  onUserIdChange,
  uploadJson,
  onUploadJsonChange,
  onUpload,
}: MobileUploadTrainingDialogProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onUploadJsonChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onUploadJsonChange(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">Upload Training</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* User Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select User</label>
            <Select value={selectedUserId} onValueChange={onUserIdChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-primary-foreground rounded-full" />
                      </div>
                      {user.email || user.user_id}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* JSON Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Training JSON</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {isDragging ? "Drop file here" : "Click to upload or drag & drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JSON files only (.json)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* JSON Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or paste JSON directly:</label>
            <Textarea
              value={uploadJson}
              onChange={(e) => onUploadJsonChange(e.target.value)}
              placeholder="Paste your training JSON here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onUpload}
              disabled={!selectedUserId || !uploadJson.trim()}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Training
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
            <p className="font-medium mb-2">JSON Format Example:</p>
            <pre className="bg-background rounded p-2 overflow-x-auto text-xs">
{`{
  "training": {
    "comments": "Optional training comments",
    "exercises": [
      {
        "name": "Bench Press",
        "rounds": [
          {
            "weight": 135,
            "reps": 8,
            "comments": "Good form"
          },
          {
            "weight": 125,
            "reps": 10,
            "comments": "Last set"
          }
        ]
      }
    ]
  }
}`}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
