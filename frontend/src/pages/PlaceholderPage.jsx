import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

const PlaceholderPage = () => {
  const location = useLocation();
  
  // Format path to title (e.g., "/admin/usuarios" -> "Admin / Usuarios")
  const title = location.pathname
    .substring(1)
    .split('/')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' / ') || 'Página';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="p-4 rounded-full bg-muted">
        <Construction className="w-12 h-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Esta página faz parte da estrutura da Fase 1. 
          O conteúdo funcional será implementado na próxima fase.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link to="/">Voltar para Home</Link>
      </Button>
    </div>
  );
};

export default PlaceholderPage;
