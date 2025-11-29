import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        console.log("sync-profile: Starting sync...");
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error("sync-profile: Auth error:", authError);
            return NextResponse.json({ error: "Error de autenticación", details: authError.message }, { status: 401 });
        }

        if (!user) {
            console.error("sync-profile: No user found");
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        console.log("sync-profile: User found:", user.id, user.email);

        // Crear o actualizar perfil de usuario en nuestra BD
        const userProfile = await prisma.user.upsert({
            where: { id: user.id },
            update: {
                email: user.email!,
                name: user.user_metadata?.name || null,
            },
            create: {
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.name || null,
                role: "ABOGADO",
            },
        });

        console.log("sync-profile: User profile synced:", userProfile.id);
        return NextResponse.json({ success: true, user: userProfile });
    } catch (error) {
        console.error("sync-profile: Error syncing profile:", error);
        if (error instanceof Error) {
            console.error("sync-profile: Error details:", error.message, error.stack);
        }
        return NextResponse.json(
            { error: "Error al sincronizar perfil", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

