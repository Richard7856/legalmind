import SimulationView from "@/components/simulation/simulation-view";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SimulationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-4 h-14 flex items-center border-b bg-background sticky top-0 z-10">
                <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                </Link>
                <div className="ml-auto font-medium">
                    Simulación en curso: Caso #{id}
                </div>
            </header>
            <main className="flex-1 overflow-hidden">
                <SimulationView caseId={id} />
            </main>
        </div>
    );
}
