"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Gavel, User, FileText, AlertCircle, Shield, Scale, Mic, Eye, File, Clock, Briefcase, Award, TrendingUp, Info, ChevronDown, ChevronUp, Expand, Minimize2, RotateCcw, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveMessage, getSimulationHistory, acceptCase, getCaseAcceptanceStatus, resetSimulation } from "@/lib/actions";
import CaseIntakeView from "./case-intake-view";

export default function SimulationView({ caseId }: { caseId: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"info" | "evidence" | "timeline" | "opponent">("info");
    const [input, setInput] = useState("");
    const [caseAccepted, setCaseAccepted] = useState<boolean | null>(null);
    const [trialEvents, setTrialEvents] = useState<Array<{ time: string, event: string, type: string }>>([]);
    const [presentedEvidence, setPresentedEvidence] = useState<Set<string>>(new Set());
    const [keyTestimonies, setKeyTestimonies] = useState<Array<{ witness: string, statement: string, timestamp: string }>>([]);
    const [expandedEvidence, setExpandedEvidence] = useState<Set<string>>(new Set());
    const [trialPhase, setTrialPhase] = useState<"presentation" | "opening" | "trial" | "closing">("presentation");
    const [presentationStarted, setPresentationStarted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Store caseId in a ref so we can access it in the fetch interceptor
    const caseIdRef = useRef(caseId);
    useEffect(() => {
        caseIdRef.current = caseId;
    }, [caseId]);

    // Intercept fetch to add caseId to requests
    useEffect(() => {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [url, options] = args;
            if (typeof url === 'string' && url.includes('/api/chat')) {
                try {
                    const body = options?.body ? JSON.parse(options.body as string) : {};
                    body.caseId = caseIdRef.current;
                    console.log("Intercepted fetch to /api/chat, adding caseId:", caseIdRef.current);
                    const response = await originalFetch(url, {
                        ...options,
                        body: JSON.stringify(body),
                    });
                    console.log("Fetch response status:", response.status, response.ok);
                    return response;
                } catch (error) {
                    console.error("Error in fetch interceptor:", error);
                    throw error;
                }
            }
            return originalFetch(...args);
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    // Estado manual para mensajes (reemplaza useChat)
    type Message = {
        id: string;
        role: "user" | "assistant";
        content?: string;
        parts?: Array<{ type: "text"; text: string }>;
    };

    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isUserTurn, setIsUserTurn] = useState(true); // Detecta si es el turno del usuario
    const autoContinueCount = useRef(0); // Track consecutive auto-continues

    // Track saved message IDs to avoid duplicates
    const savedMessageIds = useRef<Set<string>>(new Set());

    // Función para detectar si es el turno del usuario
    const detectUserTurn = (messageContent: string): boolean => {
        const content = messageContent.toLowerCase();

        // Patrones que indican que es el turno del usuario (defensa)
        const userTurnPatterns = [
            'defensa, después será su turno',
            'defensa, proceda',
            'abogado, proceda',
            'defensa, tiene la palabra',
            'abogado de la defensa',
            'su turno, defensa',
            'defensa, puede',
            'abogado, puede',
            'defensa?', // Cuando le preguntan a la defensa
            'abogado?',
            'defensa, adelante',
            'abogado, adelante'
        ];

        // Si encuentra alguno de estos patrones, es turno del usuario
        return userTurnPatterns.some(pattern => content.includes(pattern));
    };

    // Log status changes and message updates
    useEffect(() => {
        console.log("Streaming status:", isStreaming, "messages count:", messages.length);
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            const content = getMessageContent(lastMsg);

            // Auto-save assistant messages when they have content
            if (lastMsg.role === "assistant" && content && content.trim() && content.length > 10) {
                // Save when ready (not streaming) and we haven't saved this message yet
                if (!isStreaming && !savedMessageIds.current.has(lastMsg.id)) {
                    console.log("Auto-saving assistant message:", lastMsg.id, "content length:", content.length);
                    savedMessageIds.current.add(lastMsg.id);
                    saveMessage(caseId, "system", content).catch(err => {
                        console.error("Error auto-saving message:", err);
                        savedMessageIds.current.delete(lastMsg.id); // Retry on next update
                    });
                }

                // Detectar si es el turno del usuario
                const userTurn = detectUserTurn(content);

                // Si detectamos turno de usuario, reseteamos el contador
                if (userTurn) {
                    autoContinueCount.current = 0;
                    setIsUserTurn(true);
                } else {
                    setIsUserTurn(false);
                }

                console.log("User turn detected:", userTurn, "Auto-continue count:", autoContinueCount.current);

                // Si NO es el turno del usuario y NO estamos streaming, auto-continuar
                if (!userTurn && !isStreaming && lastMsg.role === "assistant") {
                    // Safety check: prevent infinite loops
                    if (autoContinueCount.current >= 4) {
                        console.warn("Max auto-continue limit reached. Forcing user turn.");
                        setIsUserTurn(true); // Force user turn to break loop
                        autoContinueCount.current = 0;
                        return;
                    }

                    console.log("Not user's turn - auto-continuing simulation...");
                    autoContinueCount.current += 1;

                    // Capturar el estado actual de mensajes ANTES del setTimeout
                    const currentMessages = messages;

                    // Esperar un poco para que el usuario pueda leer el mensaje
                    setTimeout(async () => {
                        try {
                            setIsStreaming(true);

                            // Llamar al API SIN agregar mensaje del usuario
                            // Esto permite que la IA continúe el flujo naturalmente
                            const apiMessages = currentMessages.map(msg => ({
                                role: msg.role,
                                content: getMessageContent(msg)
                            }));

                            console.log("Auto-continue API call with", apiMessages.length, "messages");

                            const response = await fetch('/api/chat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    messages: apiMessages,
                                    caseId,
                                    autoContinue: true // Flag para que el backend sepa que debe continuar
                                })
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                console.error("API Error Response:", response.status, errorText);
                                console.error("Sent messages:", apiMessages);
                                throw new Error(`API error: ${response.status} - ${errorText}`);
                            }

                            if (!response.body) {
                                throw new Error('No response body');
                            }

                            // Parse stream
                            const reader = response.body.getReader();
                            const decoder = new TextDecoder();
                            let accumulatedText = '';

                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;

                                const chunk = decoder.decode(value, { stream: true });
                                accumulatedText += chunk;
                            }

                            // Split by roles
                            const rolePattern = /\[([\w\sáéíóúñÁÉÍÓÚÑ\-]+)\]/g;
                            const parts = accumulatedText.split(rolePattern);
                            const roleSeparatedMessages: Array<{ role: string, content: string }> = [];

                            for (let i = 1; i < parts.length; i += 2) {
                                const roleName = parts[i];
                                const msgContent = parts[i + 1];

                                if (msgContent && msgContent.trim()) {
                                    roleSeparatedMessages.push({
                                        role: roleName,
                                        content: `[${roleName}] ${msgContent.trim()}`
                                    });
                                }
                            }

                            // Add messages
                            if (roleSeparatedMessages.length === 0) {
                                const assistantMsgId = crypto.randomUUID();
                                const finalMsg: Message = {
                                    id: assistantMsgId,
                                    role: "assistant",
                                    content: accumulatedText,
                                    parts: [{ type: "text", text: accumulatedText }]
                                };
                                setMessages(prev => [...prev, finalMsg]);
                            } else {
                                for (let i = 0; i < roleSeparatedMessages.length; i++) {
                                    const roleMsg = roleSeparatedMessages[i];

                                    if (i > 0) {
                                        await new Promise(resolve => setTimeout(resolve, 800));
                                    }

                                    const assistantMsgId = crypto.randomUUID();
                                    const finalMsg: Message = {
                                        id: assistantMsgId,
                                        role: "assistant",
                                        content: roleMsg.content,
                                        parts: [{ type: "text", text: roleMsg.content }]
                                    };
                                    setMessages(prev => [...prev, finalMsg]);
                                }
                            }

                            setIsStreaming(false);
                        } catch (err) {
                            console.error("Error auto-continuing:", err);
                            setIsStreaming(false);
                            setError(err instanceof Error ? err.message : "Error al continuar");
                        }
                    }, 1500);
                }
            }
        }
    }, [isStreaming, messages, caseId]);

    // Check case acceptance status on mount
    useEffect(() => {
        const checkAcceptance = async () => {
            const accepted = await getCaseAcceptanceStatus(caseId);
            setCaseAccepted(accepted);
        };
        checkAcceptance();
    }, [caseId]);

    // Load history on mount
    useEffect(() => {
        const loadHistory = async () => {
            const history = await getSimulationHistory(caseId);
            if (history.length > 0) {
                const loadedMessages = history.map(msg => ({
                    id: msg.id,
                    role: (msg.role === "USER" ? "user" : "assistant") as "user" | "assistant",
                    parts: [{ type: "text" as const, text: msg.content }],
                }));
                setMessages(loadedMessages);
                setPresentationStarted(true); // Mark as started if history exists

                // Extract trial events from history
                extractTrialEvents(loadedMessages);
            } else {
                // Reset presentation flag if no history - allow presentation to start
                setPresentationStarted(false);
            }
        };
        loadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [caseId, setMessages]);

    // Extract trial events, evidence, and testimonies from messages
    const extractTrialEvents = (msgs: typeof messages) => {
        const events: Array<{ time: string, event: string, type: string }> = [];
        const evidence = new Set<string>();
        const testimonies: Array<{ witness: string, statement: string, timestamp: string }> = [];

        msgs.forEach((msg, idx) => {
            const content = getMessageContent(msg);
            const role = getRoleFromContent(content);
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Detect evidence presentation
            if (content.match(/evidencia|prueba|documento|presenta.*prueba/i)) {
                const evidenceMatch = content.match(/evidencia\s+([A-Z])|prueba\s+([A-Z])|documento\s+([A-Z])/i);
                if (evidenceMatch) {
                    const evId = evidenceMatch[1] || evidenceMatch[2] || evidenceMatch[3];
                    if (evId) evidence.add(evId);
                }
                // Also detect generic evidence mentions
                if (content.match(/presenta.*evidencia|admite.*prueba/i)) {
                    evidence.add(`E${evidence.size + 1}`);
                }
            }

            // Detect testimonies
            if (role.includes("testigo") || role.includes("witness") || content.match(/testigo.*dice|witness.*says/i)) {
                const witnessName = content.match(/\[(.*?)\]/)?.[1] || "Testigo";
                testimonies.push({
                    witness: witnessName,
                    statement: content.substring(0, 150) + (content.length > 150 ? "..." : ""),
                    timestamp: timestamp,
                });
            }

            // Detect key events and trial phases
            if (role.includes("juez") || role.includes("judge") || content.match(/\[Juez\]|\[Judge\]/i)) {
                if (content.match(/presentar|resumen.*caso|caso.*tratar/i)) {
                    events.push({ time: timestamp, event: "Presentación del caso", type: "judge" });
                    setTrialPhase("presentation");
                }
                if (content.match(/apertura|inicio|comenzar|abierta.*audiencia/i)) {
                    events.push({ time: timestamp, event: "Inicio de la audiencia", type: "judge" });
                }
                if (content.match(/alegatos.*apertura|opening.*statement|fiscal.*palabra/i)) {
                    events.push({ time: timestamp, event: "Solicitud de alegatos de apertura", type: "judge" });
                    setTrialPhase("opening");
                }
                if (content.match(/testigo|witness|llama.*testigo|desahogo.*pruebas/i)) {
                    events.push({ time: timestamp, event: "Llamado a testigo", type: "witness" });
                    setTrialPhase("trial");
                }
                if (content.match(/contrainterrogatorio|cross.*examination/i)) {
                    events.push({ time: timestamp, event: "Inicio de contrainterrogatorio", type: "witness" });
                }
                if (content.match(/alegatos.*clausura|closing.*statement|última.*palabra/i)) {
                    events.push({ time: timestamp, event: "Solicitud de alegatos de clausura", type: "judge" });
                    setTrialPhase("closing");
                }
                if (content.match(/sentencia|veredicto|fallo|absuelto|condenado/i)) {
                    events.push({ time: timestamp, event: "Sentencia del juez", type: "judge" });
                }
            }

            // Detect user's opening statement
            if (msg.role === "user" && idx < 5 && content.length > 50 && trialPhase === "opening") {
                events.push({ time: timestamp, event: "Alegatos de apertura presentados", type: "defense" });
            }
        });

        setTrialEvents(events);
        setPresentedEvidence(evidence);
        setKeyTestimonies(testimonies.slice(-5)); // Keep last 5
    };

    // Monitor new messages for events
    useEffect(() => {
        if (messages.length > 0) {
            extractTrialEvents(messages);
        }
    }, [messages]);

    // Auto-start presentation phase if no messages exist and case is accepted
    useEffect(() => {
        // Only start if case is accepted, no messages exist, presentation hasn't started, and not currently loading
        if (caseAccepted === true && messages.length === 0 && !presentationStarted && !isStreaming && input === "") {
            console.log("Starting presentation phase for case:", caseId, "messages.length:", messages.length, "presentationStarted:", presentationStarted);
            // Start with presentation phase - introduce parties and case
            const timer = setTimeout(() => {
                setPresentationStarted(true); // Mark as started once timer kicks in
                console.log("Timer fired! Starting presentation sequence...");
                (async () => {
                    try {
                        // Get case info to determine presentation messages
                        let caseInfo = null;
                        try {
                            console.log("Fetching case info for:", caseId);
                            const caseResponse = await fetch(`/api/cases/${caseId}`);
                            console.log("Case response status:", caseResponse.status);
                            if (caseResponse.ok) {
                                caseInfo = await caseResponse.json();
                                console.log("Case info retrieved:", caseInfo?.title, caseInfo?.category);
                            } else {
                                const errorText = await caseResponse.text();
                                console.error("Failed to fetch case info:", errorText);
                            }
                        } catch (e) {
                            console.error("Error fetching case info:", e);
                        }

                        // Determine presentation messages based on case
                        let presentationMessages: string[];
                        if (caseId === "case-2") {
                            presentationMessages = [
                                "[Sistema] La audiencia está por comenzar. Las partes se están presentando.",
                                "[Secretario] Buenos días. Audiencia Principal. Junta de Conciliación y Arbitraje. Expediente LAB-128/2024.",
                                "[Secretario] Juez Laboral: Lic. Fernando Ramírez. Abogado de la demandante: Lic. Patricia Martínez. Abogado de la empresa: Usted.",
                                "[Juez Laboral] Buenos días a todos. Antes de comenzar, permítanme presentar un resumen del caso que vamos a tratar hoy.",
                            ];
                        } else if (caseId === "case-1") {
                            presentationMessages = [
                                "[Sistema] La audiencia está por comenzar. Las partes se están presentando.",
                                "[Secretario] Buenos días. Audiencia de Juicio Oral. Causa Penal 45/2024. Delito: Robo Agravado.",
                                "[Secretario] Juez Presidente: Hon. María González. Fiscal: Lic. Roberto Sánchez. Defensa: Usted.",
                                "[Juez] Buenos días a todos. Antes de comenzar, permítanme presentar un resumen del caso que vamos a tratar hoy.",
                            ];
                        } else {
                            // Custom case - use generic presentation
                            const caseCategory = caseInfo?.category || "PENAL";
                            const caseTitle = caseInfo?.title || "Caso Personalizado";
                            const isLaboral = caseCategory === "LABORAL";

                            presentationMessages = [
                                "[Sistema] La audiencia está por comenzar. Las partes se están presentando.",
                                isLaboral
                                    ? "[Secretario] Buenos días. Audiencia Principal. Junta de Conciliación y Arbitraje."
                                    : "[Secretario] Buenos días. Audiencia de Juicio Oral.",
                                isLaboral
                                    ? "[Secretario] Juez Laboral: Lic. Fernando Ramírez. Abogado de la demandante: Lic. Patricia Martínez. Abogado de la empresa: Usted."
                                    : "[Secretario] Juez Presidente: Hon. María González. Fiscal: Lic. Roberto Sánchez. Defensa: Usted.",
                                "[Juez] Buenos días a todos. Antes de comenzar, permítanme presentar un resumen del caso que vamos a tratar hoy.",
                            ];
                        }

                        console.log("Sending presentation messages:", presentationMessages.length);

                        // Send initial presentation sequence - send all messages sequentially
                        for (let i = 0; i < presentationMessages.length; i++) {
                            // Wait before each message (except first)
                            if (i > 0) {
                                await new Promise(resolve => setTimeout(resolve, 1200));
                            }

                            const msg = {
                                id: crypto.randomUUID(),
                                role: "assistant" as const,
                                parts: [{ type: "text" as const, text: presentationMessages[i] }],
                            };

                            console.log(`Adding presentation message ${i + 1}/${presentationMessages.length}`);
                            setMessages(prev => {
                                const updated = [...prev, msg];
                                console.log(`Total messages now: ${updated.length}`);
                                return updated;
                            });
                            const saveResult = await saveMessage(caseId, "system", presentationMessages[i]);
                            if (!saveResult.success) {
                                console.error("Failed to save message:", saveResult.error);
                            } else {
                                console.log("Message saved to DB:", saveResult.message?.id);
                            }
                        }

                        console.log("All presentation messages sent, waiting for judge summary...");

                        // After presentation, trigger judge's case summary internally
                        // We'll call the API directly without showing a user message
                        setTimeout(async () => {
                            try {
                                // Call API directly to get judge's summary without user message
                                // Use the intercepted fetch to ensure caseId is included
                                const response = await fetch('/api/chat', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        messages: presentationMessages.map((text) => ({
                                            role: "assistant",
                                            content: text
                                        })),
                                        caseId: caseIdRef.current,
                                        internal: true // Flag to indicate this is an internal/system call
                                    }),
                                });

                                console.log("Judge summary response status:", response.status);

                                if (!response.ok) {
                                    const errorText = await response.text();
                                    console.error("API Error:", response.status, errorText);
                                    throw new Error(`API error: ${response.status}`);
                                }

                                if (!response.body) {
                                    console.error("No response body");
                                    return;
                                }

                                // Read the stream and parse it correctly
                                const reader = response.body.getReader();
                                const decoder = new TextDecoder();
                                let buffer = '';
                                let accumulatedText = '';
                                const judgeMsgId = crypto.randomUUID();
                                let chunkCount = 0;

                                // Create initial empty message
                                const initialMsg = {
                                    id: judgeMsgId,
                                    role: "assistant" as const,
                                    parts: [{ type: "text" as const, text: "" }],
                                };
                                setMessages(prev => [...prev, initialMsg]);

                                try {
                                    while (true) {
                                        const { done, value } = await reader.read();
                                        if (done) {
                                            console.log("Stream finished. Total chunks:", chunkCount, "Accumulated text length:", accumulatedText.length);
                                            break;
                                        }

                                        chunkCount++;
                                        const chunk = decoder.decode(value, { stream: true });
                                        buffer += chunk;

                                        // Log first few chunks to debug format
                                        if (chunkCount <= 3) {
                                            console.log(`Chunk ${chunkCount} (first 100 chars):`, chunk.substring(0, 100));
                                        }

                                        // Process complete lines
                                        const lines = buffer.split('\n');
                                        buffer = lines.pop() || '';

                                        for (const line of lines) {
                                            if (line.trim() === '') continue;

                                            let text = '';

                                            // toTextStreamResponse returns plain text chunks
                                            // Format can be: "0:text" (data stream) or plain text
                                            if (line.startsWith('0:')) {
                                                // Data stream format: "0:text content"
                                                // The content is JSON encoded string, so we need to parse it
                                                try {
                                                    text = JSON.parse(line.slice(2));
                                                    console.log("Parsed data stream text:", text.substring(0, 50));
                                                } catch (e) {
                                                    console.error("Error parsing data stream chunk:", e);
                                                    // Fallback to raw slice if parse fails (though it shouldn't for valid data stream)
                                                    text = line.slice(2);
                                                }
                                            } else if (!line.startsWith('event:') && !line.startsWith('id:') && !line.startsWith(':')) {
                                                // Plain text format
                                                text = line;
                                                console.log("Found plain text format, text length:", text.length);
                                            }

                                            if (text) {
                                                accumulatedText += text;

                                                // Update message in real-time
                                                setMessages(prev => prev.map(msg =>
                                                    msg.id === judgeMsgId
                                                        ? { ...msg, parts: [{ type: "text" as const, text: accumulatedText }] }
                                                        : msg
                                                ));
                                            }
                                        }
                                    }

                                    // Process remaining buffer
                                    if (buffer.trim()) {
                                        let text = '';
                                        if (buffer.startsWith('0:')) {
                                            try {
                                                text = JSON.parse(buffer.slice(2));
                                            } catch (e) {
                                                text = buffer.slice(2);
                                            }
                                        } else if (!buffer.startsWith('event:') && !buffer.startsWith('id:') && !buffer.startsWith(':')) {
                                            text = buffer;
                                        }

                                        if (text) {
                                            accumulatedText += text;
                                        }
                                    }

                                    // Final update
                                    if (accumulatedText.trim()) {
                                        setMessages(prev => prev.map(msg =>
                                            msg.id === judgeMsgId
                                                ? { ...msg, parts: [{ type: "text" as const, text: accumulatedText.trim() }] }
                                                : msg
                                        ));

                                        await saveMessage(caseId, "system", accumulatedText.trim());
                                        setTrialPhase("opening");
                                        console.log("Judge summary saved successfully, length:", accumulatedText.trim().length);
                                    } else {
                                        // Remove empty message
                                        setMessages(prev => prev.filter(m => m.id !== judgeMsgId));
                                        console.error("Empty response from API - no text accumulated. Buffer was:", buffer.substring(0, 100));
                                    }
                                } catch (streamError) {
                                    console.error("Streaming error:", streamError);
                                    // Remove failed message
                                    setMessages(prev => prev.filter(m => m.id !== judgeMsgId));
                                }
                            } catch (error) {
                                console.error("Error getting judge summary:", error);
                            }
                        }, 3000); // Wait 3 seconds after presentation before judge summary
                    } catch (error) {
                        console.error("Error in presentation sequence:", error);
                        setPresentationStarted(false); // Reset on error to allow retry
                    }
                })();
            }, 500); // Start presentation after 500ms
            return () => clearTimeout(timer);
        }
    }, [caseAccepted, messages.length, isStreaming, input, caseId, presentationStarted]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isStreaming]);

    // Función para enviar mensaje usando fetch manual (reemplaza sendMessage de useChat)
    const sendMessageToAI = async (userMessage: string) => {
        try {
            setIsStreaming(true);

            // 1. Add user message to UI immediately
            const userMsg: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: userMessage,
                parts: [{ type: "text", text: userMessage }]
            };
            setMessages(prev => [...prev, userMsg]);

            // 2. Prepare messages for API (convert to simple format)
            const apiMessages = [...messages, userMsg].map(msg => ({
                role: msg.role,
                content: getMessageContent(msg)
            }));

            // 3. Call API with fetch
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    caseId
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body');
            }

            // 4. Parse stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            // Read entire stream first
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;
            }

            // 5. Split accumulated text by role tags
            // Look for patterns like "[RoleName]" or "[Name - Role]"
            const rolePattern = /\[([\w\sáéíóúñÁÉÍÓÚÑ\-]+)\]/g;
            const parts = accumulatedText.split(rolePattern);

            // Process parts: parts[0] is text before first role, then alternates role/content
            const roleSeparatedMessages: Array<{ role: string, content: string }> = [];

            for (let i = 1; i < parts.length; i += 2) {
                const roleName = parts[i];
                const content = parts[i + 1];

                if (content && content.trim()) {
                    roleSeparatedMessages.push({
                        role: roleName,
                        content: `[${roleName}] ${content.trim()}`
                    });
                }
            }

            // If no roles found, treat entire response as single message
            if (roleSeparatedMessages.length === 0) {
                const assistantMsgId = crypto.randomUUID();
                const finalMsg: Message = {
                    id: assistantMsgId,
                    role: "assistant",
                    content: accumulatedText,
                    parts: [{ type: "text", text: accumulatedText }]
                };
                setMessages(prev => [...prev, finalMsg]);
            } else {
                // Add each role message separately with a slight delay for better UX
                for (let i = 0; i < roleSeparatedMessages.length; i++) {
                    const roleMsg = roleSeparatedMessages[i];

                    // Add delay between messages for readability
                    if (i > 0) {
                        await new Promise(resolve => setTimeout(resolve, 800));
                    }

                    const assistantMsgId = crypto.randomUUID();
                    const finalMsg: Message = {
                        id: assistantMsgId,
                        role: "assistant",
                        content: roleMsg.content,
                        parts: [{ type: "text", text: roleMsg.content }]
                    };
                    setMessages(prev => [...prev, finalMsg]);
                }
            }

            // 6. Streaming complete
            setIsStreaming(false);

        } catch (error) {
            console.error("Error in sendMessageToAI:", error);
            setIsStreaming(false);
            setError(error instanceof Error ? error.message : "Error al enviar el mensaje");
            throw error;
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        const userInput = input.trim();
        setInput("");
        setError(null);

        try {
            console.log("Sending message:", userInput.substring(0, 50) + "...");

            // Save user message first
            const saveResult = await saveMessage(caseId, "user", userInput);
            if (!saveResult.success) {
                console.error("Failed to save user message:", saveResult.error);
            }

            // Send message using our custom function
            await sendMessageToAI(userInput);

        } catch (err) {
            console.error("Error in handleSend:", err);
            setError(err instanceof Error ? err.message : "Error al enviar el mensaje");
            // Restore input so user can try again
            setInput(userInput);
        }
    };

    const handleObjection = async () => {
        if (isStreaming) return;

        const objectionText = "¡Objeción!";
        setError(null);

        try {
            // Save user objection message
            const saveResult = await saveMessage(caseId, "user", objectionText);
            if (!saveResult.success) {
                console.error("Failed to save objection:", saveResult.error);
            }

            // Send objection message using our custom function
            await sendMessageToAI(objectionText);
        } catch (err) {
            console.error("Error in handleObjection:", err);
            setError(err instanceof Error ? err.message : "Error al enviar la objeción");
        }
    };

    // Use messages directly (no filtering needed)
    const displayMessages = messages;

    // Helper to extract text content from message parts or content
    const getMessageContent = (message: any) => {
        // First, check if message has content directly (string format) - this is the primary format for toTextStreamResponse
        if (typeof message.content === 'string' && message.content.length > 0) {
            return message.content;
        }
        // Check if message has parts array (for parts-based messages)
        if (message.parts && Array.isArray(message.parts) && message.parts.length > 0) {
            const extracted = message.parts.map((part: any) => {
                if (typeof part === 'string') return part;
                if (typeof part === 'object' && part !== null) {
                    if ('text' in part && typeof part.text === 'string') return part.text;
                    if ('content' in part && typeof part.content === 'string') return part.content;
                    // Sometimes content is nested in an object
                    if (part.content && typeof part.content === 'object' && part.content.text) {
                        return part.content.text;
                    }
                }
                return '';
            }).filter((text: string) => text.length > 0).join('');

            if (extracted) return extracted;
        }
        // Fallback: try to get content from any property
        if (message.text && typeof message.text === 'string') return message.text;
        if (message.content && typeof message.content !== 'string') {
            // Content might be an object with text property
            if (typeof message.content === 'object' && message.content.text) {
                return message.content.text;
            }
        }
        return '';
    };

    // Helper to parse role from content (e.g., "[Judge] ...")
    const getRoleFromContent = (content: string) => {
        const match = content.match(/^\[(.*?)\]/);
        if (match) return match[1].toLowerCase();
        return "system";
    };

    const getRoleBadge = (role: string, content: string) => {
        if (role === "user") return <span className="flex items-center gap-1 text-primary">Abogado (Tú)</span>;

        const detectedRole = getRoleFromContent(content);

        if (detectedRole.includes("juez") || detectedRole.includes("judge") || content.match(/\[Juez\]|\[Judge\]/i)) {
            return <span className="flex items-center gap-1 text-primary"><Gavel className="h-3 w-3" /> {caseId === "case-2" ? "Juez Laboral" : "Juez"}</span>;
        }
        if (detectedRole.includes("fiscal") || detectedRole.includes("prosecutor") || content.match(/\[Fiscal\]/i)) {
            return <span className="flex items-center gap-1 text-red-500"><Scale className="h-3 w-3" /> Fiscal</span>;
        }
        if (detectedRole.includes("testigo") || detectedRole.includes("witness") || content.match(/\[Testigo\]/i)) {
            return <span className="flex items-center gap-1 text-blue-500"><User className="h-3 w-3" /> Testigo</span>;
        }
        if (detectedRole.includes("secretario") || detectedRole.includes("clerk") || content.match(/\[Secretario\]/i)) {
            return <span className="flex items-center gap-1 text-muted-foreground"><FileText className="h-3 w-3" /> Secretario</span>;
        }
        if (content.match(/\[Sistema\]/i)) {
            return <span className="flex items-center gap-1 text-muted-foreground"><Shield className="h-3 w-3" /> Sistema</span>;
        }

        return <span className="flex items-center gap-1 text-muted-foreground"><Shield className="h-3 w-3" /> Sistema</span>;
    };

    const handleAcceptCase = async () => {
        await acceptCase(caseId);
        setCaseAccepted(true);
    };

    const isLoading = isStreaming;

    // Show case intake view if case hasn't been accepted yet
    if (caseAccepted === null) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-muted-foreground">Cargando...</div>
            </div>
        );
    }

    if (!caseAccepted) {
        return <CaseIntakeView caseId={caseId} onAcceptCase={handleAcceptCase} />;
    }

    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            {/* Sidebar - Case Info & Evidence */}
            <div className="w-[40%] min-w-[400px] max-w-[600px] border-r border-border/40 neo-inset flex flex-col hidden md:flex">
                <div className="p-4 border-b border-border/40">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                            <h2 className="text-xl font-serif font-bold gold-accent">
                                {caseId === "case-2" ? "Junta de Conciliación y Arbitraje" : "Sala de Audiencias 1"}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {caseId === "case-2" ? "Juez Laboral: Lic. Fernando Ramírez" : "Juez Presidente: Hon. María González"}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                if (confirm("¿Estás seguro de que deseas reiniciar este caso? Se eliminará todo el historial de conversación.")) {
                                    await resetSimulation(caseId);
                                    setMessages([]);
                                    setTrialEvents([]);
                                    setPresentedEvidence(new Set());
                                    setKeyTestimonies([]);
                                    setTrialPhase("presentation");
                                    setExpandedEvidence(new Set());
                                    setPresentationStarted(false); // Reset presentation flag
                                    // Reload page to restart the simulation
                                    window.location.reload();
                                }
                            }}
                            className="text-xs gap-2 ml-4"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reiniciar
                        </Button>
                    </div>
                </div>

                {/* Tabs Header */}
                <div className="flex border-b border-border/40 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("info")}
                        className={cn("flex-1 py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap px-2", activeTab === "info" ? "border-primary text-primary gold-accent" : "border-transparent text-muted-foreground hover:text-foreground")}
                    >
                        <FileText className="h-3 w-3 inline mr-1" />
                        Expediente
                    </button>
                    <button
                        onClick={() => setActiveTab("evidence")}
                        className={cn("flex-1 py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap px-2", activeTab === "evidence" ? "border-primary text-primary gold-accent" : "border-transparent text-muted-foreground hover:text-foreground")}
                    >
                        <File className="h-3 w-3 inline mr-1" />
                        Evidencia ({presentedEvidence.size || 1})
                    </button>
                    <button
                        onClick={() => setActiveTab("timeline")}
                        className={cn("flex-1 py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap px-2", activeTab === "timeline" ? "border-primary text-primary gold-accent" : "border-transparent text-muted-foreground hover:text-foreground")}
                    >
                        <Clock className="h-3 w-3 inline mr-1" />
                        Timeline
                    </button>
                    <button
                        onClick={() => setActiveTab("opponent")}
                        className={cn("flex-1 py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap px-2", activeTab === "opponent" ? "border-primary text-primary gold-accent" : "border-transparent text-muted-foreground hover:text-foreground")}
                    >
                        <Scale className="h-3 w-3 inline mr-1" />
                        Contraparte
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTab === "info" ? (
                        <>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary/60" /> {caseId === "case-2" ? "Expediente LAB-128/2024" : "Expediente 45/2024"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Caso</p>
                                        <p className="font-medium">{caseId === "case-2" ? "Despido Injustificado" : "El Robo en la Joyería"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">{caseId === "case-2" ? "Materia" : "Delito"}</p>
                                        <Badge variant={caseId === "case-2" ? "outline" : "destructive"} className={caseId === "case-2" ? "bg-blue-600/20 text-blue-400 border-blue-500/30" : "bg-red-600/20 text-red-400 border-red-500/30"}>
                                            {caseId === "case-2" ? "Laboral" : "Robo Agravado"}
                                        </Badge>
                                    </div>
                                    <div className="border-t border-border/40 pt-2">
                                        <p className="text-xs text-muted-foreground uppercase mb-1">Hechos</p>
                                        <p className="text-muted-foreground leading-relaxed text-xs">
                                            {caseId === "case-2"
                                                ? "María López fue despedida después de 5 años de servicio. La empresa alega bajo rendimiento, pero la empleada tiene evaluaciones positivas previas y no fue notificada del reporte de bajo rendimiento."
                                                : "El 15 de marzo, un sujeto ingresó a la joyería 'Diamante' y sustrajo bienes. El guardia identificó a su cliente."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-primary/60" /> Estrategia de Defensa
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <ul className="space-y-2 text-muted-foreground text-xs">
                                        {caseId === "case-2" ? (
                                            <>
                                                <li className="flex gap-2">
                                                    <span className="text-primary">•</span>
                                                    <span>Argumentar que el despido fue justificado basándose en el reporte de bajo rendimiento.</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span className="text-primary">•</span>
                                                    <span>Prepararse para defender la falta de notificación previa a la empleada.</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span className="text-primary">•</span>
                                                    <span>Enfatizar que la empresa siguió procedimientos internos establecidos.</span>
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="flex gap-2">
                                                    <span className="text-primary">•</span>
                                                    <span>Cuestionar la visibilidad del testigo (oscuridad).</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span className="text-primary">•</span>
                                                    <span>Resaltar contradicciones con declaración previa.</span>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Nueva información revelada durante el juicio */}
                            <Card>
                                <CardHeader
                                    className="pb-2 cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => {
                                        const newSet = new Set(expandedEvidence);
                                        if (newSet.has("new-info")) newSet.delete("new-info");
                                        else newSet.add("new-info");
                                        setExpandedEvidence(newSet);
                                    }}
                                >
                                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-primary/60" /> Información Nueva
                                            {keyTestimonies.length > 0 && (
                                                <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                                                    {keyTestimonies.length}
                                                </span>
                                            )}
                                        </span>
                                        {expandedEvidence.has("new-info") ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                {expandedEvidence.has("new-info") && (
                                    <CardContent className="text-sm space-y-3 animate-in slide-in-from-top-2 duration-300">
                                        {keyTestimonies.length > 0 ? (
                                            keyTestimonies.map((testimony, idx) => (
                                                <div key={idx} className="p-3 bg-primary/5 border border-primary/20 rounded-lg hover:border-primary/40 transition-colors">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <p className="font-semibold text-primary text-sm">{testimony.witness}</p>
                                                        <span className="text-[10px] text-muted-foreground">{testimony.timestamp}</span>
                                                    </div>
                                                    <p className="text-xs text-foreground leading-relaxed">{testimony.statement}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic text-center py-4">
                                                Aún no hay nueva información revelada durante el juicio.
                                            </p>
                                        )}
                                    </CardContent>
                                )}
                                {!expandedEvidence.has("new-info") && keyTestimonies.length > 0 && (
                                    <CardContent className="text-xs text-muted-foreground italic text-center py-2">
                                        {keyTestimonies.length} {keyTestimonies.length === 1 ? 'elemento' : 'elementos'} de información nueva. Haz clic para expandir.
                                    </CardContent>
                                )}
                            </Card>
                        </>
                    ) : activeTab === "timeline" ? (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary/60" /> Timeline del Juicio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-3">
                                {trialEvents.length > 0 ? (
                                    <div className="space-y-3">
                                        {trialEvents.map((event, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    {idx < trialEvents.length - 1 && <div className="w-0.5 h-full bg-border/40 mt-1" />}
                                                </div>
                                                <div className="flex-1 pb-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{event.time}</span>
                                                        <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                                                            {event.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{event.event}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic text-center py-4">
                                        El juicio aún no ha comenzado. Espera a que el juez inicie la audiencia.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ) : activeTab === "opponent" ? (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-primary/60" /> Perfil de la Contraparte
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Abogado</p>
                                    <p className="font-medium">{caseId === "case-2" ? "Lic. Patricia Martínez" : "Lic. Roberto Sánchez"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Especialidad</p>
                                    <p className="text-xs text-muted-foreground">{caseId === "case-2" ? "Derecho Laboral" : "Derecho Penal"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Experiencia</p>
                                    <p className="text-xs text-muted-foreground">{caseId === "case-2" ? "12 años" : "8 años"}</p>
                                </div>
                                <div className="border-t border-border/40 pt-3">
                                    <p className="text-xs text-muted-foreground uppercase mb-2">Estrategia Observada</p>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                        <li className="flex gap-2">
                                            <span className="text-red-500">•</span>
                                            <span>{caseId === "case-2" ? "Enfatiza la falta de notificación previa" : "Se basa en identificación del testigo"}</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-red-500">•</span>
                                            <span>{caseId === "case-2" ? "Presenta evaluaciones previas positivas" : "Menciona evidencia física encontrada"}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="border-t border-border/40 pt-3">
                                    <p className="text-xs text-muted-foreground uppercase mb-2">Puntos Débiles Detectados</p>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>{caseId === "case-2" ? "No puede demostrar notificación formal" : "Testigo con condiciones de visibilidad limitadas"}</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ) : activeTab === "evidence" ? (
                        <div className="space-y-3">
                            {caseId === "case-2" ? (
                                <>
                                    <EvidenceCardExpandable
                                        id="A"
                                        title="Contrato de Trabajo"
                                        date="15 de Marzo, 2019"
                                        type="Documental"
                                        description="Contrato laboral por tiempo indeterminado con cláusulas de protección al trabajador."
                                        highlight="El despido requiere justa causa documentada y proceso disciplinario previo."
                                        fullContent="El contrato establece claramente en la cláusula 12 que cualquier despido debe estar fundamentado en justa causa documentada y debe seguir un proceso disciplinario previo que incluya notificación formal al trabajador. La cláusula 15 especifica que el trabajador tiene derecho a ser escuchado antes de cualquier medida disciplinaria. La cláusula 18 establece que en caso de bajo rendimiento, el empleador debe proporcionar un plan de mejora con un período de 30 días antes de considerar el despido."
                                        isExpanded={expandedEvidence.has("A")}
                                        onToggle={() => {
                                            const newSet = new Set(expandedEvidence);
                                            if (newSet.has("A")) newSet.delete("A");
                                            else newSet.add("A");
                                            setExpandedEvidence(newSet);
                                        }}
                                    />
                                    <EvidenceCardExpandable
                                        id="B"
                                        title="Evaluaciones de Desempeño"
                                        date="2019-2023"
                                        type="Documental"
                                        description="Historial de evaluaciones anuales de la empleada durante sus 5 años de servicio."
                                        highlight="Última evaluación: 4.2/5.0 (Superior)"
                                        fullContent="Las evaluaciones muestran un desempeño consistente: 2019 (4.0/5.0 - Satisfactorio), 2020 (4.1/5.0 - Satisfactorio), 2021 (4.3/5.0 - Superior), 2022 (4.2/5.0 - Superior), 2023 (4.2/5.0 - Superior). Todas las evaluaciones incluyen comentarios positivos del supervisor directo sobre el cumplimiento de objetivos y trabajo en equipo. La evaluación de 2023 fue realizada 2 meses antes del despido y no menciona ningún problema de rendimiento."
                                        isExpanded={expandedEvidence.has("B")}
                                        onToggle={() => {
                                            const newSet = new Set(expandedEvidence);
                                            if (newSet.has("B")) newSet.delete("B");
                                            else newSet.add("B");
                                            setExpandedEvidence(newSet);
                                        }}
                                    />
                                    <EvidenceCardExpandable
                                        id="C"
                                        title="Reporte de Bajo Rendimiento"
                                        date="28 de Febrero, 2024"
                                        type="Documental"
                                        description="Reporte interno de la empresa que documenta supuesto bajo rendimiento en los últimos 3 meses."
                                        highlight="La empleada alega que nunca fue notificada de este reporte."
                                        fullContent="El reporte menciona una disminución en ventas del 15% en los últimos 3 meses, pero no especifica si esto se debe a factores externos del mercado. El reporte fue generado por el área de Recursos Humanos pero no hay evidencia de que haya sido entregado formalmente a la empleada. No hay firma de recibido ni notificación por escrito. El reporte no incluye comparativas con otros empleados ni contexto del mercado durante ese período."
                                        isExpanded={expandedEvidence.has("C")}
                                        onToggle={() => {
                                            const newSet = new Set(expandedEvidence);
                                            if (newSet.has("C")) newSet.delete("C");
                                            else newSet.add("C");
                                            setExpandedEvidence(newSet);
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground text-center italic">
                                        Haz clic en cada evidencia para ver más detalles.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <EvidenceCardExpandable
                                        id="A"
                                        title="Declaración Previa del Guardia"
                                        date="16 de Marzo, 2024"
                                        type="Testimonio"
                                        description="Declaración ministerial del guardia de seguridad donde describe al sospechoso."
                                        highlight="Menciona que el sujeto llevaba una chaqueta AZUL oscura y gorra negra."
                                        fullContent="En su declaración ministerial del 16 de marzo, el guardia Jorge Ramírez declaró: 'El sujeto que ingresó a la joyería llevaba una chaqueta AZUL oscura, pantalones negros y una gorra negra. Estaba aproximadamente a 20 metros de distancia cuando lo vi. La iluminación era escasa debido a un apagón parcial en la zona. Estoy seguro de que era el acusado porque lo vi claramente cuando salió corriendo.' Esta declaración fue tomada 24 horas después del incidente. El guardia firmó la declaración sin leerla completamente según su propio testimonio."
                                        isExpanded={expandedEvidence.has("A")}
                                        onToggle={() => {
                                            const newSet = new Set(expandedEvidence);
                                            if (newSet.has("A")) newSet.delete("A");
                                            else newSet.add("A");
                                            setExpandedEvidence(newSet);
                                        }}
                                    />
                                    <EvidenceCardExpandable
                                        id="B"
                                        title="Joyas Recuperadas"
                                        date="15 de Marzo, 2024"
                                        type="Física"
                                        description="Bolsa con joyas encontrada en posesión del acusado al momento de su detención."
                                        highlight="Valoradas en $50,000 MXN. Coinciden con el inventario de la joyería."
                                        fullContent="Las joyas recuperadas incluyen: 3 anillos de oro con diamantes, 2 collares de perlas, 5 pulseras de plata y varios pendientes. El inventario de la joyería confirma que estas piezas fueron reportadas como faltantes. Sin embargo, el acusado alega que encontró la bolsa en la calle y no sabía su contenido. Las joyas estaban en una bolsa de plástico común, sin etiquetas de la joyería. No hay evidencia de ADN o huellas dactilares del acusado en las joyas, solo en la bolsa exterior."
                                        isExpanded={expandedEvidence.has("B")}
                                        onToggle={() => {
                                            const newSet = new Set(expandedEvidence);
                                            if (newSet.has("B")) newSet.delete("B");
                                            else newSet.add("B");
                                            setExpandedEvidence(newSet);
                                        }}
                                    />
                                    <EvidenceCardExpandable
                                        id="C"
                                        title="Video de Seguridad (Parcial)"
                                        date="15 de Marzo, 2024"
                                        type="Audiovisual"
                                        description="Grabación de cámara de seguridad de la joyería. Calidad limitada por la poca iluminación."
                                        highlight="Se observa una figura con ropa oscura, pero no se distinguen rasgos faciales claramente."
                                        fullContent="El video muestra una figura de aproximadamente 1.75m de estatura ingresando a la joyería a las 22:32 hrs. La figura lleva ropa oscura y una gorra. Sin embargo, debido a la baja iluminación y el ángulo de la cámara, no es posible identificar rasgos faciales. El video tiene una duración de 3 minutos y muestra la salida del sujeto corriendo. La calidad del video es de 480p y fue grabado en condiciones de poca luz. Expertos en video forense han determinado que la identificación facial es imposible con este material."
                                        isExpanded={expandedEvidence.has("C")}
                                        onToggle={() => {
                                            const newSet = new Set(expandedEvidence);
                                            if (newSet.has("C")) newSet.delete("C");
                                            else newSet.add("C");
                                            setExpandedEvidence(newSet);
                                        }}
                                    />
                                    <EvidenceCardExpandable
                                        id="D"
                                        title="Informe de Iluminación"
                                        date="16 de Marzo, 2024"
                                        type="Pericial"
                                        description="Reporte de la compañía eléctrica confirmando apagón parcial en la zona."
                                        highlight="La iluminación pública estaba al 30% de capacidad entre las 22:00 y 23:00 hrs."
                                        fullContent="El informe técnico de la compañía eléctrica CFE confirma que hubo un apagón parcial en la zona de la joyería 'Diamante' entre las 22:00 y 23:15 hrs del 15 de marzo. La iluminación pública funcionaba al 30% de su capacidad normal debido a una falla en el transformador local. Esto afectó directamente la visibilidad en la calle donde ocurrió el incidente. El informe incluye fotografías de las condiciones de iluminación tomadas a las 22:30 hrs que muestran una visibilidad extremadamente limitada. Un perito en iluminación determinó que la identificación a 20 metros de distancia en esas condiciones tiene una confiabilidad del 40%."
                                        isExpanded={expandedEvidence.has("D")}
                                        onToggle={() => {
                                            const newSet = new Set(expandedEvidence);
                                            if (newSet.has("D")) newSet.delete("D");
                                            else newSet.add("D");
                                            setExpandedEvidence(newSet);
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground text-center italic">
                                        Haz clic en cada evidencia para expandir y ver todos los detalles.
                                    </p>
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative">
                {/* Stage Indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-10">
                    <div className="h-full bg-primary w-1/3 transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto scroll-smooth" ref={scrollRef}>
                    {displayMessages.length === 0 && !isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto">
                                    <Gavel className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif font-bold gold-accent mb-2">Esperando inicio de la audiencia</h3>
                                    <p className="text-sm text-muted-foreground">El juez iniciará la audiencia en breve...</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-3xl mx-auto py-4">
                            {displayMessages.map((msg) => {
                                const content = getMessageContent(msg);
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                            } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                    >
                                        {/* Avatar */}
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border-2 ${msg.role === "user" ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(212,175,55,0.5)]" :
                                            getRoleFromContent(content).includes("juez") || content.match(/\[Juez\]/i) ? "bg-primary/20 text-primary border-primary/40" :
                                                getRoleFromContent(content).includes("fiscal") || content.match(/\[Fiscal\]/i) ? "bg-red-600/20 text-red-400 border-red-500/40" :
                                                    getRoleFromContent(content).includes("testigo") || content.match(/\[Testigo\]/i) ? "bg-blue-600/20 text-blue-400 border-blue-500/40" :
                                                        getRoleFromContent(content).includes("secretario") || content.match(/\[Secretario\]/i) ? "bg-muted text-muted-foreground border-border" :
                                                            "bg-muted text-muted-foreground border-border"
                                            }`}>
                                            {msg.role === "user" ? <User className="h-5 w-5" /> :
                                                getRoleFromContent(content).includes("juez") || content.match(/\[Juez\]/i) ? <Gavel className="h-5 w-5" /> :
                                                    getRoleFromContent(content).includes("fiscal") || content.match(/\[Fiscal\]/i) ? <Scale className="h-5 w-5" /> :
                                                        getRoleFromContent(content).includes("testigo") || content.match(/\[Testigo\]/i) ? <Eye className="h-5 w-5" /> :
                                                            getRoleFromContent(content).includes("secretario") || content.match(/\[Secretario\]/i) ? <FileText className="h-5 w-5" /> :
                                                                <Shield className="h-5 w-5" />}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <span className="text-xs font-bold uppercase tracking-wider">{getRoleBadge(msg.role, content)}</span>
                                                <span className="text-[10px] text-slate-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className={`rounded-2xl p-4 text-sm shadow-md leading-relaxed ${msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                                                : getRoleFromContent(content).includes("sistema")
                                                    ? "bg-transparent text-muted-foreground italic text-center w-full border border-dashed border-border/40"
                                                    : "neo-inset rounded-tl-none"
                                                }`}>
                                                <div className="break-words">
                                                    {content.split('\n').map((line, idx) => {
                                                        const trimmedLine = line.trim();

                                                        // Empty line - add spacing
                                                        if (trimmedLine === '') {
                                                            return <div key={idx} className="h-2" />;
                                                        }

                                                        // Format bold text sections (e.g., **Caso:**)
                                                        if (trimmedLine.match(/^\*\*.*?\*\*:/)) {
                                                            const parts = trimmedLine.split(/(\*\*.*?\*\*:)/);
                                                            return (
                                                                <div key={idx} className="mb-3 mt-4 first:mt-0">
                                                                    {parts.map((part, pIdx) => {
                                                                        if (part.match(/^\*\*.*?\*\*:/)) {
                                                                            const text = part.replace(/\*\*/g, '').replace(':', '');
                                                                            return (
                                                                                <div key={pIdx} className="flex items-center gap-2 mb-1">
                                                                                    <strong className="text-primary font-bold text-base">{text}:</strong>
                                                                                    <div className="flex-1 h-px bg-primary/20" />
                                                                                </div>
                                                                            );
                                                                        }
                                                                        if (part.trim()) {
                                                                            return <p key={pIdx} className="text-foreground ml-2 mt-1 leading-relaxed">{part}</p>;
                                                                        }
                                                                        return null;
                                                                    })}
                                                                </div>
                                                            );
                                                        }

                                                        // Format bold text inline
                                                        if (trimmedLine.match(/\*\*.*?\*\*/)) {
                                                            return (
                                                                <div key={idx} className="mb-2">
                                                                    {trimmedLine.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                                                                        if (part.match(/\*\*.*?\*\*/)) {
                                                                            const text = part.replace(/\*\*/g, '');
                                                                            return <strong key={pIdx} className="text-primary font-semibold">{text}</strong>;
                                                                        }
                                                                        return <span key={pIdx}>{part}</span>;
                                                                    })}
                                                                </div>
                                                            );
                                                        }

                                                        // Format bullet points for evidences
                                                        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                                                            const evidenceText = trimmedLine.replace(/^[•-]\s*/, '');
                                                            return (
                                                                <div key={idx} className="ml-6 mb-2 flex items-start gap-3">
                                                                    <span className="text-primary font-bold mt-0.5 shrink-0">•</span>
                                                                    <span className="text-foreground leading-relaxed">{evidenceText}</span>
                                                                </div>
                                                            );
                                                        }

                                                        // Regular line - check if it's part of a structured section
                                                        if (trimmedLine.includes('[') && trimmedLine.includes(']')) {
                                                            // This is a role tag line, keep it as is
                                                            return <div key={idx} className="mb-2 text-foreground">{line}</div>;
                                                        }

                                                        // Regular content line
                                                        return <div key={idx} className="mb-1.5 text-foreground leading-relaxed">{trimmedLine || line}</div>;
                                                    }).filter((item: any) => item !== null)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {isLoading && (
                                <div className="flex gap-4 animate-pulse">
                                    <div className="h-10 w-10 rounded-full bg-muted border-2 border-border flex items-center justify-center shrink-0">
                                        <span className="text-muted-foreground">...</span>
                                    </div>
                                    <div className="neo-inset rounded-2xl rounded-tl-none p-4 text-sm text-muted-foreground flex items-center gap-2">
                                        <Mic className="h-3 w-3 animate-bounce text-primary" /> Escribiendo...
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border/40 bg-background/80 backdrop-blur-md sticky bottom-0">
                    {error && (
                        <div className="max-w-3xl mx-auto mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setError(null)}
                                className="ml-auto h-6 px-2 text-red-400 hover:text-red-300"
                            >
                                ×
                            </Button>
                        </div>
                    )}
                    {/* Mensaje indicando que no es el turno del usuario */}
                    {!isUserTurn && !isStreaming && (
                        <div className="max-w-3xl mx-auto mb-3 p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm text-primary flex items-center gap-2 justify-center">
                            <Clock className="h-4 w-4" />
                            <span>La simulación continúa automáticamente... (Solo puedes objetar)</span>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
                        <Input
                            placeholder={isUserTurn ? "Escriba su argumento u objeción aquí..." : "Esperando tu turno..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 neo-inset focus-visible:ring-primary/50 focus-visible:border-primary/40"
                            autoFocus={isUserTurn}
                            disabled={isLoading || !isUserTurn}
                        />
                        <Button
                            type="button"
                            onClick={handleObjection}
                            disabled={isLoading}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500"
                            title="Hacer una objeción"
                        >
                            <Ban className="h-4 w-4" />
                        </Button>
                        {isUserTurn && (
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="shadow-lg shadow-primary/20"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        )}
                    </form>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-muted-foreground">
                            {isUserTurn
                                ? "Presiona Enter para enviar. Tu intervención será evaluada por la IA."
                                : "La simulación continúa automáticamente. Puedes objetar en cualquier momento."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) {
    return (
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
            {children}
        </span>
    )
}

interface EvidenceCardExpandableProps {
    id: string;
    title: string;
    date: string;
    type: string;
    description: string;
    highlight: string;
    fullContent: string;
    isExpanded: boolean;
    onToggle: () => void;
}

function EvidenceCardExpandable({ id, title, date, type, description, highlight, fullContent, isExpanded, onToggle }: EvidenceCardExpandableProps) {
    return (
        <Card className="group transition-all hover:border-primary/40">
            <CardHeader className="p-3 pb-2 cursor-pointer" onClick={onToggle}>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                        <File className="h-4 w-4" /> Evidencia {id}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
                <div>
                    <p className="font-medium text-sm mb-1">{title}</p>
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs text-muted-foreground">{date}</p>
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            {type}
                        </Badge>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">{description}</p>

                <div className="neo-inset p-2 rounded text-muted-foreground text-xs">
                    <strong className="text-primary">Destacado:</strong> {highlight}
                </div>

                {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border/40 animate-in slide-in-from-top-2">
                        <p className="text-xs font-medium text-primary mb-2">Contenido Completo:</p>
                        <div className="neo-inset p-3 rounded text-xs text-muted-foreground leading-relaxed">
                            {fullContent}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
