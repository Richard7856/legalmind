"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileText,
    Calendar,
    MapPin,
    User,
    Scale,
    Gavel,
    Eye,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Building,
    Camera,
    FileImage,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseIntakeViewProps {
    caseId: string;
    onAcceptCase: () => void;
}

// Case data configuration
const caseData: Record<string, any> = {
    "case-1": {
        title: "El Robo en la Joyería",
        caseNumber: "45/2024",
        category: "Robo Agravado",
        categoryColor: "red",
        date: "15 de Marzo, 2024",
        time: "22:30 hrs",
        location: "Joyería 'Diamante', Av. Principal 123",
        jurisdiction: "Juzgado Penal No. 3",
        timeline: [
            { time: "22:30 hrs", title: "Ingreso a la Joyería", description: "Un sujeto ingresó a la joyería 'Diamante' cuando el establecimiento estaba a punto de cerrar. La iluminación de la calle era escasa debido a un apagón parcial en la zona." },
            { time: "22:32 hrs", title: "Sustracción de Bienes", description: "El sujeto sustrajo varias piezas de joyería valoradas en aproximadamente $50,000 MXN. El guardia de seguridad observó al individuo desde el exterior del establecimiento." },
            { time: "22:35 hrs", title: "Huida del Sospechoso", description: "El sujeto salió corriendo del establecimiento. El guardia de seguridad intentó perseguirlo pero lo perdió de vista en una calle oscura." },
            { time: "23:15 hrs", title: "Detención del Acusado", description: "La policía detuvo a su cliente, Carlos Méndez, a 3 cuadras del lugar. Fue identificado por el guardia de seguridad como el presunto responsable." },
        ],
        note: "El acusado fue detenido con una bolsa que contenía joyas, pero niega haber estado en la joyería. Alega que encontró la bolsa en la calle.",
        evidences: [
            { id: "A", title: "Declaración Previa del Guardia", date: "16 de Marzo, 2024", description: "Declaración ministerial del guardia de seguridad donde describe al sospechoso.", highlight: "Menciona que el sujeto llevaba una chaqueta AZUL oscura y gorra negra.", type: "Testimonio" },
            { id: "B", title: "Joyas Recuperadas", date: "15 de Marzo, 2024", description: "Bolsa con joyas encontrada en posesión del acusado al momento de su detención.", highlight: "Valoradas en $50,000 MXN. Coinciden con el inventario de la joyería.", type: "Física" },
            { id: "C", title: "Video de Seguridad (Parcial)", date: "15 de Marzo, 2024", description: "Grabación de cámara de seguridad de la joyería. Calidad limitada por la poca iluminación.", highlight: "Se observa una figura con ropa oscura, pero no se distinguen rasgos faciales claramente.", type: "Audiovisual" },
            { id: "D", title: "Informe de Iluminación", date: "16 de Marzo, 2024", description: "Reporte de la compañía eléctrica confirmando apagón parcial en la zona.", highlight: "La iluminación pública estaba al 30% de capacidad entre las 22:00 y 23:00 hrs.", type: "Pericial" },
        ],
        parties: [
            { icon: <Shield className="h-5 w-5 text-blue-400" />, role: "Acusado", name: "Carlos Méndez García", details: "32 años, sin antecedentes penales. Trabajador de construcción." },
            { icon: <Scale className="h-5 w-5 text-red-400" />, role: "Fiscal", name: "Lic. Roberto Sánchez", details: "Ministerio Público. 8 años de experiencia en casos penales." },
            { icon: <Eye className="h-5 w-5 text-primary" />, role: "Testigo Principal", name: "Jorge Ramírez", details: "Guardia de seguridad de la joyería. 5 años en el puesto." },
            { icon: <Gavel className="h-5 w-5 text-primary" />, role: "Juez Presidente", name: "Hon. María González", details: "Juzgado Penal No. 3. 15 años de experiencia." },
        ],
        client: {
            name: "Carlos Méndez García",
            age: "32 años",
            occupation: "Trabajador de Construcción",
            hasRecord: true,
            statement: "Yo no robé nada. Iba caminando por la calle cuando vi una bolsa tirada. La recogí pensando que alguien la había olvidado. No sabía que tenía joyas adentro. Nunca entré a esa joyería. El guardia está confundido, estaba muy oscuro esa noche."
        }
    },
    "case-2": {
        title: "Despido Injustificado",
        caseNumber: "LAB-128/2024",
        category: "Laboral",
        categoryColor: "blue",
        date: "10 de Abril, 2024",
        time: "14:00 hrs",
        location: "Empresa 'TecnoSoluciones S.A. de C.V.'",
        jurisdiction: "Junta de Conciliación y Arbitraje",
        timeline: [
            { time: "15 de Marzo, 2024", title: "Despido del Empleado", description: "María López fue despedida de su puesto como Gerente de Ventas después de 5 años de servicio. La empresa alegó 'falta de productividad' como motivo." },
            { time: "20 de Marzo, 2024", title: "Demanda Laboral", description: "La empleada presentó una demanda ante la Junta de Conciliación y Arbitraje alegando despido injustificado y solicitando reinstalación o indemnización." },
            { time: "5 de Abril, 2024", title: "Audiencia Preliminar", description: "Se realizó la audiencia preliminar donde ambas partes presentaron sus argumentos iniciales. No se llegó a un acuerdo conciliatorio." },
            { time: "10 de Abril, 2024", title: "Audiencia Principal", description: "Se programa la audiencia principal donde se desahogarán las pruebas y se escucharán los testigos de ambas partes." },
        ],
        note: "La empresa tiene registros de evaluaciones de desempeño que muestran que la empleada cumplía con sus objetivos. Sin embargo, hay un reporte reciente de 'bajo rendimiento' que la empleada cuestiona.",
        evidences: [
            { id: "A", title: "Contrato de Trabajo", date: "15 de Marzo, 2019", description: "Contrato laboral por tiempo indeterminado con cláusulas de protección al trabajador.", highlight: "Establece que el despido requiere justa causa documentada y proceso disciplinario previo.", type: "Documental" },
            { id: "B", title: "Evaluaciones de Desempeño", date: "2019-2023", description: "Historial de evaluaciones anuales de la empleada durante sus 5 años de servicio.", highlight: "Todas las evaluaciones muestran calificaciones de 'Satisfactorio' o 'Superior'. Última evaluación: 4.2/5.0.", type: "Documental" },
            { id: "C", title: "Reporte de Bajo Rendimiento", date: "28 de Febrero, 2024", description: "Reporte interno de la empresa que documenta supuesto bajo rendimiento en los últimos 3 meses.", highlight: "La empleada alega que nunca fue notificada de este reporte y que no se le dio oportunidad de mejorar.", type: "Documental" },
            { id: "D", title: "Testimonio de Compañeros", date: "8 de Abril, 2024", description: "Declaraciones de otros empleados del departamento de ventas.", highlight: "Los compañeros confirman que la empleada siempre cumplió con sus metas y tenía buen desempeño.", type: "Testimonio" },
        ],
        parties: [
            { icon: <Building className="h-5 w-5 text-blue-400" />, role: "Representada (Empresa)", name: "TecnoSoluciones S.A. de C.V.", details: "Empresa de tecnología con 50 empleados. Usted representa a la empresa." },
            { icon: <User className="h-5 w-5 text-primary" />, role: "Demandante", name: "María López Hernández", details: "Ex-Gerente de Ventas. 5 años de antigüedad. Solicita reinstalación o indemnización." },
            { icon: <Scale className="h-5 w-5 text-red-400" />, role: "Abogado de la Demandante", name: "Lic. Patricia Martínez", details: "Especialista en derecho laboral. 12 años de experiencia." },
            { icon: <Gavel className="h-5 w-5 text-primary" />, role: "Juez Laboral", name: "Lic. Fernando Ramírez", details: "Junta de Conciliación y Arbitraje. 10 años de experiencia en casos laborales." },
        ],
        client: {
            name: "TecnoSoluciones S.A. de C.V.",
            age: "N/A",
            occupation: "Empresa de Tecnología",
            hasRecord: false,
            statement: "Como representante legal de la empresa, debe defender que el despido fue justificado basándose en el reporte de bajo rendimiento. Sin embargo, debe estar preparado para argumentar sobre la falta de notificación previa a la empleada."
        }
    }
};

export default function CaseIntakeView({ caseId, onAcceptCase }: CaseIntakeViewProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["hechos"]));
    const [isAccepting, setIsAccepting] = useState(false);
    
    const caseInfo = caseData[caseId] || caseData["case-1"];

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const handleAcceptCase = async () => {
        setIsAccepting(true);
        // Simulate a brief delay for the acceptance animation
        await new Promise(resolve => setTimeout(resolve, 800));
        onAcceptCase();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                                    <Scale className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-serif font-bold text-primary">Nuevo Caso Asignado</h1>
                                    <p className="text-sm text-slate-400">Expediente No. {caseInfo.caseNumber}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                                caseInfo.categoryColor === "red" ? "bg-red-900/30 border-red-700/50 text-red-300" :
                                caseInfo.categoryColor === "blue" ? "bg-blue-900/30 border-blue-700/50 text-blue-300" :
                                "bg-primary/20 border-primary/40 text-primary"
                            } text-sm`}>
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">{caseInfo.category}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* Case Overview */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-serif text-primary flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Resumen del Caso
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">{caseId === "case-2" ? "Fecha del Despido" : "Fecha del Incidente"}</p>
                                    <p className="text-sm font-medium">{caseInfo.date}</p>
                                </div>
                            </div>
                            {caseId === "case-1" && (
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-slate-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">Hora Aproximada</p>
                                        <p className="text-sm font-medium">{caseInfo.time}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Ubicación</p>
                                    <p className="text-sm font-medium">{caseInfo.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Building className="h-5 w-5 text-slate-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Jurisdicción</p>
                                    <p className="text-sm font-medium">{caseInfo.jurisdiction}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Hechos del Caso */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-slate-800/30 transition-colors"
                        onClick={() => toggleSection("hechos")}
                    >
                        <CardTitle className="text-lg font-serif text-primary flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Sucesos y Hechos del Caso
                            </span>
                            {expandedSections.has("hechos") ?
                                <ChevronUp className="h-5 w-5" /> :
                                <ChevronDown className="h-5 w-5" />
                            }
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.has("hechos") && (
                        <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-3">
                                {caseInfo.timeline.map((item: any, index: number) => (
                                    <TimelineItem
                                        key={index}
                                        time={item.time}
                                        title={item.title}
                                        description={item.description}
                                    />
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                                <p className="text-sm text-primary/90 leading-relaxed">
                                    <strong className="text-primary">Nota Importante:</strong> {caseInfo.note}
                                </p>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Evidencias */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-slate-800/30 transition-colors"
                        onClick={() => toggleSection("evidencias")}
                    >
                        <CardTitle className="text-lg font-serif text-primary flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileImage className="h-5 w-5" />
                                Evidencias Disponibles
                            </span>
                            {expandedSections.has("evidencias") ?
                                <ChevronUp className="h-5 w-5" /> :
                                <ChevronDown className="h-5 w-5" />
                            }
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.has("evidencias") && (
                        <CardContent className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                            {caseInfo.evidences.map((evidence: any) => (
                                <EvidenceCard
                                    key={evidence.id}
                                    id={evidence.id}
                                    title={evidence.title}
                                    date={evidence.date}
                                    description={evidence.description}
                                    highlight={evidence.highlight}
                                    type={evidence.type}
                                />
                            ))}
                        </CardContent>
                    )}
                </Card>

                {/* Partes Involucradas */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-slate-800/30 transition-colors"
                        onClick={() => toggleSection("partes")}
                    >
                        <CardTitle className="text-lg font-serif text-primary flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Partes Involucradas
                            </span>
                            {expandedSections.has("partes") ?
                                <ChevronUp className="h-5 w-5" /> :
                                <ChevronDown className="h-5 w-5" />
                            }
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.has("partes") && (
                        <CardContent className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                            {caseInfo.parties.map((party: any, index: number) => (
                                <PartyCard
                                    key={index}
                                    icon={party.icon}
                                    role={party.role}
                                    name={party.name}
                                    details={party.details}
                                />
                            ))}
                        </CardContent>
                    )}
                </Card>

                {/* Información del Acusado */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-slate-800/30 transition-colors"
                        onClick={() => toggleSection("acusado")}
                    >
                        <CardTitle className="text-lg font-serif text-primary flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Su Cliente
                            </span>
                            {expandedSections.has("acusado") ?
                                <ChevronUp className="h-5 w-5" /> :
                                <ChevronDown className="h-5 w-5" />
                            }
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.has("acusado") && (
                        <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{caseId === "case-2" ? "Razón Social" : "Nombre Completo"}</p>
                                    <p className="text-sm font-medium">{caseInfo.client.name}</p>
                                </div>
                                {caseId === "case-1" && (
                                    <>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Edad</p>
                                            <p className="text-sm font-medium">{caseInfo.client.age}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ocupación</p>
                                            <p className="text-sm font-medium">{caseInfo.client.occupation}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Antecedentes</p>
                                            <p className="text-sm font-medium text-green-400 flex items-center gap-1">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Sin antecedentes penales
                                            </p>
                                        </div>
                                    </>
                                )}
                                {caseId === "case-2" && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Actividad</p>
                                        <p className="text-sm font-medium">{caseInfo.client.occupation}</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{caseId === "case-2" ? "Instrucciones para la Defensa" : "Declaración del Cliente"}</p>
                                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                    <p className="text-sm text-slate-300 leading-relaxed italic">
                                        "{caseInfo.client.statement}"
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Accept Case Button */}
                <div className="sticky bottom-0 pt-6 pb-8">
                    <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/40 backdrop-blur-md shadow-xl shadow-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-primary mb-1">{caseId === "case-2" ? "¿Listo para representar a su cliente?" : "¿Listo para defender a su cliente?"}</h3>
                                    <p className="text-sm text-slate-300">
                                        Al aceptar este caso, ingresará a la sala de audiencias para el juicio oral.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleAcceptCase}
                                    disabled={isAccepting}
                                    className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-medium shadow-lg shadow-primary/30 transition-all hover:scale-105"
                                >
                                    {isAccepting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Aceptando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Aceptar el Caso
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function TimelineItem({ time, title, description }: { time: string; title: string; description: string }) {
    return (
        <div className="flex gap-4 group">
            <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all" />
                <div className="w-0.5 h-full bg-slate-800 group-hover:bg-slate-700 transition-colors" />
            </div>
            <div className="flex-1 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-primary bg-primary/20 px-2 py-0.5 rounded">{time}</span>
                    <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function EvidenceCard({ id, title, date, description, highlight, type }: {
    id: string;
    title: string;
    date: string;
    description: string;
    highlight: string;
    type: string;
}) {
    return (
        <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">E-{id}</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors">{title}</h4>
                        <p className="text-xs text-slate-500">{date}</p>
                    </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {type}
                </span>
            </div>
            <p className="text-sm text-slate-400 mb-2">{description}</p>
            <div className="p-2 bg-primary/10 border border-primary/30 rounded text-xs text-primary/90">
                <strong className="text-primary">Destacado:</strong> {highlight}
            </div>
        </div>
    );
}

function PartyCard({ icon, role, name, details }: {
    icon: React.ReactNode;
    role: string;
    name: string;
    details: string;
}) {
    return (
        <div className="flex items-start gap-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{role}</p>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">{name}</h4>
                <p className="text-xs text-slate-400">{details}</p>
            </div>
        </div>
    );
}
