"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, BookOpen, ArrowLeft, Wand2, FileEdit, MessageSquare } from "lucide-react";
import Link from "next/link";
import CaseForm from "@/components/create-case/case-form";
import CaseTemplates from "@/components/create-case/case-templates";
import CaseAIChat from "@/components/create-case/case-ai-chat";

type CreationMode = "select" | "form" | "templates" | "ai";

export default function CreateCasePage() {
    const [mode, setMode] = useState<CreationMode>("select");

    if (mode === "select") {
        return (
            <div className="flex flex-col min-h-screen">
                <header className="px-6 h-16 flex items-center border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                    <Link href="/dashboard" className="mr-4">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold font-serif gold-accent">Crear Caso Personalizado</h1>
                </header>

                <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
                    <div className="flex flex-col gap-8">
                        <div className="space-y-4 text-center">
                            <h2 className="text-4xl font-bold tracking-tight font-serif gold-accent">
                                Crea tu Propio Caso Legal
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Elige cómo quieres crear tu caso: usando un formulario, seleccionando una plantilla de casos famosos, o conversando con nuestra IA.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="flex flex-col group cursor-pointer hover:border-primary/40 transition-all" onClick={() => setMode("form")}>
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-all">
                                        <FileEdit className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="font-serif text-xl mb-2">Formulario</CardTitle>
                                    <CardDescription>
                                        Completa un formulario detallado con todos los aspectos de tu caso. Ideal si ya tienes una idea clara.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end">
                                    <Button className="w-full" variant="outline">
                                        Comenzar
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col group cursor-pointer hover:border-primary/40 transition-all" onClick={() => setMode("templates")}>
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-all">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="font-serif text-xl mb-2">Plantillas</CardTitle>
                                    <CardDescription>
                                        Selecciona de una colección de casos famosos reales adaptados para simulación. Perfecto para aprender de casos históricos.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end">
                                    <Button className="w-full" variant="outline">
                                        Explorar
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col group cursor-pointer hover:border-primary/40 transition-all" onClick={() => setMode("ai")}>
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-all">
                                        <Sparkles className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="font-serif text-xl mb-2">Asistente IA</CardTitle>
                                    <CardDescription>
                                        Conversa con nuestra IA para crear un caso personalizado. Describe tu idea y la IA generará todo el contenido necesario.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end">
                                    <Button className="w-full" variant="outline">
                                        Conversar
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-6 h-16 flex items-center border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 mr-4"
                    onClick={() => setMode("select")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Button>
                <h1 className="text-xl font-bold font-serif gold-accent">
                    {mode === "form" && "Formulario de Creación"}
                    {mode === "templates" && "Plantillas de Casos"}
                    {mode === "ai" && "Asistente IA"}
                </h1>
            </header>

            <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
                {mode === "form" && <CaseForm onBack={() => setMode("select")} />}
                {mode === "templates" && <CaseTemplates onBack={() => setMode("select")} />}
                {mode === "ai" && <CaseAIChat onBack={() => setMode("select")} />}
            </main>
        </div>
    );
}

