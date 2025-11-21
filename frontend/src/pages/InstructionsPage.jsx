import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Share, PlusSquare, MoreVertical, Download, Smartphone } from "lucide-react";
import { Link } from 'react-router-dom';

const InstructionsPage = () => {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/painel">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Como Instalar</h1>
          <p className="text-muted-foreground">Guia passo a passo para adicionar à tela inicial</p>
        </div>
      </div>

      <Tabs defaultValue="android" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-8">
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="ios">iOS (iPhone)</TabsTrigger>
        </TabsList>

        <TabsContent value="android" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MoreVertical className="h-5 w-5" /> Passo 1
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Abra o navegador Chrome e toque no ícone de menu (três pontos) no canto superior direito.
                </p>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <span className="text-muted-foreground">GIF/Imagem do Menu</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" /> Passo 2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Selecione a opção "Adicionar à tela inicial" ou "Instalar aplicativo" na lista.
                </p>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <span className="text-muted-foreground">GIF/Imagem da Opção</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ios" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="h-5 w-5" /> Passo 1
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  No Safari, toque no botão "Compartilhar" localizado na barra inferior.
                </p>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <span className="text-muted-foreground">Ícone Share</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusSquare className="h-5 w-5" /> Passo 2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Role o menu para cima e encontre a opção "Adicionar à Tela de Início".
                </p>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <span className="text-muted-foreground">Opção Add</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" /> Passo 3
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Confirme o nome do aplicativo e toque em "Adicionar" no canto superior direito.
                </p>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <span className="text-muted-foreground">Confirmar</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructionsPage;
