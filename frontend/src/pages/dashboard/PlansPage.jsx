import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { useToast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState(null);
  const { user, fetchUser } = useAuth(); // Assuming fetchUser is exposed to refresh user state

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/plans/`);
      // Sort by price
      const sortedPlans = response.data.sort((a, b) => a.price - b.price);
      setPlans(sortedPlans);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setSubscribingId(planId);
    try {
      await axios.post(`${API}/plans/subscribe/${planId}`);
      // Refresh user context to update current plan
      // We need to reload the page or update context. 
      // For now, let's assume context update or simple alert.
      window.location.reload(); // Simple way to refresh user state if context doesn't auto-update
    } catch (error) {
      console.error("Failed to subscribe", error);
    } finally {
      setSubscribingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Escolha seu Plano</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Desbloqueie mais botões e recursos exclusivos para sua experiência.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrentPlan = user?.current_plan_id === plan.id;
          
          return (
            <Card key={plan.id} className={`flex flex-col ${isCurrentPlan ? 'border-primary shadow-lg scale-105' : ''}`}>
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    {plan.button_limit === -1 ? 'Botões Ilimitados' : `${plan.button_limit} Botões`}
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    Suporte Básico
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    Acesso ao App
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan || subscribingId === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {subscribingId === plan.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    "Plano Atual"
                  ) : (
                    "Assinar Agora"
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlansPage;
