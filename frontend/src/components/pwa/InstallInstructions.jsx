import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share, PlusSquare, MoreVertical, Download } from "lucide-react";
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

const InstallInstructions = ({ open, onOpenChange }) => {
  const { promptInstall, deferredPrompt, isIOS, isAndroid } = useInstallPrompt();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Instalar no Celular</DialogTitle>
          <DialogDescription>
            Adicione o Meus Botões Web à sua tela inicial para acesso rápido.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={isIOS ? "ios" : "android"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="ios">iOS (iPhone)</TabsTrigger>
          </TabsList>

          {/* Android Instructions */}
          <TabsContent value="android" className="space-y-4 py-4">
            {deferredPrompt ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para instalar automaticamente.
                </p>
                <Button onClick={promptInstall} className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Adicionar à Tela Inicial
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Passo 1</p>
                    <p className="text-sm text-muted-foreground">
                      Toque no menu de três pontos do navegador (Chrome).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Download className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Passo 2</p>
                    <p className="text-sm text-muted-foreground">
                      Selecione "Adicionar à tela inicial" ou "Instalar aplicativo".
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* iOS Instructions */}
          <TabsContent value="ios" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Share className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Passo 1</p>
                  <p className="text-sm text-muted-foreground">
                    Toque no botão "Compartilhar" na barra inferior do Safari.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <PlusSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Passo 2</p>
                  <p className="text-sm text-muted-foreground">
                    Role para baixo e selecione "Adicionar à Tela de Início".
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <span className="font-bold text-primary">Add</span>
                </div>
                <div>
                  <p className="font-medium">Passo 3</p>
                  <p className="text-sm text-muted-foreground">
                    Confirme o nome e toque em "Adicionar" no canto superior.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InstallInstructions;
