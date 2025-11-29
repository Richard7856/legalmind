export type Role = "user" | "system" | "judge" | "prosecutor" | "witness" | "clerk";

export interface SimulationStep {
    id: string;
    role: Role;
    content: string;
    nextStepId?: string;
    delay?: number;
}

export interface CaseScript {
    id: string;
    initialStepId: string;
    steps: Record<string, SimulationStep>;
    responses: {
        triggerState: string;
        keywords: string[];
        nextStepId: string;
        fallbackStepId: string;
    }[];
}

export const JEWELRY_ROBBERY_SCRIPT: CaseScript = {
    id: "case-1",
    initialStepId: "intro",
    steps: {
        intro: {
            id: "intro",
            role: "system",
            content: "Audiencia de Juicio Oral. Causa Penal 45/2024. Delito: Robo Agravado.",
            nextStepId: "judge_opening",
            delay: 500,
        },
        judge_opening: {
            id: "judge_opening",
            role: "judge",
            content: "Buenos días. Se declara abierta la audiencia. Estamos aquí para desahogar las pruebas en el caso contra el Sr. Pérez. Fiscal, tiene la palabra para sus alegatos de apertura.",
            nextStepId: "prosecutor_opening",
            delay: 1500,
        },
        prosecutor_opening: {
            id: "prosecutor_opening",
            role: "prosecutor",
            content: "Gracias, Señoría. Esta fiscalía probará más allá de toda duda razonable que el acusado ingresó a la joyería 'Diamante' armado y sustrajo mercancía valorada en $50,000 dólares. Contamos con el testimonio del guardia de seguridad y evidencia física.",
            nextStepId: "judge_turn_defense",
            delay: 3000,
        },
        judge_turn_defense: {
            id: "judge_turn_defense",
            role: "judge",
            content: "Gracias, Fiscal. Defensa, es su turno para los alegatos de apertura. ¿Cuál es su teoría del caso?",
            // Waits for user input
        },
        judge_ack_defense: {
            id: "judge_ack_defense",
            role: "judge",
            content: "Bien, se tiene por manifestada su teoría del caso. Pasemos al desahogo de pruebas. Fiscal, llame a su primer testigo.",
            nextStepId: "prosecutor_call_witness",
            delay: 2000,
        },
        prosecutor_call_witness: {
            id: "prosecutor_call_witness",
            role: "prosecutor",
            content: "Llamo al estrado al Sr. Roberto Gómez, guardia de seguridad de la joyería.",
            nextStepId: "clerk_oath",
            delay: 2000,
        },
        clerk_oath: {
            id: "clerk_oath",
            role: "clerk",
            content: "Testigo, ¿jura decir la verdad, toda la verdad y nada más que la verdad?",
            nextStepId: "witness_oath",
            delay: 1500,
        },
        witness_oath: {
            id: "witness_oath",
            role: "witness",
            content: "Sí, lo juro.",
            nextStepId: "prosecutor_direct",
            delay: 1000,
        },
        prosecutor_direct: {
            id: "prosecutor_direct",
            role: "prosecutor",
            content: "Sr. Gómez, ¿qué vio usted la noche del 15 de marzo?",
            nextStepId: "witness_direct_response",
            delay: 2000,
        },
        witness_direct_response: {
            id: "witness_direct_response",
            role: "witness",
            content: "Vi al acusado entrar corriendo con una pistola. Llevaba una chaqueta roja. Estoy 100% seguro de que era él.",
            nextStepId: "judge_turn_cross",
            delay: 3000,
        },
        judge_turn_cross: {
            id: "judge_turn_cross",
            role: "judge",
            content: "Defensa, su testigo. Puede proceder con el contrainterrogatorio. Recuerde que puede confrontarlo con su declaración previa (Evidencia A).",
            // Waits for user input
        },
        // Respuestas del Testigo 1 (Guardia)
        witness_cross_response_vision: {
            id: "witness_cross_response_vision",
            role: "witness",
            content: "Bueno... estaba un poco oscuro y yo estaba a unos 20 metros. Pero creo que vi bien.",
            nextStepId: "judge_intervene_1",
            delay: 2000,
        },
        witness_cross_response_contradiction: {
            id: "witness_cross_response_contradiction",
            role: "witness",
            content: "¿Eh? No recuerdo haber dicho que era azul... Quizás me confundí en el reporte policial, pero aquí lo veo y sé que es él.",
            nextStepId: "judge_intervene_1",
            delay: 2500,
        },
        witness_cross_response_generic: {
            id: "witness_cross_response_generic",
            role: "witness",
            content: "No estoy seguro de entender la pregunta, abogado. Solo sé lo que vi esa noche.",
            nextStepId: "judge_intervene_1",
            delay: 2000,
        },
        judge_intervene_1: {
            id: "judge_intervene_1",
            role: "judge",
            content: "Abogado, ¿tiene más preguntas para el testigo o podemos liberar al Sr. Gómez?",
            // Waits for user input
        },
        judge_dismiss_witness: {
            id: "judge_dismiss_witness",
            role: "judge",
            content: "El testigo puede retirarse. Fiscal, ¿tiene más pruebas?",
            nextStepId: "prosecutor_rest",
            delay: 2000,
        },
        prosecutor_rest: {
            id: "prosecutor_rest",
            role: "prosecutor",
            content: "No, Señoría. La fiscalía cierra su caso.",
            nextStepId: "judge_turn_closing",
            delay: 2000,
        },
        judge_turn_closing: {
            id: "judge_turn_closing",
            role: "judge",
            content: "Muy bien. Pasemos a los alegatos de clausura. Defensa, tiene la última palabra. ¿Por qué deberíamos absolver a su cliente?",
            // Waits for user input
        },
        judge_verdict: {
            id: "judge_verdict",
            role: "judge",
            content: "He escuchado a ambas partes. Valorando la prueba bajo la sana crítica, este tribunal encuentra que existe una duda razonable sobre la identificación del acusado, derivada de las contradicciones del testigo único. Por tanto, se dicta sentencia ABSOLUTORIA.",
            nextStepId: "end_simulation",
            delay: 4000,
        },
        end_simulation: {
            id: "end_simulation",
            role: "system",
            content: "¡Felicidades! Has completado el caso con éxito. Has logrado sembrar la duda razonable.",
        }
    },
    responses: [
        {
            triggerState: "judge_turn_defense",
            keywords: ["inocente", "duda", "no fue", "equivocación", "pruebas", "defensa", "teoría", "sostiene"],
            nextStepId: "judge_ack_defense",
            fallbackStepId: "judge_ack_defense",
        },
        {
            triggerState: "judge_turn_cross",
            keywords: ["luz", "iluminación", "oscuro", "ver", "distancia", "metros", "lentes", "gafas"],
            nextStepId: "witness_cross_response_vision",
            fallbackStepId: "witness_cross_response_generic",
        },
        {
            triggerState: "judge_turn_cross",
            keywords: ["reporte", "policía", "declaración", "dijo", "azul", "roja", "color", "ropa", "contradicción"],
            nextStepId: "witness_cross_response_contradiction",
            fallbackStepId: "witness_cross_response_generic",
        },
        {
            triggerState: "judge_intervene_1",
            keywords: ["no", "ninguna", "terminé", "gracias", "retiro", "liberar"],
            nextStepId: "judge_dismiss_witness",
            fallbackStepId: "judge_dismiss_witness", // Assume done if unclear
        },
        {
            triggerState: "judge_turn_closing",
            keywords: ["duda", "razonable", "inocencia", "pruebas", "insuficiente", "testigo", "absolución"],
            nextStepId: "judge_verdict",
            fallbackStepId: "judge_verdict",
        }
    ]
};
