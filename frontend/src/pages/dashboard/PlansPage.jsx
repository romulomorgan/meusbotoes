import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/plans/`);
      const sortedPlans = response.data.sort((a, b) => a.price - b.price);
      setPlans(sortedPlans);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan) => {
    if (plan.price === 0) {
      // Free plan logic (direct subscribe)
      // ... existing logic for free plan ...
      // For now, let's just redirect free plan to payment page too or handle directly?
      // Requirement says "Payment via PIX". Free plan shouldn't need PIX.
      // Let's assume free plan is auto-active or handled differently.
      // For simplicity in this phase, let's treat all upgrades as needing "payment" flow or direct activation if price is 0.
      if (plan.price === 0) {
         // Direct activation logic (reuse previous phase logic if needed, or just alert)
         alert("Planos gratuitos são ativados automaticamente (Simulação).");
      } else {
        navigate('/pagamento', { state: { plan } });
      }
    } else {
      navigate('/pagamento', { state: { plan } });
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
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan}
                  onClick={() => handleSubscribe(plan)}
                >
                  {isCurrentPlan ? "Plano Atual" : "Assinar Agora"}
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
