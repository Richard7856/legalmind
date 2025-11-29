import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Obtener todas las simulaciones completadas (público para métricas)
        const simulations = await prisma.simulation.findMany({
            where: {
                status: "COMPLETED",
            },
            include: {
                case: {
                    select: {
                        title: true,
                        category: true,
                        difficulty: true,
                    },
                },
                feedback: {
                    select: {
                        score: true,
                        content: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 50, // Limitar a 50 más recientes
        });

        // Calcular estadísticas
        const allSimulations = await prisma.simulation.findMany({
            select: {
                status: true,
                score: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const stats = {
            total: allSimulations.length,
            completed: allSimulations.filter(s => s.status === "COMPLETED").length,
            averageScore: (() => {
                const completed = allSimulations.filter(s => s.status === "COMPLETED" && s.score !== null);
                if (completed.length === 0) return 0;
                const sum = completed.reduce((acc, s) => acc + (s.score || 0), 0);
                return sum / completed.length;
            })(),
            totalTime: (() => {
                // Calcular tiempo total (estimado: diferencia entre createdAt y updatedAt)
                return allSimulations.reduce((acc, s) => {
                    if (s.status === "COMPLETED") {
                        const diff = new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime();
                        return acc + Math.round(diff / 1000 / 60); // minutos
                    }
                    return acc;
                }, 0);
            })(),
        };

        return NextResponse.json({
            simulations,
            stats,
        });
    } catch (error) {
        console.error("Error fetching simulation history:", error);
        return NextResponse.json(
            { error: "Error al cargar el historial" },
            { status: 500 }
        );
    }
}

