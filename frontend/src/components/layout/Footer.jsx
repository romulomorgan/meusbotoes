import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-8">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2024 Meus Botões Web. Todos os direitos reservados.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/termos" className="hover:underline hover:text-foreground transition-colors">
            Termos de uso
          </Link>
          <Link to="/privacidade" className="hover:underline hover:text-foreground transition-colors">
            Política de privacidade
          </Link>
          <Link to="/contato" className="hover:underline hover:text-foreground transition-colors">
            Contato
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
