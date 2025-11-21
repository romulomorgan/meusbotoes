import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Check, Loader2 } from "lucide-react";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RenewalNotices = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    fetchExpiringUsers();
  }, []);

  const fetchExpiringUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/renewals`);
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch expiring users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async (user) => {
    if (!user.phone) {
      toast.error("Usuário sem telefone cadastrado.");
      return;
    }

    setSendingId(user.id);
    
    // Format phone (remove non-digits)
    const phone = user.phone.replace(/\D/g, '');
    const message = encodeURIComponent("Olá! Seu plano do Meus Botões Web expira em 7 dias. Caso deseje renovar, basta enviar o comprovante via PIX.");
    const url = `https://wa.me/${phone}?text=${message}`;
    
    // Open WhatsApp
    window.open(url, '_blank');

    // Mark as sent in backend
    try {
      await axios.post(`${API}/admin/renewals/${user.id}/mark-sent`);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, renewal_notice_sent_at: new Date().toISOString() } 
          : u
      ));
      toast.success("Status atualizado!");
    } catch (error) {
      console.error("Failed to mark as sent", error);
    } finally {
      setSendingId(null);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Avisos de Renovação</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Planos Expirando em 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum usuário próximo do vencimento.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const daysLeft = differenceInDays(new Date(user.plan_expires_at), new Date());
                  const isSent = !!user.renewal_notice_sent_at;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(user.plan_expires_at), "dd/MM/yyyy", { locale: ptBR })}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {daysLeft} dias
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isSent ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Enviado</Badge>
                        ) : (
                          <Badge variant="secondary">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleSendWhatsApp(user)}
                          disabled={sendingId === user.id}
                        >
                          {sendingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RenewalNotices;
