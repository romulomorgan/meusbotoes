import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Link as LinkIcon, Sparkles } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden hero-gradient">
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto py-20 md:py-32">
        
        {/* Badge/Pill */}
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
          <Sparkles className="w-3 h-3 mr-1" />
          Fase 1: Estrutura Visual
        </div>

        {/* Main Headline (Optional but good for design) */}
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 pb-2">
          Crie botões incríveis.
        </h1>

        {/* Subtext from requirements */}
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Transforme qualquer link em um botão estilo aplicativo.
          Simples, rápido e elegante.
        </p>

        {/* Main Action Area */}
        <div className="w-full max-w-lg space-y-4 mt-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col gap-4 p-2 bg-background rounded-xl border shadow-sm">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <Input 
                  type="url" 
                  placeholder="Cole aqui o link" 
                  className="h-14 pl-10 text-lg border-0 shadow-none focus-visible:ring-0 bg-transparent"
                />
              </div>
              <Button size="lg" className="h-14 text-lg font-semibold w-full shadow-lg hover:shadow-xl transition-all duration-300">
                Gerar Botão
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Ao clicar em gerar, você concorda com nossos termos de uso.
          </p>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
