"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Award, TrendingUp, FileText, CheckCircle, XCircle, Gavel } from "lucide-react";

interface SimulationHistory {
    id: string;
    status: string;
    score: number | null;
    createdAt: Date;
    case: {
        title: string;
        category: string;
        difficulty: string;
    };
    feedback: {
        score: number;
        content: string;
    } | null;
}

export default function HistoryPage() {
    const [simulations, setSimulations] = useState<SimulationHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        averageScore: 0,
        totalTime: 0,
    });

    useEffect(() => {
        // Fetch completed simulations (público para métricas)
        fetch('/api/simulations/history')
            .then(res => res.json())
            .then(data => {
                setSimulations(data.simulations || []);
                setStats(data.stats || stats);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading history:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground">Cargando historial...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-6 h-16 flex items-center border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    ← Volver al Dashboard
                </Link>
                <h1 className="text-xl font-bold font-serif gold-accent ml-6">Historial de Casos</h1>
            </header>

            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                {/* Estadísticas Generales */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Simulaciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold gold-accent">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Completadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{stats.completed}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Calificación Promedio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{stats.averageScore.toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tiempo Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{Math.round(stats.totalTime / 60)} min</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Simulaciones */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-serif gold-accent">Casos Resueltos</h2>
                    
                    {simulations.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Gavel className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">Aún no hay casos completados.</p>
                                <Link href="/dashboard">
                                    <Button className="mt-4">Ver Casos Disponibles</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {simulations.map((sim) => (
                                <Card key={sim.id} className="hover:border-primary/40 transition-all">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="font-serif text-xl mb-2">{sim.case.title}</CardTitle>
                                                <CardDescription className="flex items-center gap-4 mt-2">
                                                    <Badge variant="outline" className="border-primary/30 text-primary">
                                                        {sim.case.category}
                                                    </Badge>
                                                    <Badge className={
                                                        sim.case.difficulty === "BASIC" || sim.case.difficulty === "Básico" 
                                                            ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" :
                                                            sim.case.difficulty === "INTERMEDIATE" || sim.case.difficulty === "Intermedio"
                                                            ? "bg-amber-600/20 text-amber-400 border-amber-500/30" :
                                                            "bg-red-600/20 text-red-400 border-red-500/30"
                                                    }>
                                                        {sim.case.difficulty}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(sim.createdAt).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </CardDescription>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {sim.status === "COMPLETED" ? (
                                                    <Badge className="bg-primary/20 text-primary border-primary/40 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Completado
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <XCircle className="h-3 w-3" />
                                                        En Progreso
                                                    </Badge>
                                                )}
                                                {sim.score !== null && (
                                                    <div className="text-2xl font-bold gold-accent">
                                                        {sim.score}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {sim.feedback && (
                                        <CardContent>
                                            <div className="neo-inset p-4 rounded-lg">
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    <strong className="text-primary">Feedback:</strong>
                                                </p>
                                                <p className="text-sm">{sim.feedback.content}</p>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

