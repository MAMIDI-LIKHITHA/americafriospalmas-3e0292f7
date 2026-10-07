import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";

import type { GoTrueClient } from "@supabase/auth-js";
import { supabase } from "@/integrations/supabase/client";

const auth = supabase.auth as unknown as GoTrueClient;
import { maskBrPhone, normalizeBrPhone } from "@/lib/phone";

const RESEND_SECONDS = 60;

function otpErrorMessage(message: string, phase: "send" | "verify"): string {
  const m = message.toLowerCase();
  if (phase === "verify") {
    if (m.includes("expired")) return "O código expirou. Solicite um novo código.";
    if (m.includes("invalid") || m.includes("token")) return "Código inválido. Tente novamente.";
    return "Não foi possível confirmar o código. Tente novamente.";
  }
  if (m.includes("rate") || m.includes("seconds")) return "Aguarde alguns segundos antes de pedir um novo código.";
  if (m.includes("invalid phone") || m.includes("phone number")) return "Digite um número de WhatsApp válido.";
  return "Não foi possível enviar o código. Tente novamente.";
}

export function PhoneOtpLogin({
  title = "Entrar na sua conta",
  subtitle = "Acompanhe seus pedidos como em um app de delivery.",
  onSuccess,
}: {
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [e164, setE164] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function sendCode(target: string) {
    setLoading(true);
    setError("");
    try {
      const { error: err } = await auth.signInWithOtp({ phone: target, options: { channel: "sms" } });
      if (err) {
        setError(otpErrorMessage(err.message, "send"));
        return false;
      }
      setSeconds(RESEND_SECONDS);
      return true;
    } catch {
      setError("Não foi possível enviar o código. Verifique sua conexão e tente novamente.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeBrPhone(phone);
    if (!normalized) {
      setError("Digite um número de WhatsApp válido.");
      return;
    }
    setE164(normalized);
    if (await sendCode(normalized)) {
      setCode("");
      setStep("code");
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Digite os 6 dígitos do código.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: err } = await auth.verifyOtp({ phone: e164, token: code, type: "sms" });
      if (err) {
        setError(otpErrorMessage(err.message, "verify"));
        return;
      }
      onSuccess?.();
    } catch {
      setError("Não foi possível confirmar o código. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-surface w-full max-w-md p-6 md:p-8">
      <div className="flex items-center gap-3">
        <MessageSquareText className="h-7 w-7 text-primary" />
        <div>
          <h2 className="font-display text-2xl font-bold">{step === "phone" ? title : "Digite o código enviado"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "phone" ? subtitle : `Enviamos um código de 6 dígitos para +55 ${maskBrPhone(e164.slice(3))}.`}
          </p>
        </div>
      </div>

      {step === "phone" ? (
        <form onSubmit={requestCode} className="mt-6" noValidate>
          <label className="block text-sm font-semibold" htmlFor="otp-phone">Número de WhatsApp</label>
          <div className="mt-1.5 flex items-stretch gap-2">
            <span className="input-field flex w-auto items-center px-3 font-semibold text-muted-foreground">+55</span>
            <input
              id="otp-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(63) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(maskBrPhone(e.target.value))}
              className="input-field flex-1"
            />
          </div>
          {error && <p role="alert" className="mt-3 text-sm font-semibold text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="btn-base btn-brand mt-5 w-full disabled:opacity-60">
            {loading ? "Enviando…" : "Receber código"}
          </button>
        </form>
      ) : (
        <form onSubmit={confirmCode} className="mt-6" noValidate>
          <label className="block text-sm font-semibold" htmlFor="otp-code">Código</label>
          <input
            id="otp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="input-field mt-1.5 text-center text-2xl tracking-[0.5em]"
            placeholder="••••••"
          />
          {error && <p role="alert" className="mt-3 text-sm font-semibold text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="btn-base btn-brand mt-5 w-full disabled:opacity-60">
            {loading ? "Confirmando…" : "Confirmar código"}
          </button>
          <div className="mt-4 flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setStep("phone"); setError(""); }} className="font-semibold text-muted-foreground hover:text-primary">
              Trocar número
            </button>
            <button
              type="button"
              disabled={seconds > 0 || loading}
              onClick={() => sendCode(e164)}
              className="font-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {seconds > 0 ? `Reenviar código em ${seconds}s` : "Reenviar código"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
