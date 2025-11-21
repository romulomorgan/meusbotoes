import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Smartphone } from "lucide-react";

const AppButton = ({ button, onEdit, onDelete, onShowInstructions }) => {
  const handleOpenLink = () => {
    window.open(button.original_url, '_blank', 'noopener,noreferrer');
  };

  const getIconUrl = (url) => {
    if (url && url.startsWith('/static')) {
      return `${process.env.REACT_APP_BACKEND_URL}${url}`;
    }
    return url;
  };

  return (
    <div className="group relative flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
      {/* Action Buttons (Visible on Hover) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 bg-background/80 backdrop-blur shadow-sm hover:bg-primary/10 hover:text-primary"
          onClick={(e) => { e.stopPropagation(); onShowInstructions(); }}
          title="Instalar no celular"
        >
          <Smartphone className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 bg-background/80 backdrop-blur shadow-sm hover:bg-background"
          onClick={(e) => { e.stopPropagation(); onEdit(button); }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 bg-background/80 backdrop-blur shadow-sm hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(button); }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Main Clickable Area */}
      <button 
        onClick={handleOpenLink}
        className="flex flex-col items-center gap-3 w-full focus:outline-none"
      >
        {/* App Icon */}
        <div className="relative w-20 h-20 rounded-2xl shadow-sm border bg-background overflow-hidden group-hover:scale-105 transition-transform duration-300 group-hover:shadow-md">
          <img 
            src={getIconUrl(button.icon_url)} 
            alt={button.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://via.placeholder.com/128?text=?"; }}
          />
        </div>
        
        {/* App Name */}
        <span className="text-sm font-medium text-center line-clamp-2 leading-tight max-w-[100px]">
          {button.title}
        </span>
      </button>
    </div>
  );
};

export default AppButton;
