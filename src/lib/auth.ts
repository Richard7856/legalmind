"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error("Auth error:", authError);
            return null;
        }

        if (!user) {
            console.log("No user found in Supabase");
            return null;
        }

        // Obtener perfil de usuario de nuestra BD
        let userProfile = await prisma.user.findUnique({
            where: { id: user.id },
        });

        // Si no existe el perfil, crearlo automáticamente
        if (!userProfile) {
            console.log("User profile not found, creating...");
            userProfile = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.name || null,
                    role: "ABOGADO",
                },
            });
            console.log("User profile created:", userProfile.id);
        }

        return {
            id: user.id,
            email: user.email!,
            name: userProfile.name || user.user_metadata?.name || null,
            role: userProfile.role || "ABOGADO",
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

