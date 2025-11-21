import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  // Mock login state - set to false as per requirements (buttons disabled/hidden)
  const isLoggedIn = false; 

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              Meus Botões Web
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button variant="ghost" asChild>
              <Link to="/meus-botoes">Meus Botões</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/cadastro">Cadastre-se</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
