import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, MousePointer2, Layers } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalButtons: 0,
    totalClicks: 0,
    categories: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [buttonsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/buttons/`),
        axios.get(`${API}/categories/`)
      ]);
      
      const buttons = buttonsRes.data;
      const totalClicks = buttons.reduce((acc, btn) => acc + (btn.click_count || 0), 0);
      
      setStats({
        totalButtons: buttons.length,
        totalClicks: totalClicks,
        categories: categoriesRes.data.length
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.full_name?.split(' ')[0]}!</h1>
        <Button asChild>
          <Link to="/meus-botoes">
            <Plus className="mr-2 h-4 w-4" /> Novo Botão
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Botões</CardTitle>
            <MousePointer2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalButtons}</div>
            <p className="text-xs text-muted-foreground">
              Botões ativos na sua conta
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques Totais</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              Acessos nos seus botões
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              Categorias criadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plano Atual</span>
                <span className="text-sm text-muted-foreground">
                  {user?.current_plan_id ? "Ativo" : "Gratuito"}
                </span>
              </div>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/meus-planos">Gerenciar Assinatura</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
