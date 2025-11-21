import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Loader2, Upload } from "lucide-react";
import { useToast } from "sonner";
import AppButton from "@/components/buttons/AppButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyButtons = () => {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  
  // Edit/Delete State
  const [editingButton, setEditingButton] = useState(null);
  const [deletingButton, setDeletingButton] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();
  
  // For file upload in edit
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async () => {
    try {
      const response = await axios.get(`${API}/buttons/`);
      setButtons(response.data);
    } catch (error) {
      console.error("Failed to fetch buttons", error);
    } finally {
      setLoading(false);
    }
  };

  const onCreateButton = async (data) => {
    setIsCreateLoading(true);
    try {
      const response = await axios.post(`${API}/buttons/`, {
        original_url: data.url
      });
      setButtons([response.data, ...buttons]);
      reset();
    } catch (error) {
      console.error("Failed to create button", error);
    } finally {
      setIsCreateLoading(false);
    }
  };

  const onEditButton = (button) => {
    setEditingButton(button);
    resetEdit({ title: button.title });
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleUpdateButton = async (data) => {
    try {
      let iconUrl = editingButton.icon_url;

      // Handle file upload if present
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await axios.post(`${API}/buttons/upload-icon`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        iconUrl = uploadRes.data.icon_url;
      }

      const response = await axios.put(`${API}/buttons/${editingButton.id}`, {
        title: data.title,
        icon_url: iconUrl
      });

      setButtons(buttons.map(b => b.id === editingButton.id ? response.data : b));
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update button", error);
    }
  };

  const onDeleteButton = async () => {
    if (!deletingButton) return;
    try {
      await axios.delete(`${API}/buttons/${deletingButton.id}`);
      setButtons(buttons.filter(b => b.id !== deletingButton.id));
      setDeletingButton(null);
    } catch (error) {
      console.error("Failed to delete button", error);
    }
  };

  const filteredButtons = buttons.filter(button => 
    button.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Botões</h1>
          <p className="text-muted-foreground">Gerencie seus links como aplicativos.</p>
        </div>
      </div>

      {/* Create Section */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onCreateButton)} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <Label htmlFor="url">Novo Botão</Label>
            <Input 
              id="url" 
              placeholder="Cole o link aqui (ex: https://youtube.com)" 
              {...register("url", { required: "URL é obrigatória" })}
              className="h-12"
            />
            {errors.url && <span className="text-sm text-destructive">{errors.url.message}</span>}
          </div>
          <Button type="submit" size="lg" className="h-12 px-8" disabled={isCreateLoading}>
            {isCreateLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Gerar Botão
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar botões..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-sm"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredButtons.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">Nenhum botão encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {filteredButtons.map(button => (
            <AppButton 
              key={button.id} 
              button={button} 
              onEdit={onEditButton}
              onDelete={setDeletingButton}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Botão</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(handleUpdateButton)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Nome do Botão</Label>
              <Input 
                id="edit-title" 
                {...registerEdit("title", { required: true })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Ícone Personalizado</Label>
              <div className="flex items-center gap-4">
                {editingButton && (
                  <img 
                    src={selectedFile ? URL.createObjectURL(selectedFile) : (editingButton.icon_url && editingButton.icon_url.startsWith('/static') ? `${process.env.REACT_APP_BACKEND_URL}${editingButton.icon_url}` : editingButton.icon_url)} 
                    alt="Preview" 
                    className="w-12 h-12 rounded-lg border object-cover"
                  />
                )}
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="flex-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deletingButton} onOpenChange={() => setDeletingButton(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Botão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O botão "{deletingButton?.title}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteButton} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyButtons;
