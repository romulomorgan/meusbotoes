import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SharePage = () => {
  const { buttonId } = useParams();
  const [button, setButton] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchButton = async () => {
      try {
        const response = await axios.get(`${API}/buttons/public/${buttonId}`);
        setButton(response.data);
        // Track click
        axios.post(`${API}/buttons/${buttonId}/click`);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchButton();
  }, [buttonId]);

  const handleOpen = () => {
    if (button) {
      window.location.href = button.original_url;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !button) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Botão não encontrado</h1>
        <p className="text-muted-foreground">O link pode ter expirado ou sido removido.</p>
      </div>
    );
  }

  const getIconUrl = (url) => {
    if (url && url.startsWith('/static')) {
      return `${process.env.REACT_APP_BACKEND_URL}${url}`;
    }
    return url;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4">
      <div className="bg-background p-8 rounded-2xl shadow-lg max-w-sm w-full text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-md border">
          <img 
            src={getIconUrl(button.icon_url)} 
            alt={button.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div>
          <h1 className="text-xl font-bold mb-1">{button.title}</h1>
          <p className="text-sm text-muted-foreground">Compartilhado via Meus Botões Web</p>
        </div>

        <Button size="lg" className="w-full" onClick={handleOpen}>
          Abrir Link <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        
        <div className="pt-4 border-t">
          <a href="/" className="text-xs text-primary hover:underline">
            Crie seus próprios botões
          </a>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
