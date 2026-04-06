"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { paymentService } from "@/services/payment.service";
import { ordersService } from "@/services/orders.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";

export default function PaymentPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");

    const { data: order } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => ordersService.getById(Number(orderId)),
    });

    const paymentMutation = useMutation({
        mutationFn: () => paymentService.processPayment(Number(orderId), { cardName, cardNumber, expiry, cvc }),
        onSuccess: async () => {
            clearCart();
            // Update local status mock
            await ordersService.updateStatus(Number(orderId), 'shipped');
            router.push(`/delivery/${orderId}`);
        }
    });

    return (
        <div className="bg-slate-950 min-h-screen py-12 flex items-center justify-center">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 backdrop-blur">
                <CardHeader className="text-center pb-8">
                    <div className="mx-auto w-12 h-12 bg-orange-600/10 rounded-full flex items-center justify-center mb-4">
                        <CreditCard className="h-6 w-6 text-orange-500" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Secure <span className="text-orange-500">Gateway</span></CardTitle>
                    <p className="text-slate-500 text-xs mt-1">Acquiring credentials for transaction ID: #{orderId}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-slate-500">Cardholder Name</Label>
                        <Input
                            placeholder="NEURAL LINK OWNER"
                            className="bg-slate-950 border-slate-800"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-slate-500">Neural Card Number</Label>
                        <Input
                            placeholder="0000 0000 0000 0000"
                            className="bg-slate-950 border-slate-800 font-mono"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Expiry</Label>
                            <Input
                                placeholder="MM/YY"
                                className="bg-slate-950 border-slate-800"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">CVC</Label>
                            <Input
                                placeholder="000"
                                type="password"
                                className="bg-slate-950 border-slate-800"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 mt-4">
                    <Button
                        className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-black tracking-widest group"
                        onClick={() => paymentMutation.mutate()}
                        disabled={paymentMutation.isPending}
                    >
                        {paymentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "EXECUTE PAYMENT"}
                        {!paymentMutation.isPending && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono tracking-tighter">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        QUANTUM-SAFE ENCRYPTION HANDSHAKE ESTABLISHED
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
