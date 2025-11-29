"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/simulation-script";
import { getCurrentUser } from "@/lib/auth";

export async function saveMessage(simulationId: string, role: Role, content: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("saveMessage: No user authenticated");
            return { success: false, error: "No autenticado" };
        }

        console.log("saveMessage: Saving message for user:", currentUser.id, "simulation:", simulationId);

        // Check if simulation exists, if not create it
        let simulation = await prisma.simulation.findUnique({
            where: { id: simulationId },
        });

        if (!simulation) {
            // Get case by ID (case-1, case-2, or custom case ID)
            // For custom cases, the simulationId might be the case ID itself
            let caseItem = await prisma.case.findUnique({
                where: { id: simulationId },
            });

            // If simulationId is not a case ID, it might be a simulation ID
            // In that case, we need to find the case from the simulation
            // But since simulation doesn't exist, we'll try to find by case ID first
            if (!caseItem) {
                // Try to find case by matching known patterns
                if (simulationId === "case-1" || simulationId === "case-2") {
                    caseItem = await prisma.case.findUnique({
                        where: { id: simulationId },
                    });
                }
            }

            // If still no case, check if simulationId is actually a simulation ID
            // by looking for a simulation with this ID (though it shouldn't exist)
            if (!caseItem) {
                // Last resort: get the first available case
                caseItem = await prisma.case.findFirst();
            }

            if (!caseItem) {
                console.error("saveMessage: Case not found for simulationId:", simulationId);
                return { success: false, error: "Caso no encontrado" };
            }
            
            console.log("saveMessage: Found case:", caseItem.id, caseItem.title);

            console.log("saveMessage: Creating simulation for case:", caseItem.id, "user:", currentUser.id);
            try {
                simulation = await prisma.simulation.create({
                    data: {
                        id: simulationId,
                        userId: currentUser.id,
                        caseId: caseItem.id,
                        status: "IN_PROGRESS",
                        score: 0,
                    },
                });
                console.log("saveMessage: Simulation created successfully:", simulation.id);
            } catch (createError: any) {
                // If simulation already exists (race condition), fetch it
                if (createError?.code === 'P2002') {
                    console.log("saveMessage: Simulation already exists, fetching...");
                    simulation = await prisma.simulation.findUnique({
                        where: { id: simulationId },
                    });
                } else {
                    throw createError;
                }
            }
        }

        if (!simulation) {
            console.error("saveMessage: Could not create or find simulation");
            return { success: false, error: "No se pudo crear o encontrar la simulación" };
        }

        console.log("saveMessage: Creating message for simulation:", simulation.id);
        const message = await prisma.message.create({
            data: {
                simulationId: simulation.id,
                role: role.toUpperCase(), // Store specific role (USER, JUDGE, WITNESS, etc.)
                content,
            },
        });

        console.log("saveMessage: Message saved successfully:", message.id);
        return { success: true, message };
    } catch (error) {
        console.error("Error saving message:", error);
        if (error instanceof Error) {
            console.error("Error details:", error.message, error.stack);
        }
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function getSimulationHistory(simulationId: string) {
    try {
        const messages = await prisma.message.findMany({
            where: { simulationId },
            orderBy: { createdAt: "asc" },
        });
        return messages;
    } catch (error) {
        console.error("Error loading history:", error);
        return [];
    }
}

export async function acceptCase(simulationId: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { success: false, error: "No autenticado" };
        }

        // Ensure simulation exists before updating
        let simulation = await prisma.simulation.findUnique({
            where: { id: simulationId },
        });

        if (!simulation) {
            // Get case by ID
            let caseItem = await prisma.case.findUnique({
                where: { id: simulationId },
            });

            if (!caseItem) {
                caseItem = await prisma.case.findFirst();
            }

            if (!caseItem) {
                return { success: false, error: "Caso no encontrado" };
            }

            simulation = await prisma.simulation.create({
                data: {
                    id: simulationId,
                    userId: currentUser.id,
                    caseId: caseItem.id,
                    status: "IN_PROGRESS",
                    score: 0,
                    caseAccepted: true,
                },
            });
        } else {
            simulation = await prisma.simulation.update({
                where: { id: simulationId },
                data: { caseAccepted: true },
            });
        }

        return { success: true, simulation };
    } catch (error) {
        console.error("Error accepting case:", error);
        return { success: false, error };
    }
}

// Generate case elements based on difficulty
function generateCaseElements(difficulty: string, category: string) {
    const baseElements = {
        evidences: [] as any[],
        witnesses: [] as any[],
        parties: [] as any[],
    };

    if (difficulty === "Básico") {
        baseElements.evidences = [
            { id: "A", type: "Documental", title: "Documento Principal" },
        ];
        baseElements.witnesses = [
            { name: "Testigo Principal", role: "testigo" },
        ];
        baseElements.parties = [
            { name: "Cliente", role: "defendant" },
            { name: "Parte Contraria", role: "plaintiff" },
        ];
    } else if (difficulty === "Intermedio") {
        baseElements.evidences = [
            { id: "A", type: "Documental", title: "Documento Principal" },
            { id: "B", type: "Testimonial", title: "Declaración Previa" },
            { id: "C", type: "Física", title: "Evidencia Física" },
        ];
        baseElements.witnesses = [
            { name: "Testigo Principal", role: "testigo" },
            { name: "Testigo Secundario", role: "testigo" },
        ];
        baseElements.parties = [
            { name: "Cliente", role: "defendant" },
            { name: "Parte Contraria", role: "plaintiff" },
            { name: "Fiscal/Abogado Contrario", role: "prosecutor" },
        ];
    } else { // Avanzado
        baseElements.evidences = [
            { id: "A", type: "Documental", title: "Documento Principal" },
            { id: "B", type: "Testimonial", title: "Declaración Previa" },
            { id: "C", type: "Física", title: "Evidencia Física" },
            { id: "D", type: "Pericial", title: "Peritaje" },
            { id: "E", type: "Audiovisual", title: "Grabación/Video" },
        ];
        baseElements.witnesses = [
            { name: "Testigo Principal", role: "testigo" },
            { name: "Testigo Secundario", role: "testigo" },
            { name: "Perito", role: "expert" },
        ];
        baseElements.parties = [
            { name: "Cliente", role: "defendant" },
            { name: "Parte Contraria", role: "plaintiff" },
            { name: "Fiscal/Abogado Contrario", role: "prosecutor" },
            { name: "Juez", role: "judge" },
        ];
    }

    return baseElements;
}

export async function createCustomCase(formData: any) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("No autenticado");
        }

        // Generate case elements based on difficulty
        const elements = generateCaseElements(formData.difficulty, formData.category);

        // Create case
        const caseItem = await prisma.case.create({
            data: {
                title: formData.title,
                description: formData.description,
                category: formData.category.toUpperCase(),
                difficulty: formData.difficulty.toUpperCase(),
                scenario: formData.scenario || formData.description,
            },
        });

        // Create simulation
        const simulation = await prisma.simulation.create({
            data: {
                userId: currentUser.id,
                caseId: caseItem.id,
                status: "IN_PROGRESS",
                score: 0,
                caseAccepted: false,
            },
        });

        return simulation.id;
    } catch (error) {
        console.error("Error creating custom case:", error);
        throw error;
    }
}

export async function createCaseFromTemplate(template: any) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("No autenticado");
        }

        // Generate case elements based on difficulty
        const elements = generateCaseElements(template.difficulty, template.category);

        // Create case from template
        const caseItem = await prisma.case.create({
            data: {
                title: template.title,
                description: template.description,
                category: template.category.toUpperCase(),
                difficulty: template.difficulty.toUpperCase(),
                scenario: `${template.description}. Basado en el caso real: ${template.realCase} (${template.year}, ${template.country}).`,
            },
        });

        // Create simulation
        const simulation = await prisma.simulation.create({
            data: {
                userId: currentUser.id,
                caseId: caseItem.id,
                status: "IN_PROGRESS",
                score: 0,
                caseAccepted: false,
            },
        });

        return simulation.id;
    } catch (error) {
        console.error("Error creating case from template:", error);
        throw error;
    }
}

export async function generateCaseWithAI(messages: any[]) {
    try {
        const response = await fetch("/api/generate-case", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
            throw new Error("Error generating case");
        }

        return await response.json();
    } catch (error) {
        console.error("Error generating case with AI:", error);
        throw error;
    }
}

export async function createCaseFromAIGeneration(caseData: any) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("No autenticado");
        }

        // Generate case elements based on difficulty
        const elements = generateCaseElements(caseData.difficulty, caseData.category);

        // Create case from AI generation
        const caseItem = await prisma.case.create({
            data: {
                title: caseData.title,
                description: caseData.description,
                category: caseData.category.toUpperCase(),
                difficulty: caseData.difficulty.toUpperCase(),
                scenario: caseData.scenario || caseData.description,
            },
        });

        // Create simulation
        const simulation = await prisma.simulation.create({
            data: {
                userId: currentUser.id,
                caseId: caseItem.id,
                status: "IN_PROGRESS",
                score: 0,
                caseAccepted: false,
            },
        });

        return simulation.id;
    } catch (error) {
        console.error("Error creating case from AI generation:", error);
        throw error;
    }
}

export async function getCaseAcceptanceStatus(simulationId: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return false;
        }

        let simulation = await prisma.simulation.findUnique({
            where: { id: simulationId },
            select: { caseAccepted: true },
        });

        // If simulation doesn't exist, create it with caseAccepted = false
        if (!simulation) {
            let caseItem = await prisma.case.findUnique({
                where: { id: simulationId },
            });

            if (!caseItem) {
                caseItem = await prisma.case.findFirst();
            }

            if (!caseItem) {
                return false;
            }

            await prisma.simulation.create({
                data: {
                    id: simulationId,
                    userId: currentUser.id,
                    caseId: caseItem.id,
                    status: "IN_PROGRESS",
                    score: 0,
                    caseAccepted: false,
                },
            });

            return false;
        }

        return simulation.caseAccepted;
    } catch (error) {
        console.error("Error getting case acceptance status:", error);
        return false;
    }
}

export async function resetSimulation(simulationId: string) {
    try {
        // Delete all messages for this simulation
        await prisma.message.deleteMany({
            where: { simulationId },
        });

        // Reset simulation status
        await prisma.simulation.update({
            where: { id: simulationId },
            data: {
                status: "IN_PROGRESS",
                score: 0,
                caseAccepted: false,
            },
        });

        // Delete feedback if exists
        await prisma.feedback.deleteMany({
            where: { simulationId },
        });

        return { success: true };
    } catch (error) {
        console.error("Error resetting simulation:", error);
        return { success: false, error };
    }
}
