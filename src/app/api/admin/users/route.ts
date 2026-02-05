import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // Get all user roles
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, created_at");

    if (rolesError) {
      console.error("Failed to fetch user roles:", rolesError);
      return NextResponse.json(
        { error: "Failed to fetch user roles" },
        { status: 500 },
      );
    }

    // Get user emails using admin API (server-side has service role)
    const usersWithRoles = await Promise.all(
      userRoles.map(async (userRole) => {
        try {
          // Try getUserById first
          const { data: userData, error: userError } =
            await supabaseAdmin.auth.admin.getUserById(userRole.user_id);

          if (userError) {
            // Fallback: try listUsers
            try {
              const { data: usersList, error: listError } =
                await supabaseAdmin.auth.admin.listUsers();

              if (listError) {
                throw listError;
              }

              const foundUser = usersList.users.find(
                (user) => user.id === userRole.user_id,
              );

              if (!foundUser) {
                throw new Error("User not found");
              }

              return {
                user_id: userRole.user_id,
                email: foundUser.email,
                role: userRole.role,
                created_at: userRole.created_at,
                profiles: {
                  email: foundUser.email,
                  created_at: userRole.created_at,
                },
              };
            } catch (listError) {
              console.error("ListUsers fallback failed:", listError);
              throw listError;
            }
          }

          if (!userData?.user) {
            console.log("No user data found for:", userRole.user_id);
            return {
              user_id: userRole.user_id,
              email: `User ${userRole.user_id.slice(0, 8)}...`,
              role: userRole.role,
              created_at: userRole.created_at,
              profiles: {
                email: `User ${userRole.user_id.slice(0, 8)}...`,
                created_at: userRole.created_at,
              },
            };
          }

          console.log("Successfully got user email:", userData.user.email);

          return {
            user_id: userRole.user_id,
            email: userData.user.email,
            role: userRole.role,
            created_at: userRole.created_at,
            profiles: {
              email: userData.user.email,
              created_at: userRole.created_at,
            },
          };
        } catch (error) {
          console.error(`Failed to get user ${userRole.user_id}:`, error);
          return {
            user_id: userRole.user_id,
            email: `User ${userRole.user_id.slice(0, 8)}...`,
            role: userRole.role,
            created_at: userRole.created_at,
            profiles: {
              email: `User ${userRole.user_id.slice(0, 8)}...`,
              created_at: userRole.created_at,
            },
          };
        }
      }),
    );

    console.log("Final users with roles:", usersWithRoles);
    return NextResponse.json(usersWithRoles);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
