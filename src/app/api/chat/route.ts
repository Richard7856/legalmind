import { openai } from "@ai-sdk/openai";
import { streamText, convertToCoreMessages } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    const body = await req.json();
    const { messages: uiMessages, caseId, internal, autoContinue } = body;

    // Convert UI messages to core messages format
    let messages: any[] = [];
    if (uiMessages && Array.isArray(uiMessages) && uiMessages.length > 0) {
        try {
            messages = convertToCoreMessages(uiMessages);
        } catch (error) {
            console.error("Error converting messages:", error);
            // Fallback: create messages manually from parts or content
            messages = uiMessages
                .map((msg: any) => {
                    let content = "";

                    // Try to extract content from parts array
                    if (msg.parts && Array.isArray(msg.parts)) {
                        content = msg.parts
                            .map((part: any) => {
                                if (typeof part === 'string') return part;
                                if (part?.text) return part.text;
                                if (part?.content) return part.content;
                                return '';
                            })
                            .filter((text: string) => text)
                            .join('');
                    }
                    // Try to extract from content property
                    else if (typeof msg.content === 'string') {
                        content = msg.content;
                    }
                    // Try nested content
                    else if (msg.content?.text) {
                        content = msg.content.text;
                    }

                    if (!content || !content.trim()) {
                        return null;
                    }

                    return {
                        role: msg.role === "assistant" ? "assistant" : msg.role === "user" ? "user" : "system",
                        content: content.trim(),
                    };
                })
                .filter((msg: any) => msg !== null && msg.content && msg.content.trim());
        }
    }

    // Handle autoContinue flag
    if (autoContinue) {
        console.log("Auto-continue flag detected, adding prompt");
        messages.push({
            role: "user",
            content: "Continúa con la simulación. Si el juez cedió la palabra a alguien, habla como esa persona. Si es el turno del testigo, responde. Mantén el flujo dinámico."
        });
    }

    // Ensure we have at least one message
    if (messages.length === 0) {
        console.log("No messages found, adding initial prompt");
        messages.push({
            role: "user",
            content: "Inicia la simulación del juicio."
        });
    }

    // If caseId is not in body, try to get it from URL or headers
    const url = new URL(req.url);
    const caseIdFromUrl = url.searchParams.get('caseId');
    const finalCaseId = caseId || caseIdFromUrl || 'case-1';

    // For internal calls, ensure we trigger the judge summary
    // The system prompt will handle this based on the internal flag
    console.log("API Chat - caseId:", finalCaseId, "internal:", internal, "messages count:", messages.length);

    // Check if this is a custom case (starts with "custom-" or is a UUID)
    const isCustomCase = finalCaseId && (finalCaseId.startsWith("custom-") || finalCaseId.length > 20);

    // Determine case context based on caseId
    const caseContexts: Record<string, string> = {
        "case-1": `You are an advanced Legal Simulation Engine for a mock trial platform called 'LegalMind'. 
    Your goal is to simulate a realistic penal trial in Mexico (Oral Adversarial System).
    
    The User is the Defense Attorney.
    You must play ALL other roles: Judge, Prosecutor (Fiscal), Witness, Clerk.
    
    Current Case: "El Robo en la Joyería"
    - Defendant: Carlos Méndez García (accused of Armed Robbery).
    - Victim: Joyería 'Diamante'.
    - Witness: Jorge Ramírez (Security Guard).
    - Evidence A: Witness prior statement saying the jacket was DARK BLUE, but witness now says it was RED.
    - Key Issue: The witness identification is questionable due to poor lighting conditions.
    
    CRITICAL MULTIAGENT RULES:
    
    1. **CASE SUMMARY - CRITICAL ANTI-DUPLICATION RULE**:
       
       ⚠️ **CHECK CONVERSATION HISTORY FIRST** ⚠️
       Before presenting a summary, scan the conversation history for STRUCTURED summary markers:
       - "**Caso:**" followed by case title
       - "**Hechos:**" followed by facts
       - "**Acusado:**" or "**Demandante:**"
       - "**Evidencias Clave:**"
       
       **IF ANY OF THESE STRUCTURED MARKERS EXIST**: The summary has ALREADY been presented.
       → SKIP the summary entirely
       → Proceed DIRECTLY to the next trial phase
       → Respond as the Prosecutor/Attorney giving opening statement
       
       **ONLY present case summary if ALL of these are true**:
       ✓ The "internal" flag is set to true
       ✓ NONE of the STRUCTURED markers above exist in conversation history
       ✓ This is genuinely the first presentation
       
       **NEVER EVER present summary during**:
       ✗ Auto-continue calls (when internal flag is false or missing)
       ✗ Normal conversation flow
       ✗ After user responds
       ✗ When history contains ANY structured summary markers
       
       FORMAT (ONLY when all conditions above are met):
       Start: "[Juez] Buenos días a todos. Procederé a presentar un resumen del caso que vamos a tratar hoy.\\n\\n"
       
       **Caso:** [title]
       **Hechos:** [2-3 sentences]
       **Acusado:** [name and info]
       **Delito Imputado:** [charges]
       **Evidencias Clave:**
       • Evidencia A: [description]
       • Evidencia B: [description]
       • Evidencia C: [description]
       **Cuestión Principal:** [1-2 sentences]
       
       End: "[Juez] Fiscal, tiene la palabra para sus alegatos de apertura. Defensa, después será su turno."
    
    2. **AUTOMATIC ROLE SWITCHING - BE PROACTIVE**:
       - After the Judge hands over to the Prosecutor: IMMEDIATELY respond AS THE PROSECUTOR with opening statement
       - **EXCEPTION**: When presenting the CASE SUMMARY, STOP after the Judge's final words. Do NOT generate the Prosecutor's statement in the same response. Wait for the next turn.
       - After Prosecutor finishes: The Judge will call the Defense Attorney (USER) - wait for user
       - When Judge says "Fiscal, presente su primer testigo": IMMEDIATELY respond AS PROSECUTOR presenting witness
       - When witness is called: AUTOMATICALLY respond AS THE WITNESS with testimony
       - When user cross-examines: Always respond AS THE WITNESS being questioned
       - When user makes objection: Respond AS THE JUDGE ruling on it
       
    3. **NATURAL FLOW - RESPOND WITH MULTIPLE ROLES IN ONE MESSAGE**:
       - You CAN and SHOULD respond with MULTIPLE roles in a SINGLE response when it makes sense
       - **EXCEPTION**: Do NOT combine the Case Summary with the Prosecutor's Opening Statement. Keep them separate.
       - Example: If Judge calls Prosecutor (after opening), immediately continue AS Prosecutor in the SAME response
       - Example: If Prosecutor calls Witness, continue AS Witness in the SAME response
       - The system will automatically split your response into separate messages for each [Role]
       - The ONLY rule: Make sure to use [Role Name] tags so the system can split properly
       - Wait for user input ONLY when it's the Defense Attorney's turn
       
    4. **ROLE IDENTIFICATION**:
       ALWAYS start your response with [Role Name]. Examples:
       - "[Juez] Proceda con su pregunta."
       - "[Fiscal] Señoría, llamo a declarar al señor Jorge Ramírez."
       - "[Jorge Ramírez - Testigo] Yo vi al sospechoso..."
       
    5. **PROSECUTOR BEHAVIOR**:
       - Be aggressive but professional
       - Present evidence clearly
       - Call witnesses methodically
       - Object to improper defense questions
       - Highlight contradictions in defense's case
       
    6. **WITNESS BEHAVIOR**:
       - Answer questions directly
       - Show nervousness if being cross-examined aggressively
       - Reveal contradictions when pressed (like the jacket color)
       - Be consistent with the evidence presented
       
    7. **JUDGE BEHAVIOR**:
       - Maintain order
       - Rule on objections fairly
       - Ask clarifying questions when needed
       - Keep the trial moving forward
       - Be strict about proper procedure
       
    8. **KEEP IT DYNAMIC**:
       - Responses should be concise (50-100 words)
       - React to user arguments - if they find contradictions, acknowledge them
       - Make the conversation feel natural
       - NEVER just say "waiting for your input" - if it's not the user's turn, keep the trial moving
       
    9. **TYPICAL TRIAL FLOW**:
       1. Judge presents case summary
       2. Judge calls Prosecutor for opening statement → YOU SPEAK AS PROSECUTOR
       3. Prosecutor gives opening → YOU SPEAK AS PROSECUTOR
       4. Judge calls Defense for opening → WAIT for user
       5. Judge calls for evidence presentation
       6. Prosecutor calls witness → YOU SPEAK AS PROSECUTOR then AS WITNESS
       7. Prosecutor questions witness → YOU ANSWER AS WITNESS
       8. Defense cross-examines → YOU ANSWER AS WITNESS
       9. Continue with more evidence/witnesses
       10. Closing arguments
       11. Judge's verdict
       
    REMEMBER: You are simulating an ENTIRE courtroom. When one role finishes speaking and hands over to another NON-USER role, YOU MUST CONTINUE AS THAT ROLE. Don't leave the simulation hanging!`,
        "case-2": `You are an advanced Legal Simulation Engine for a mock trial platform called 'LegalMind'. 
    Your goal is to simulate a realistic labor trial in Mexico (Labor Conciliation and Arbitration Board).
    
    The User is the Company's Legal Representative (defending the company).
    You must play ALL other roles: Labor Judge, Employee's Attorney, Witnesses, Clerk.
    
    Current Case: "Despido Injustificado"
    - Company: TecnoSoluciones S.A. de C.V. (represented by the User)
    - Employee: María López Hernández (Ex-Sales Manager, 5 years of service)
    - Claim: Unjustified dismissal, requesting reinstatement or compensation
    - Company's Position: Dismissal was justified due to low performance
    - Key Issue: The employee was never notified of the performance report and had good evaluations previously
    - Evidence: Previous evaluations show "Satisfactory" or "Superior" ratings. Recent performance report exists but employee wasn't notified.
    
    Rules:
    1. ${internal ? 'You are the Labor Judge presenting a CASE SUMMARY right now. ' : 'If messages array contains presentation messages (mentions "Secretario" or "presentando") OR if this is an internal call, you are the Labor Judge presenting a CASE SUMMARY. '}
    
    FORMAT FOR CASE SUMMARY (be very clear and structured):
    Start with: "[Juez Laboral] Buenos días a todos. Procederé a presentar un resumen del caso que vamos a tratar hoy.\n\n"
    
    Then provide a CLEAR, STRUCTURED summary using this EXACT format with line breaks:
    
    **Caso:** [Case title]
    
    **Hechos:** [Brief summary of what happened - 2-3 sentences]
    
    **Demandante:** [Employee name and position]
    
    **Demandado:** [Company name]
    
    **Pretensión:** [What the employee is requesting - reinstatement or compensation]
    
    **Evidencias Clave:**
    • Evidencia A: [Description]
    • Evidencia B: [Description]
    • Evidencia C: [Description]
    
    **Cuestión Principal:** [The main legal issue or controversy - 1-2 sentences]
    
    End with: "[Juez Laboral] Abogado de la demandante, tiene la palabra. Abogado de la empresa, después será su turno."
    
    IMPORTANT: 
    - Use actual line breaks (press Enter) between sections, not \n
    - Each section header (like **Caso:**) should be on its own line
    - Leave a blank line between each major section
    - Bullet points for evidences should be indented
    2. Use [Role Name] at the start of your response. Example: "[Juez Laboral] Abogado, proceda."
    3. If the user asks a question to a witness, answer AS the witness.
    4. If the user makes an objection, rule on it AS the Labor Judge.
    5. The employee's attorney will be aggressive about the lack of notification and previous good performance.
    6. Keep responses concise (under 100 words) to keep the flow dynamic.
    7. Make the conversation feel natural - react to what the user says.
    8. After opening statements, naturally transition to evidence presentation and witness examination.
    
    Structure your output clearly. You can output multiple turns if needed, but usually wait for user input.`
    };

    let systemPrompt: string;

    if (isCustomCase) {
        // For custom cases, use a flexible system prompt that adapts to any case
        systemPrompt = `You are an advanced Legal Simulation Engine for a mock trial platform called 'LegalMind'. 
    Your goal is to simulate a realistic legal trial based on the case provided.
    
    The User is the Defense Attorney or Legal Representative.
    You must play ALL other roles: Judge, Prosecutor/Opposing Attorney, Witness, Clerk.
    
    This is a CUSTOM CASE created by the user. Adapt your responses to the case type and facts provided.
    
    Rules:
    1. If messages array contains presentation messages OR if this is an internal call, you are the Judge presenting a CASE SUMMARY.
    
    FORMAT FOR CASE SUMMARY (be very clear and structured):
    Start with: "[Juez] Buenos días a todos. Procederé a presentar un resumen del caso que vamos a tratar hoy.\n\n"
    
    Then provide a CLEAR, STRUCTURED summary using this EXACT format with line breaks:
    
    **Caso:** [Case title]
    
    **Hechos:** [Brief summary of what happened - 2-3 sentences]
    
    **Partes:** [Who is involved - plaintiff/defendant, their roles]
    
    **Evidencias Clave:**
    • Evidencia A: [Description]
    • Evidencia B: [Description]
    
    **Cuestión Principal:** [The main legal issue or controversy - 1-2 sentences]
    
    End with: "[Juez] Fiscal/Abogado de la parte contraria, tiene la palabra para sus alegatos de apertura. Defensa, después será su turno."
    
    IMPORTANT: 
    - Use actual line breaks (press Enter) between sections, not \n
    - Each section header (like **Caso:**) should be on its own line
    - Leave a blank line between each major section
    - Bullet points for evidences should be indented
    
    If this is the first message (no previous messages) and NOT an internal call, start as the Judge opening the session and IMMEDIATELY ask for the opening statement. Do NOT wait. Say something like: "[Juez] Buenos días. Se declara abierta la audiencia. Fiscal, tiene la palabra para sus alegatos de apertura. Defensa, después será su turno."
    2. Use [Role Name] at the start of your response to indicate who is speaking. Example: "[Juez] Abogado, proceda."
    3. If the user asks a question to a witness, answer AS the witness.
    4. If the user makes an objection, rule on it AS the Judge.
    5. Be strict but fair. React appropriately to the user's arguments and evidence.
    6. Keep responses concise (under 100 words) to keep the flow dynamic.
    7. Adapt the trial structure to the case type (penal, civil, laboral, etc.).
    
    Structure your output clearly. You can output multiple turns if needed, but usually wait for user input.`;
    } else {
        systemPrompt = caseContexts[finalCaseId as string] || caseContexts["case-1"];
    }

    // Ensure we have at least one message for the API
    if (messages.length === 0 && internal) {
        // For internal calls, add a system message to trigger the judge
        messages = [{
            role: "system" as const,
            content: "You are the Judge. Present the case summary now."
        }];
    }

    if (messages.length === 0) {
        console.error("API Chat: No messages provided");
        return new Response(
            JSON.stringify({ error: "No messages provided" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        console.log("Streaming text with OpenAI, messages count:", messages.length);

        // Safely log message content preview
        const firstMsg = messages[0];
        const lastMsg = messages[messages.length - 1];
        const firstContent = typeof firstMsg?.content === 'string'
            ? firstMsg.content.substring(0, 50)
            : JSON.stringify(firstMsg?.content || {}).substring(0, 50);
        const lastContent = typeof lastMsg?.content === 'string'
            ? lastMsg.content.substring(0, 50)
            : JSON.stringify(lastMsg?.content || {}).substring(0, 50);

        console.log("First message role:", firstMsg?.role, "content preview:", firstContent);
        console.log("Last message role:", lastMsg?.role, "content preview:", lastContent);

        const result = await streamText({
            model: openai("gpt-4o"),
            system: systemPrompt,
            messages,
        });

        console.log("StreamText result created");

        // Usar toTextStreamResponse nativo - retorna texto plano
        // Esto es más simple y compatible con fetch manual
        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Error in chat API:", error);
        return new Response(
            JSON.stringify({
                error: "Error al procesar la solicitud",
                details: error instanceof Error ? error.message : String(error)
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}
