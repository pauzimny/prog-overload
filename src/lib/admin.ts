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
    // Call the API route to get users with emails
    const response = await fetch("/api/admin/users");

    if (!response.ok) {
      console.error("Failed to fetch users:", response.statusText);
      return [];
    }

    const users = await response.json();
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}
