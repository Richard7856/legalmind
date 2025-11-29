import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Gavel, BookOpen, Shield, ArrowRight, Brain, Users, TrendingUp, CheckCircle2, MessageSquare, FileText, Target, Zap, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="#">
          <Scale className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold font-serif tracking-tight gold-accent">LegalMind</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Características
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#about">
            Nosotros
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Precios
          </Link>
        </nav>
        <div className="ml-4">
          <Link href="/dashboard">
            <Button size="sm">Ingresar</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-6 max-w-4xl">
                <div className="inline-block rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-primary mb-4">
                  Plataforma de Simulación Legal con IA
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-serif gold-accent">
                  Practica Litigación Real sin Riesgos
                </h1>
                <p className="mx-auto max-w-3xl text-muted-foreground text-lg md:text-xl leading-relaxed">
                  LegalMind es una plataforma de simulación de juicios orales donde puedes practicar tus habilidades de litigación enfrentándote a jueces, fiscales y testigos impulsados por Inteligencia Artificial. Entrena en un entorno seguro, recibe feedback inmediato y mejora tu desempeño antes de entrar a una sala de audiencias real.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/dashboard">
                    <Button variant="default" size="lg" className="gap-2 w-full sm:w-auto">
                      Comenzar Ahora <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Ver Cómo Funciona
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="w-full py-16 md:py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold font-serif gold-accent">
                  El Problema que Resolvemos
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="text-lg">
                    Como abogado, sabes que la práctica real en juicios es la mejor forma de aprender, pero enfrentar casos reales sin experiencia suficiente puede ser arriesgado para tu carrera y para tus clientes.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>No hay oportunidades suficientes para practicar litigación oral antes de casos reales</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>Los errores en juicios reales tienen consecuencias graves</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>Falta de feedback estructurado sobre tu desempeño</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>Dificultad para prepararse para diferentes tipos de casos y escenarios</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold font-serif gold-accent">
                  Nuestra Solución
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="text-lg">
                    LegalMind te permite practicar litigación en un entorno completamente seguro, con casos realistas y feedback inmediato de tu desempeño.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Practica sin límites en casos simulados con IA avanzada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Recibe análisis detallado de tus argumentos y estrategias</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Mejora tus habilidades antes de enfrentar casos reales</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Accede a una biblioteca creciente de casos de diferentes áreas legales</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-16 md:py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="inline-block rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-primary mb-4">
                Proceso Simple
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-serif gold-accent">
                Cómo Funciona LegalMind
              </h2>
              <p className="max-w-2xl text-muted-foreground md:text-lg">
                En solo tres pasos, comienza a mejorar tus habilidades de litigación
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center p-6 group">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-2xl font-bold text-primary group-hover:bg-primary/30 transition-all">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-bold font-serif mb-3">Selecciona un Caso</h3>
                <p className="text-muted-foreground">
                  Elige entre diferentes casos legales (penales, civiles, laborales) según tu área de interés y nivel de dificultad.
                </p>
              </Card>
              <Card className="text-center p-6 group">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-2xl font-bold text-primary group-hover:bg-primary/30 transition-all">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold font-serif mb-3">Practica en Tiempo Real</h3>
                <p className="text-muted-foreground">
                  Interactúa con jueces, fiscales y testigos impulsados por IA. Presenta argumentos, haz preguntas y defiende tu caso como en un juicio real.
                </p>
              </Card>
              <Card className="text-center p-6 group">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-2xl font-bold text-primary group-hover:bg-primary/30 transition-all">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold font-serif mb-3">Recibe Feedback</h3>
                <p className="text-muted-foreground">
                  Al finalizar, obtén un análisis detallado de tu desempeño con sugerencias específicas para mejorar tus habilidades de litigación.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="inline-block rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-primary mb-4">
                Características
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-serif gold-accent">
                Todo lo que Necesitas para Dominar la Litigación
              </h2>
              <p className="max-w-2xl text-muted-foreground md:text-lg">
                Herramientas profesionales diseñadas para abogados que buscan la excelencia
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="p-6 group">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 w-fit mb-4 group-hover:border-primary/40 transition-all">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-serif mb-2">IA Avanzada</h3>
                <p className="text-muted-foreground">
                  Nuestros modelos de IA replican comportamientos realistas de jueces, fiscales y testigos, respondiendo de manera inteligente a tus argumentos y estrategias.
                </p>
              </Card>
              <Card className="p-6 group">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 w-fit mb-4 group-hover:border-primary/40 transition-all">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-serif mb-2">Múltiples Roles</h3>
                <p className="text-muted-foreground">
                  Practica como defensor, fiscal o representante. La IA adapta su comportamiento según el rol que elijas para cada caso.
                </p>
              </Card>
              <Card className="p-6 group">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 w-fit mb-4 group-hover:border-primary/40 transition-all">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-serif mb-2">Feedback Detallado</h3>
                <p className="text-muted-foreground">
                  Recibe análisis completo de tus argumentos, puntos fuertes, áreas de mejora y sugerencias específicas para cada caso.
                </p>
              </Card>
              <Card className="p-6 group">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 w-fit mb-4 group-hover:border-primary/40 transition-all">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-serif mb-2">Casos Realistas</h3>
                <p className="text-muted-foreground">
                  Biblioteca de casos basados en situaciones legales reales, con evidencia, testigos y escenarios complejos que desafían tus habilidades.
                </p>
              </Card>
              <Card className="p-6 group">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 w-fit mb-4 group-hover:border-primary/40 transition-all">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-serif mb-2">Seguimiento de Progreso</h3>
                <p className="text-muted-foreground">
                  Monitorea tu evolución con métricas detalladas, historial de casos completados y estadísticas de desempeño a lo largo del tiempo.
                </p>
              </Card>
              <Card className="p-6 group">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 w-fit mb-4 group-hover:border-primary/40 transition-all">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-serif mb-2">Acceso Inmediato</h3>
                <p className="text-muted-foreground">
                  Comienza a practicar en minutos. Sin instalaciones complicadas, sin esperas. Todo desde tu navegador, cuando y donde lo necesites.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-16 md:py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-block rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-primary mb-4">
                  Beneficios
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-serif gold-accent mb-4">
                  ¿Por Qué Elegir LegalMind?
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <Award className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold font-serif mb-2">Confianza en la Sala</h3>
                      <p className="text-muted-foreground">
                        Llega a tus juicios reales con la confianza que solo da la práctica. Reduce la ansiedad y aumenta tu seguridad al hablar frente a un juez.
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <Target className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold font-serif mb-2">Mejora Continua</h3>
                      <p className="text-muted-foreground">
                        Identifica y corrige tus debilidades antes de que afecten casos reales. Cada simulación es una oportunidad de crecimiento profesional.
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold font-serif mb-2">Sin Riesgos</h3>
                      <p className="text-muted-foreground">
                        Practica estrategias arriesgadas, experimenta con diferentes enfoques y aprende de tus errores sin consecuencias para tu carrera o clientes.
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <BookOpen className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold font-serif mb-2">Preparación Integral</h3>
                      <p className="text-muted-foreground">
                        Accede a casos de diferentes áreas legales y niveles de dificultad. Prepárate para cualquier tipo de litigio que puedas enfrentar.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <Card className="max-w-4xl mx-auto p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-serif gold-accent mb-4">
                ¿Listo para Mejorar tus Habilidades de Litigación?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Únete a abogados que ya están mejorando su desempeño con LegalMind. Comienza tu primera simulación hoy mismo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button variant="default" size="lg" className="gap-2 w-full sm:w-auto">
                    Comenzar Gratis <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border/40">
        <p className="text-xs text-muted-foreground">© 2025 LegalMind. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:text-primary transition-colors" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-xs hover:text-primary transition-colors" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
