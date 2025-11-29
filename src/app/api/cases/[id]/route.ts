import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // First try to find as a case ID
        let caseItem = await prisma.case.findUnique({
            where: { id },
        });
        
        // If not found, try to find as a simulation ID and get its case
        if (!caseItem) {
            const simulation = await prisma.simulation.findUnique({
                where: { id },
                include: { case: true },
            });
            
            if (simulation?.case) {
                caseItem = simulation.case;
            }
        }
        
        if (!caseItem) {
            return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
        }
        
        return NextResponse.json(caseItem);
    } catch (error) {
        console.error("Error fetching case:", error);
        return NextResponse.json(
            { error: "Error al obtener el caso" },
            { status: 500 }
        );
    }
}

