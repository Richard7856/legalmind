"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel, Mail, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setLoading(false);
            return;
        }

        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                console.log("Register: User created in Supabase Auth:", data.user.id, data.user.email);
                
                // Esperar a que la sesión esté disponible (las cookies pueden tardar)
                let session = null;
                for (let i = 0; i < 10; i++) {
                    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError) {
                        console.error("Register: Session error:", sessionError);
                    }
                    if (currentSession) {
                        session = currentSession;
                        console.log("Register: Session found after", i + 1, "attempts");
                        break;
                    }
                    console.log("Register: Waiting for session, attempt", i + 1);
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                if (!session) {
                    console.warn("Register: No session found after 10 attempts, but proceeding anyway...");
                    // Intentar refrescar la sesión
                    await supabase.auth.refreshSession();
                }
                
                console.log("Register: Calling sync-profile API...");
                // Crear perfil de usuario en nuestra BD
                try {
                    const syncResponse = await fetch("/api/auth/sync-profile", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                        },
                        credentials: "include", // Asegurar que se envíen las cookies
                    });

                    console.log("Register: Sync response status:", syncResponse.status);
                    const syncData = await syncResponse.json();
                    console.log("Register: Sync response data:", syncData);

                    if (!syncResponse.ok) {
                        console.error("Register: Error syncing profile:", syncData);
                        // No lanzar error aquí, el usuario puede sincronizarse después al iniciar sesión
                        console.warn("Register: Profile sync failed, but user can sync on next login");
                    } else {
                        console.log("Register: Profile synced successfully:", syncData.user?.id);
                    }
                } catch (syncError) {
                    console.error("Register: Exception calling sync-profile:", syncError);
                    // No bloquear el registro si la sincronización falla
                }

                router.push("/dashboard");
                router.refresh();
            }
        } catch (error: any) {
            setError(error.message || "Error al crear la cuenta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md neo-card">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                        <Gavel className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-serif gold-accent">Crear Cuenta</CardTitle>
                        <CardDescription className="mt-2">Únete a LegalMind</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Nombre Completo
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Juan Pérez"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                Correo Electrónico
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary" />
                                Contraseña
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary" />
                                Confirmar Contraseña
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creando cuenta..." : "Crear Cuenta"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Iniciar sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

