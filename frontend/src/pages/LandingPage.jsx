import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Link as LinkIcon, Smartphone, Zap, Globe, Share2, Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    // For now, just redirect to dashboard/login since we need auth to save
    navigate('/cadastro');
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="container px-4 md:px-6 py-12 md:py-24 lg:py-32 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Content & Action */}
          <div className="flex flex-col space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Transforme Links em Apps.
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px] mx-auto lg:mx-0">
                Crie botões personalizados para seus sites favoritos e adicione-os à tela inicial do seu celular. Simples, rápido e organizado.
              </p>
            </div>

            {/* Action Card */}
            <div className="w-full max-w-md mx-auto lg:mx-0 bg-card border rounded-2xl p-2 shadow-lg">
              <form onSubmit={handleCreate} className="flex flex-col gap-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <Input 
                    type="url" 
                    placeholder="Cole seu link aqui..." 
                    className="h-12 pl-10 border-0 shadow-none focus-visible:ring-0 bg-transparent text-base"
                    required
                  />
                </div>
                <Button size="lg" className="h-12 text-base font-semibold w-full">
                  Criar meu Botão
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Instantâneo</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <span>Mobile First</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Qualquer Site</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Illustration */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Abstract Phone Mockup */}
            <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden">
              {/* Screen Content */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black opacity-50 z-0" />
              
              {/* Wallpaper/UI */}
              <div className="relative z-10 p-6 flex flex-col h-full">
                {/* Status Bar Mock */}
                <div className="flex justify-between items-center mb-8 opacity-50">
                  <div className="text-xs text-white font-medium">9:41</div>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 bg-white rounded-sm" />
                    <div className="w-3 h-2 bg-white rounded-sm" />
                  </div>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Mock App Icons */}
                  {[
                    { color: "bg-blue-500", icon: Globe, label: "Notícias" },
                    { color: "bg-green-500", icon: Share2, label: "Social" },
                    { color: "bg-purple-500", icon: Zap, label: "Trabalho" },
                    { color: "bg-orange-500", icon: StarIcon, label: "Favoritos" },
                    { color: "bg-red-500", icon: LinkIcon, label: "YouTube" },
                    { color: "bg-white/10 border-2 border-dashed border-white/30", icon: Plus, label: "Novo", text: "text-white/50" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                      <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}>
                        <item.icon className={`w-7 h-7 ${item.text || "text-white"}`} />
                      </div>
                      <span className="text-[10px] text-white/80 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Dock */}
                <div className="mt-auto bg-white/10 backdrop-blur-md rounded-3xl p-4 flex justify-around items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-12 h-12 bg-gray-700 rounded-2xl flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements (Decorations) */}
            <div className="absolute top-20 -left-12 bg-card p-4 rounded-xl shadow-xl border animate-bounce duration-[3000ms]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Link Original</p>
                  <p className="text-sm font-bold">youtube.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for the mock grid
const StarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 4.757 5.159.765c1.16.173 1.622 1.612.77 2.466l-3.742 3.756.883 5.27c.197 1.153-1.008 2.015-2.002 1.493L12 19.347l-4.662 2.37c-.994.522-2.2-.34-2.002-1.493l.883-5.27-3.742-3.756c-.852-.854-.39-2.293.77-2.466l5.159-.765 2.082-4.757z" clipRule="evenodd" />
  </svg>
);

export default LandingPage;
