import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyPlanPage = () => {
  const [planDetails, setPlanDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPlan();
  }, []);

  const fetchMyPlan = async () => {
    try {
      const response = await axios.get(`${API}/plans/my-plan`);
      setPlanDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch plan details", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { plan, usage, expires_at } = planDetails;
  const limit = plan ? plan.button_limit : 0;
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((usage / limit) * 100, 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Plano</h1>
        <p className="text-muted-foreground">Gerencie sua assinatura e limites.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{plan ? plan.name : "Nenhum Plano Ativo"}</div>
            {plan && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {plan.price === 0 ? 'Gratuito' : `R$ ${plan.price.toFixed(2)}/mês`}
                </Badge>
                {expires_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Expira em {format(new Date(expires_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso de Botões</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${percentage >= 90 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {usage} <span className="text-muted-foreground text-sm font-normal">/ {isUnlimited ? '∞' : limit}</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {isUnlimited 
                ? "Você tem botões ilimitados!" 
                : `${limit - usage} botões restantes neste mês.`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA */}
      {!isUnlimited && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Precisa de mais botões?</h3>
              <p className="text-sm text-muted-foreground">
                Faça upgrade para o plano Ilimitado e crie quantos botões quiser.
              </p>
            </div>
            <Button asChild>
              <a href="/planos">Ver Planos</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyPlanPage;
