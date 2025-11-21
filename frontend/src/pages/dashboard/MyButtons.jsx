import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Loader2, Star, Share2, FolderPlus, Trash2 } from "lucide-react";
import AppButton from "@/components/buttons/AppButton";
import InstallInstructions from "@/components/pwa/InstallInstructions";
import { toast } from "sonner";
import { useAuth } from '../../context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const { user } = useAuth();
  
  // Edit/Delete State
  const [editingButton, setEditingButton] = useState(null);
  const [deletingButton, setDeletingButton] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Category State
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  // Instructions State
  const [showInstructions, setShowInstructions] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setEditValue } = useForm();
  
  const [selectedFile, setSelectedFile] = useState(null);

  // Check Expiration
  const isExpired = user?.plan_expires_at && new Date(user.plan_expires_at) < new Date();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [buttonsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/buttons/`),
        axios.get(`${API}/categories/`)
      ]);
      setButtons(buttonsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const onCreateButton = async (data) => {
    if (isExpired) {
      toast.error("Seu plano expirou. Renove para criar novos botões.");
      return;
    }
    setIsCreateLoading(true);
    try {
      const response = await axios.post(`${API}/buttons/`, {
        original_url: data.url,
        category_id: selectedCategory !== "all" ? selectedCategory : null
      });
      setButtons([response.data, ...buttons]);
      reset();
      setShowInstructions(true);
      toast.success("Botão criado com sucesso!");
    } catch (error) {
      console.error("Failed to create button", error);
      const errorMessage = error.response?.data?.detail || "Erro ao criar botão. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setIsCreateLoading(false);
    }
  };

  const onEditButton = (button) => {
    if (isExpired) return;
    setEditingButton(button);
    resetEdit({ title: button.title });
    setEditValue("category_id", button.category_id || "none");
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleUpdateButton = async (data) => {
    try {
      let iconUrl = editingButton.icon_url;

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
        icon_url: iconUrl,
        category_id: data.category_id === "none" ? null : data.category_id
      });

      setButtons(buttons.map(b => b.id === editingButton.id ? response.data : b));
      setIsEditDialogOpen(false);
      toast.success("Botão atualizado!");
    } catch (error) {
      console.error("Failed to update button", error);
      toast.error("Erro ao atualizar botão.");
    }
  };

  const onDeleteButton = async () => {
    if (!deletingButton) return;
    try {
      await axios.delete(`${API}/buttons/${deletingButton.id}`);
      setButtons(buttons.filter(b => b.id !== deletingButton.id));
      setDeletingButton(null);
      toast.success("Botão excluído.");
    } catch (error) {
      console.error("Failed to delete button", error);
      toast.error("Erro ao excluir botão.");
    }
  };

  const toggleFavorite = async (button) => {
    try {
      const newStatus = !button.is_favorite;
      const response = await axios.put(`${API}/buttons/${button.id}`, {
        is_favorite: newStatus
      });
      setButtons(buttons.map(b => b.id === button.id ? response.data : b));
      toast.success(newStatus ? "Adicionado aos favoritos" : "Removido dos favoritos");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao atualizar favorito");
    }
  };

  const handleShare = (button) => {
    const shareUrl = `${window.location.origin}/share/${button.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const response = await axios.post(`${API}/categories/`, { name: newCategoryName });
      setCategories([...categories, response.data]);
      setNewCategoryName("");
      setIsCategoryDialogOpen(false);
      toast.success("Categoria criada!");
    } catch (error) {
      toast.error("Erro ao criar categoria.");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${API}/categories/${categoryId}`);
      setCategories(categories.filter(c => c.id !== categoryId));
      // Update buttons to remove category
      setButtons(buttons.map(b => b.category_id === categoryId ? { ...b, category_id: null } : b));
      if (selectedCategory === categoryId) setSelectedCategory("all");
      toast.success("Categoria excluída.");
    } catch (error) {
      toast.error("Erro ao excluir categoria.");
    }
  };

  // Filter and Sort
  const filteredButtons = buttons
    .filter(button => {
      const matchesSearch = button.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || button.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Favorites first
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      // Then by date desc
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Botões</h1>
          <p className="text-muted-foreground">Gerencie seus links como aplicativos.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
             <FolderPlus className="mr-2 h-4 w-4" /> Nova Categoria
           </Button>
        </div>
      </div>

      {isExpired && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Plano Expirado</AlertTitle>
          <AlertDescription>
            Sua assinatura venceu. Seus botões estão inativos e você não pode criar novos. 
            <a href="/planos" className="font-bold underline ml-1">Renove agora.</a>
          </AlertDescription>
        </Alert>
      )}

      {/* Create Section */}
      <div className={`bg-card border rounded-xl p-6 shadow-sm ${isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
        <form onSubmit={handleSubmit(onCreateButton)} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <Label htmlFor="url">Novo Botão</Label>
            <Input 
              id="url" 
              placeholder="Cole o link aqui (ex: https://youtube.com)" 
              {...register("url", { required: "URL é obrigatória" })}
              className="h-12"
              disabled={isExpired}
            />
            {errors.url && <span className="text-sm text-destructive">{errors.url.message}</span>}
          </div>
          <Button type="submit" size="lg" className="h-12 px-8" disabled={isCreateLoading || isExpired}>
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar botões..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories Management (Mini List) */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-xs">
              {cat.name}
              <button onClick={() => handleDeleteCategory(cat.id)} className="text-muted-foreground hover:text-destructive ml-1">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

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
        <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 ${isExpired ? 'grayscale opacity-70 pointer-events-none' : ''}`}>
          {filteredButtons.map(button => (
            <div key={button.id} className="relative group">
              {/* Favorite Indicator */}
              {button.is_favorite && (
                <div className="absolute top-0 left-0 z-20 p-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
              )}
              
              <AppButton 
                button={button} 
                onEdit={onEditButton}
                onDelete={setDeletingButton}
                onShowInstructions={() => setShowInstructions(true)}
                extraActions={[
                  {
                    icon: Star,
                    label: "Favoritar",
                    onClick: () => toggleFavorite(button),
                    className: button.is_favorite ? "text-yellow-400" : ""
                  },
                  {
                    icon: Share2,
                    label: "Compartilhar",
                    onClick: () => handleShare(button)
                  }
                ]}
              />
            </div>
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
              <Label>Categoria</Label>
              <Select 
                onValueChange={(val) => setEditValue("category_id", val)} 
                defaultValue={editingButton?.category_id || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Categoria</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Create Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Categoria</Label>
              <Input 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Trabalho, Estudos..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCategory}>Criar</Button>
          </DialogFooter>
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

      {/* Install Instructions Modal */}
      <InstallInstructions 
        open={showInstructions} 
        onOpenChange={setShowInstructions} 
      />
    </div>
  );
};

export default MyButtons;
