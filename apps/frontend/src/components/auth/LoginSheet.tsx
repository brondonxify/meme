"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn, Mail, Lock } from "lucide-react";
import Link from "next/link";

interface LoginSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginSheet({ isOpen, onClose, onSuccess }: LoginSheetProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[450px] flex flex-col">
        <SheetHeader className="mb-8">
          <SheetTitle className={cn(integralCF.className, "text-3xl font-black uppercase text-black")}>
            HI-<span className="text-[#FF9900]">TECH</span> LOGIN
          </SheetTitle>
          <SheetDescription className="text-black/60">
            Sign in to access your saved shipping addresses and speed up your checkout.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40 px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 pl-12 rounded-2xl border-black/5 bg-black/5 focus:bg-white focus:ring-2 focus:ring-[#FF9900] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40 px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 pl-12 rounded-2xl border-black/5 bg-black/5 focus:bg-white focus:ring-2 focus:ring-[#FF9900] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-black/90 text-white rounded-full h-16 text-lg font-bold shadow-xl shadow-black/10 transition-all disabled:opacity-50"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {isSubmitting ? "Authenticating..." : "Login to my account"}
            </Button>

            <p className="text-center text-xs text-black/40 mt-8">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-black font-bold hover:text-[#FF9900] transition-colors underline underline-offset-4">
                Join HI-TECH
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-auto pt-10 text-center">
          <p className="text-[10px] text-black/20 font-bold uppercase tracking-tighter">
            Secure SSL Encrypted Connection
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
