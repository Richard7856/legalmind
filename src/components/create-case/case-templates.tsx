"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Scale, Loader2, CheckCircle2 } from "lucide-react";
import { createCaseFromTemplate } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface CaseTemplatesProps {
    onBack: () => void;
}

interface Template {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: string;
    realCase: string;
    year: string;
    country: string;
    keyPoints: string[];
}

const templates: Template[] = [
    {
        id: "oj-simpson",
        title: "El Caso de Asesinato",
        description: "Un caso de asesinato con evidencia circunstancial y testigos clave. Basado en casos famosos de homicidio.",
        category: "Penal",
        difficulty: "Avanzado",
        duration: "60 min",
        realCase: "Caso O.J. Simpson (adaptado)",
        year: "1995",
        country: "EE.UU.",
        keyPoints: [
            "Evidencia circunstancial compleja",
            "Múltiples testigos con versiones contradictorias",
            "Análisis forense y ADN",
            "Estrategias de defensa y acusación avanzadas"
        ]
    },
    {
        id: "watergate",
        title: "Escándalo Corporativo",
        description: "Caso de corrupción y encubrimiento en una empresa. Basado en casos de escándalos corporativos históricos.",
        category: "Penal",
        difficulty: "Avanzado",
        duration: "45 min",
        realCase: "Watergate (adaptado)",
        year: "1972",
        country: "EE.UU.",
        keyPoints: [
            "Encubrimiento y obstrucción a la justicia",
            "Documentos y grabaciones como evidencia",
            "Múltiples acusados y conspiraciones",
            "Presión política y mediática"
        ]
    },
    {
        id: "ernst-zundel",
        title: "Libertad de Expresión vs. Discurso de Odio",
        description: "Caso sobre los límites de la libertad de expresión y discurso de odio. Basado en casos internacionales de derechos humanos.",
        category: "Penal",
        difficulty: "Intermedio",
        duration: "40 min",
        realCase: "Ernst Zündel (adaptado)",
        year: "1985",
        country: "Canadá",
        keyPoints: [
            "Derechos fundamentales en conflicto",
            "Límites de la libertad de expresión",
            "Impacto social y ético",
            "Jurisprudencia internacional"
        ]
    },
    {
        id: "mcdonalds-coffee",
        title: "Responsabilidad Civil por Productos",
        description: "Caso de responsabilidad civil donde una empresa es demandada por daños. Basado en casos famosos de responsabilidad del productor.",
        category: "Civil",
        difficulty: "Básico",
        duration: "30 min",
        realCase: "Liebeck vs. McDonald's (adaptado)",
        year: "1994",
        country: "EE.UU.",
        keyPoints: [
            "Responsabilidad del productor",
            "Daños y perjuicios",
            "Negligencia corporativa",
            "Estrategias de defensa empresarial"
        ]
    },
    {
        id: "marbury-madison",
        title: "Control de Constitucionalidad",
        description: "Caso sobre control constitucional y separación de poderes. Basado en casos históricos de derecho constitucional.",
        category: "Administrativo",
        difficulty: "Avanzado",
        duration: "50 min",
        realCase: "Marbury vs. Madison (adaptado)",
        year: "1803",
        country: "EE.UU.",
        keyPoints: [
            "Control de constitucionalidad",
            "Separación de poderes",
            "Jurisdicción y competencia",
            "Precedentes históricos"
        ]
    },
    {
        id: "brown-board",
        title: "Discriminación y Derechos Civiles",
        description: "Caso sobre discriminación y violación de derechos civiles. Basado en casos históricos de derechos humanos.",
        category: "Civil",
        difficulty: "Intermedio",
        duration: "35 min",
        realCase: "Brown vs. Board of Education (adaptado)",
        year: "1954",
        country: "EE.UU.",
        keyPoints: [
            "Discriminación sistemática",
            "Derechos constitucionales",
            "Impacto social y cambio legal",
            "Estrategias de litigio estratégico"
        ]
    }
];

export default function CaseTemplates({ onBack }: CaseTemplatesProps) {
    const router = useRouter();
    const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

    const handleSelectTemplate = async (template: Template) => {
        setLoadingTemplate(template.id);
        try {
            const caseId = await createCaseFromTemplate(template);
            if (caseId) {
                router.push(`/simulation/${caseId}`);
            }
        } catch (error) {
            console.error("Error creating case from template:", error);
            alert("Error al crear el caso. Por favor intenta de nuevo.");
        } finally {
            setLoadingTemplate(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold font-serif gold-accent">Plantillas de Casos Famosos</h2>
                <p className="text-muted-foreground">
                    Selecciona un caso histórico adaptado para simulación. Estos casos están basados en juicios reales famosos.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {templates.map((template) => (
                    <Card key={template.id} className="flex flex-col group">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="border-primary/30 text-primary">
                                    {template.category}
                                </Badge>
                                <Badge className={
                                    template.difficulty === "Básico" ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" :
                                        template.difficulty === "Intermedio" ? "bg-amber-600/20 text-amber-400 border-amber-500/30" :
                                            "bg-red-600/20 text-red-400 border-red-500/30"
                                }>
                                    {template.difficulty}
                                </Badge>
                            </div>
                            <CardTitle className="font-serif text-xl mb-2">{template.title}</CardTitle>
                            <CardDescription className="mb-3">{template.description}</CardDescription>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {template.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Scale className="h-3 w-3" />
                                    {template.realCase}
                                </div>
                            </div>

                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-2">
                                    <strong className="text-primary">Caso Real:</strong> {template.realCase} ({template.year}, {template.country})
                                </p>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-primary mb-1">Puntos Clave:</p>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        {template.keyPoints.map((point, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-primary mt-0.5">•</span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-end">
                            <Button
                                className="w-full"
                                onClick={() => handleSelectTemplate(template)}
                                disabled={loadingTemplate !== null}
                            >
                                {loadingTemplate === template.id ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Usar esta Plantilla
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center">
                <Button variant="outline" onClick={onBack}>
                    Volver
                </Button>
            </div>
        </div>
    );
}

