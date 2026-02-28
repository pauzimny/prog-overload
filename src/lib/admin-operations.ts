import { supabase } from "@/lib/supabase";
import type { Round } from "@/schemas/database";
import { getUserTrainings } from "./database-operations";

export interface AdminStats {
  totalUsers: number;
  totalTrainings: number;
  totalPlans: number;
  totalActive: number;
  totalDone: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from("auth.users")
      .select("*", { count: "exact", head: true });

    // Get total trainings
    const { count: totalTrainings } = await supabase
      .from("trainings")
      .select("*", { count: "exact", head: true });

    // Get plans count
    const { count: totalPlans } = await supabase
      .from("trainings")
      .select("*", { count: "exact", head: true })
      .eq("status", "plan");

    // Get active trainings count
    const { count: totalActive } = await supabase
      .from("trainings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get done trainings count
    const { count: totalDone } = await supabase
      .from("trainings")
      .select("*", { count: "exact", head: true })
      .eq("status", "done");

    // Get recent activity (last 10 trainings)
    const { data: recentTrainings } = await supabase
      .from("trainings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    const recentActivity =
      recentTrainings?.map((training) => {
        let type: string;
        let description: string;

        if (training.status === "done") {
          type = "workout_completed";
          description = "User completed a workout";
        } else if (training.status === "active") {
          type = "workout_active";
          description = "User activated a workout";
        } else {
          type = "workout_planned";
          description = "User planned a workout";
        }

        return {
          id: training.id,
          type,
          description,
          timestamp: training.created_at,
        };
      }) || [];

    return {
      totalUsers: totalUsers || 0,
      totalTrainings: totalTrainings || 0,
      totalPlans: totalPlans || 0,
      totalActive: totalActive || 0,
      totalDone: totalDone || 0,
      recentActivity,
    };
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    throw error;
  }
}

export async function deleteTraining(
  trainingId: string,
  userId: string,
): Promise<void> {
  try {
    // Delete rounds first (due to foreign key constraints)
    const { data: exercises } = await supabase
      .from("exercises")
      .select("id")
      .eq("training_id", trainingId);

    if (exercises && exercises.length > 0) {
      const exerciseIds = exercises.map((ex) => ex.id);
      await supabase.from("rounds").delete().in("exercise_id", exerciseIds);
    }

    // Delete exercises
    await supabase.from("exercises").delete().eq("training_id", trainingId);

    // Delete training
    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", trainingId);

    if (error) throw error;
  } catch (error) {
    console.error("Failed to delete training:", error);
    throw error;
  }
}

export async function uploadTraining(
  selectedUserId: string,
  uploadJson: string,
): Promise<void> {
  try {
    const trainingData = JSON.parse(uploadJson);

    let exercises = [];
    let comments = "";

    if (trainingData.training && trainingData.exercises) {
      exercises = trainingData.exercises;
      comments = trainingData.training.comments || "";
    } else if (trainingData.exercises) {
      exercises = trainingData.exercises;
      comments = trainingData.comments || "";
    } else {
      throw new Error("Invalid format: exercises array not found");
    }

    const { error: trainingError } = await supabase.from("trainings").insert({
      user_id: selectedUserId,
      status: "plan",
      comments: comments,
      created_at: new Date().toISOString(),
    });

    if (trainingError) throw trainingError;

    const { data: createdTraining } = await supabase
      .from("trainings")
      .select("id")
      .eq("user_id", selectedUserId)
      .eq("status", "plan")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!createdTraining)
      throw new Error("Failed to retrieve created training");

    for (const exercise of exercises) {
      const { data: createdExercise, error: exerciseError } = await supabase
        .from("exercises")
        .insert({
          training_id: createdTraining.id,
          name: exercise.name,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (exerciseError) throw exerciseError;

      if (exercise.rounds && Array.isArray(exercise.rounds)) {
        const roundsToInsert = exercise.rounds.map((round: Round) => ({
          exercise_id: createdExercise.id,
          weight: round.weight || 0,
          reps: round.reps || 0,
          comments: round.comments || null,
          created_at: new Date().toISOString(),
        }));

        const { error: roundsError } = await supabase
          .from("rounds")
          .insert(roundsToInsert);

        if (roundsError) throw roundsError;
      }
    }
  } catch (error) {
    console.error("Failed to upload training:", error);
    throw error;
  }
}

export async function fetchUsersWithTrainings(): Promise<{
  users: any[];
  userTrainings: { [key: string]: any[] };
}> {
  try {
    const { getAllUsers } = await import("@/lib/admin");
    const usersData = await getAllUsers();

    // Fetch trainings for each user with exercises and rounds
    const trainingsData: { [key: string]: any[] } = {};
    for (const user of usersData) {
      const userTrainings = await getUserTrainings(user.user_id);
      trainingsData[user.user_id] = userTrainings;
    }

    return {
      users: usersData,
      userTrainings: trainingsData,
    };
  } catch (error) {
    console.error("Failed to fetch users with trainings:", error);
    throw error;
  }
}

export async function refreshUserTrainings(userId: string): Promise<any[]> {
  try {
    const { data } = await supabase
      .from("trainings")
      .select(
        `
        *,
        exercises (
          id,
          name,
          created_at,
          rounds (
            id,
            weight,
            reps,
            comments,
            created_at
          )
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return data || [];
  } catch (error) {
    console.error("Failed to refresh user trainings:", error);
    throw error;
  }
}
