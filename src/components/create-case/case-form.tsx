"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Scale, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { createCustomCase } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface CaseFormProps {
    onBack: () => void;
}

export default function CaseForm({ onBack }: CaseFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Penal",
        difficulty: "Básico",
        scenario: "",
        date: "",
        location: "",
        jurisdiction: "",
        clientName: "",
        clientRole: "defendant", // defendant, plaintiff, company
        opposingParty: "",
        keyFacts: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const caseId = await createCustomCase(formData);
            if (caseId) {
                router.push(`/simulation/${caseId}`);
            }
        } catch (error) {
            console.error("Error creating case:", error);
            alert("Error al crear el caso. Por favor intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-serif text-2xl gold-accent">Información Básica del Caso</CardTitle>
                    <CardDescription>
                        Proporciona los detalles fundamentales de tu caso legal
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Título del Caso *</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="Ej: Robo en Establecimiento Comercial"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Descripción *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Describe brevemente el caso..."
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Categoría *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            >
                                <option value="Penal">Penal</option>
                                <option value="Civil">Civil</option>
                                <option value="Laboral">Laboral</option>
                                <option value="Mercantil">Mercantil</option>
                                <option value="Administrativo">Administrativo</option>
                                <option value="Familiar">Familiar</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Dificultad *</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => handleChange("difficulty", e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            >
                                <option value="Básico">Básico</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-serif text-xl gold-accent">Hechos y Contexto</CardTitle>
                    <CardDescription>
                        Describe los hechos principales y el escenario del caso
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Escenario Detallado *</label>
                        <textarea
                            value={formData.scenario}
                            onChange={(e) => handleChange("scenario", e.target.value)}
                            placeholder="Describe los hechos principales, qué sucedió, cuándo, dónde..."
                            className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Fecha del Incidente</label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange("date", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Ubicación</label>
                            <Input
                                value={formData.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                                placeholder="Ciudad, Dirección..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Jurisdicción</label>
                            <Input
                                value={formData.jurisdiction}
                                onChange={(e) => handleChange("jurisdiction", e.target.value)}
                                placeholder="Juzgado, Tribunal..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Hechos Clave</label>
                        <textarea
                            value={formData.keyFacts}
                            onChange={(e) => handleChange("keyFacts", e.target.value)}
                            placeholder="Lista los hechos más importantes que serán relevantes en el juicio..."
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-serif text-xl gold-accent">Partes Involucradas</CardTitle>
                    <CardDescription>
                        Información sobre las partes en el caso
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Nombre de tu Cliente *</label>
                            <Input
                                value={formData.clientName}
                                onChange={(e) => handleChange("clientName", e.target.value)}
                                placeholder="Nombre completo"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Rol de tu Cliente *</label>
                            <select
                                value={formData.clientRole}
                                onChange={(e) => handleChange("clientRole", e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            >
                                <option value="defendant">Acusado/Demandado</option>
                                <option value="plaintiff">Demandante</option>
                                <option value="company">Empresa</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Parte Contraria</label>
                        <Input
                            value={formData.opposingParty}
                            onChange={(e) => handleChange("opposingParty", e.target.value)}
                            placeholder="Nombre de la parte contraria"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creando Caso...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Crear y Comenzar Simulación
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

