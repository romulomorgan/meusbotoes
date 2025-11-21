import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, CheckCircle, QrCode } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock PIX Key - In real app, fetch from backend config
  const PIX_KEY = "00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913Meus Botoes6009Sao Paulo62070503***6304E2CA";

  useEffect(() => {
    if (location.state?.plan) {
      setPlan(location.state.plan);
    } else {
      // If no plan passed, redirect to plans page
      navigate('/planos');
    }
  }, [location, navigate]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Por favor, anexe o comprovante.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('plan_id', plan.id);
    formData.append('file', selectedFile);

    try {
      await axios.post(`${API}/payments/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      toast.success("Comprovante enviado com sucesso!");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Erro ao enviar comprovante. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
        <div className="rounded-full bg-green-100 p-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Pagamento em Análise!</h1>
        <p className="text-muted-foreground max-w-md">
          Recebemos seu comprovante. Nossa equipe irá analisar e liberar seu plano em breve.
          Você pode acompanhar o status no seu painel.
        </p>
        <Button onClick={() => navigate('/painel')}>Voltar ao Painel</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Pagamento via PIX</h1>
        <p className="text-muted-foreground">Finalize sua assinatura do {plan.name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PIX Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" /> Dados para Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-white p-4 rounded-lg border flex items-center justify-center">
              {/* Placeholder QR Code */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${PIX_KEY}`} 
                alt="QR Code PIX" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <Label>Chave PIX (Copia e Cola)</Label>
              <div className="flex gap-2">
                <Input value={PIX_KEY} readOnly className="font-mono text-xs" />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(PIX_KEY);
                    toast.success("Chave copiada!");
                  }}
                >
                  <span className="sr-only">Copiar</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00006H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50006C5 4.67163 5.67157 4.00006 6.5 4.00006H13.5C14.3284 4.00006 15 4.67163 15 5.50006V12.5001C15 13.3285 14.3284 14.0001 13.5 14.0001H6.5C5.67157 14.0001 5 13.3285 5 12.5001V5.50006ZM6.5 5.00006H13.5C13.7761 5.00006 14 5.22392 14 5.50006V12.5001C14 12.7762 13.7761 13.0001 13.5 13.0001H6.5C6.22386 13.0001 6 12.7762 6 12.5001V5.50006C6 5.22392 6.22386 5.00006 6.5 5.00006Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Valor: <span className="font-bold text-foreground">R$ {plan.price.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> Enviar Comprovante
            </CardTitle>
            <CardDescription>
              Anexe o comprovante de pagamento para liberarmos seu acesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt">Comprovante (Imagem ou PDF)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    id="receipt" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <CheckCircle className="h-4 w-4" />
                      {selectedFile.name}
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Clique para selecionar</span>
                    </>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !selectedFile}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Comprovante"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground text-center">
              A liberação ocorre em até 24h úteis após a confirmação.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
