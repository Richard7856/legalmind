import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, FileText, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/auth/logout-button";

// Obtener casos desde la BD
async function getCases() {
    try {
        const cases = await prisma.case.findMany({
            orderBy: { createdAt: "asc" },
            take: 10,
        });
        return cases.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category,
            difficulty: c.difficulty === "BASIC" ? "Básico" : c.difficulty === "INTERMEDIATE" ? "Intermedio" : "Avanzado",
            duration: c.difficulty === "BASIC" ? "20 min" : c.difficulty === "INTERMEDIATE" ? "30 min" : "45 min",
        }));
    } catch (error) {
        console.error("Error loading cases:", error);
        return [];
    }
}

export default async function DashboardPage() {
    const user = await getCurrentUser();
    const cases = await getCases();

    const userInitial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A";

    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-6 h-16 flex items-center border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <h1 className="text-xl font-bold font-serif gold-accent">LegalMind Dashboard</h1>
                <div className="ml-auto flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        Bienvenido, {user?.name || "Abogado"}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                        {userInitial}
                    </div>
                    <LogoutButton />
                </div>
            </header>

            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-bold tracking-tight font-serif gold-accent">Casos Disponibles</h2>
                            <p className="text-muted-foreground text-lg">Selecciona un caso para comenzar tu simulación.</p>
                        </div>
                        <Link href="/dashboard/history">
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Ver Historial
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {cases.map((c) => (
                            <Card key={c.id} className="flex flex-col group">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="border-primary/30 text-primary">{c.category}</Badge>
                                        <Badge className={
                                            c.difficulty === "Básico" ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" :
                                                c.difficulty === "Intermedio" ? "bg-amber-600/20 text-amber-400 border-amber-500/30" :
                                                    "bg-red-600/20 text-red-400 border-red-500/30"
                                        }>{c.difficulty}</Badge>
                                    </div>
                                    <CardTitle className="font-serif text-2xl mb-2 group-hover:gold-accent transition-all">{c.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-base">{c.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary/60" />
                                            <span>{c.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-primary/60" />
                                            <span>Simulación</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/simulation/${c.id}`} className="w-full">
                                        <Button className="w-full">Iniciar Caso</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                        
                        {/* Caso 3: Crear Caso Personalizado */}
                        <Card className="flex flex-col group border-dashed border-2 border-primary/40 hover:border-primary/60 transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="border-primary/30 text-primary">Personalizado</Badge>
                                    <Badge className="bg-primary/20 text-primary border-primary/40">Creador</Badge>
                                </div>
                                <CardTitle className="font-serif text-2xl mb-2 group-hover:gold-accent transition-all">Crea tu Propio Caso</CardTitle>
                                <CardDescription className="line-clamp-2 text-base">
                                    Crea un caso personalizado usando un formulario, plantillas de casos famosos, o conversando con nuestra IA.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary/60" />
                                        <span>Variable</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-primary/60" />
                                        <span>Personalizado</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/create-case" className="w-full">
                                    <Button className="w-full">Crear Caso</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
