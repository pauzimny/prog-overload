import { supabase } from "./supabase";

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    // Use service role key for admin checks to bypass RLS
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    console.log("Admin check result:", { data, error, userId });

    if (error) {
      console.error("Admin check error:", error);
      return false;
    }
    return data?.role === "admin";
  } catch (error) {
    console.error("Admin check exception:", error);
    return false;
  }
}

export async function setUserRole(
  userId: string,
  role: "user" | "admin",
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role });

    return !error;
  } catch {
    return false;
  }
}

export async function getAllUsers() {
  try {
    // Get all user roles - should work with new RLS policies
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role, created_at");

    if (rolesError) {
      console.error("Failed to fetch user roles:", rolesError);
      return [];
    }

    // Transform data for the table - we'll show user ID as identifier since email access is restricted
    const users = userRoles.map((userRole) => ({
      user_id: userRole.user_id,
      role: userRole.role,
      created_at: userRole.created_at,
      profiles: {
        email: `User ${userRole.user_id.slice(0, 8)}...`, // Show partial user ID as identifier
        created_at: userRole.created_at,
      },
    }));

    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}
