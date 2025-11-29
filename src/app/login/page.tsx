"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel, Mail, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                console.log("Login: User authenticated, syncing profile...");
                // Crear o actualizar perfil de usuario en nuestra BD
                const syncResponse = await fetch("/api/auth/sync-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                const syncData = await syncResponse.json();
                console.log("Login: Sync response:", syncResponse.status, syncData);

                if (!syncResponse.ok) {
                    console.warn("Login: Profile sync failed, but continuing:", syncData);
                    // No bloquear el login si la sincronización falla
                } else {
                    console.log("Login: Profile synced successfully:", syncData.user?.id);
                }

                router.push("/dashboard");
                router.refresh();
            }
        } catch (error: any) {
            setError(error.message || "Error al iniciar sesión");
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
                        <CardTitle className="text-2xl font-serif gold-accent">LegalMind</CardTitle>
                        <CardDescription className="mt-2">Inicia sesión en tu cuenta</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive text-sm">
                                {error}
                            </div>
                        )}
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
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">¿No tienes cuenta? </span>
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Crear cuenta
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

