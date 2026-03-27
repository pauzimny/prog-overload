"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function KettlebellPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 pb-20 pt-4 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Kettlebell</CardTitle>
                  <CardDescription>Small module in progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create and manage kettlebell-specific trainings.
                  </p>
                </CardContent>
              </Card>

              <Card className="group transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add New Training
                  </CardTitle>
                  <CardDescription>
                    Start a new kettlebell training with exercises and rounds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/kettlebell/create">Add New Training</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
