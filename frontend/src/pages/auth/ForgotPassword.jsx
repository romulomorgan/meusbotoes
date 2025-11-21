import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [debugCode, setDebugCode] = useState(""); // For prototype only

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassword = watch("newPassword");

  const onSendCode = async (data) => {
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await axios.post(`${API}/auth/forgot-password`, { email: data.email });
      setEmail(data.email);
      setMessage(res.data.message);
      if (res.data.debug_code) {
        setDebugCode(res.data.debug_code);
      }
      setStep(2);
    } catch (err) {
      setError("Erro ao enviar código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      await axios.post(`${API}/auth/reset-password`, {
        email: email,
        code: data.code,
        new_password: data.newPassword,
        confirm_new_password: data.confirmNewPassword
      });
      setMessage("Senha alterada com sucesso! Redirecionando para login...");
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao redefinir senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
          <CardDescription>
            {step === 1 ? "Digite seu e-mail para receber o código" : "Digite o código e sua nova senha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleSubmit(onSendCode)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  {...register("email", { required: "E-mail é obrigatório" })} 
                />
                {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Código"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onResetPassword)} className="space-y-4">
              {debugCode && (
                <div className="p-2 bg-yellow-100 text-yellow-800 text-xs rounded mb-2">
                  PROTOTYPE DEBUG: Seu código é <strong>{debugCode}</strong>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Código de Verificação</Label>
                <Input 
                  id="code" 
                  {...register("code", { required: "Código é obrigatório" })} 
                />
                {errors.code && <span className="text-sm text-destructive">{errors.code.message}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  {...register("newPassword", { required: "Nova senha é obrigatória", minLength: { value: 6, message: "Mínimo 6 caracteres" } })} 
                />
                {errors.newPassword && <span className="text-sm text-destructive">{errors.newPassword.message}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                <Input 
                  id="confirmNewPassword" 
                  type="password" 
                  {...register("confirmNewPassword", { 
                    required: "Confirmação é obrigatória",
                    validate: value => value === newPassword || "As senhas não coincidem"
                  })} 
                />
                {errors.confirmNewPassword && <span className="text-sm text-destructive">{errors.confirmNewPassword.message}</span>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Redefinir Senha"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
            Voltar para Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
