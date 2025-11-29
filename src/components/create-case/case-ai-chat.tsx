"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Loader2, CheckCircle2, User, Bot } from "lucide-react";
import { generateCaseWithAI, createCaseFromAIGeneration } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface CaseAIChatProps {
    onBack: () => void;
}

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function CaseAIChat({ onBack }: CaseAIChatProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "¡Hola! Soy tu asistente para crear casos legales. Puedes describirme qué tipo de caso quieres crear y yo te ayudaré a generar todos los detalles: hechos, evidencias, testigos, y más. ¿Qué caso te gustaría crear?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedCase, setGeneratedCase] = useState<any>(null);
    const [isCreating, setIsCreating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await generateCaseWithAI([...messages, { role: "user", content: userMessage }]);
            
            if (response.caseData) {
                // Case was fully generated
                setGeneratedCase(response.caseData);
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: `¡Perfecto! He creado tu caso: "${response.caseData.title}". ¿Te gustaría revisar los detalles antes de comenzar la simulación?`
                }]);
            } else {
                // AI is asking for more information
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: response.message
                }]);
            }
        } catch (error) {
            console.error("Error generating case:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSimulation = async () => {
        if (!generatedCase) return;

        setIsCreating(true);
        try {
            const caseId = await createCaseFromAIGeneration(generatedCase);
            if (caseId) {
                router.push(`/simulation/${caseId}`);
            }
        } catch (error) {
            console.error("Error creating case:", error);
            alert("Error al crear el caso. Por favor intenta de nuevo.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold font-serif gold-accent">Asistente IA para Crear Casos</h2>
                <p className="text-muted-foreground">
                    Describe el caso que quieres crear y la IA generará todos los detalles necesarios
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card className="h-[600px] flex flex-col">
                        <CardContent className="flex-1 flex flex-col p-0">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                            msg.role === "user" 
                                                ? "bg-primary text-white" 
                                                : "bg-primary/20 text-primary"
                                        }`}>
                                            {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div className={`flex-1 rounded-lg p-3 ${
                                            msg.role === "user"
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "bg-muted text-foreground"
                                        }`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 rounded-lg p-3 bg-muted">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span className="text-sm text-muted-foreground">Pensando...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSend} className="p-4 border-t border-border/40">
                                <div className="flex gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Describe tu caso..."
                                        disabled={isLoading}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={isLoading || !input.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {generatedCase && (
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <h3 className="font-bold font-serif text-lg">Caso Generado</h3>
                                </div>
                                
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Título</p>
                                    <p className="font-medium">{generatedCase.title}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Categoría</p>
                                    <Badge variant="outline" className="border-primary/30 text-primary">
                                        {generatedCase.category}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Dificultad</p>
                                    <Badge className={
                                        generatedCase.difficulty === "Básico" ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" :
                                            generatedCase.difficulty === "Intermedio" ? "bg-amber-600/20 text-amber-400 border-amber-500/30" :
                                                "bg-red-600/20 text-red-400 border-red-500/30"
                                    }>
                                        {generatedCase.difficulty}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                                    <p className="text-sm text-muted-foreground line-clamp-3">{generatedCase.description}</p>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={handleStartSimulation}
                                    disabled={isCreating}
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Comenzar Simulación
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-medium mb-2 text-sm">Ejemplos de prompts:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• "Un caso de robo con testigo dudoso"</li>
                                <li>• "Demanda laboral por despido injustificado"</li>
                                <li>• "Caso civil de incumplimiento de contrato"</li>
                                <li>• "Asesinato con evidencia circunstancial"</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-center">
                <Button variant="outline" onClick={onBack}>
                    Volver
                </Button>
            </div>
        </div>
    );
}

