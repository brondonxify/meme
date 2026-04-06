"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { TbBasketExclamation } from "react-icons/tb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ordersService } from "@/services/orders.service";
import { paymentsService } from "@/services/payments.service";
import { useAuth } from "@/contexts/auth-context";
import { addressService, ShippingAddress } from "@/services/address.service";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, CheckCircle2, UserCircle2 } from "lucide-react";
import LoginSheet from "@/components/auth/LoginSheet";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const adjustedTotalPrice = useCartStore((state) => state.adjustedTotalPrice);
  const coupon = useCartStore((state) => state.coupon);
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuth();

  const finalTotal = Math.max(0, adjustedTotalPrice - (coupon ? coupon.discount_amount : 0));

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'om' | 'mtn' | 'cash'>('om');
  const [paymentError, setPaymentError] = useState('');
  
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [isAddrOpen, setIsAddrOpen] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newAddr, setNewAddr] = useState({
    label: "",
    first_name: "",
    last_name: "",
    phone: "",
    address_line: "",
    city: "",
    postal_code: "",
    is_default: false
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) {
          if (selectedAddressId === "new") {
              setSelectedAddressId(defaultAddr.id.toString());
              applyAddress(defaultAddr);
          }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const applyAddress = (addr: ShippingAddress) => {
    setFormData(prev => ({
      ...prev,
      firstName: addr.first_name,
      lastName: addr.last_name,
      phone: addr.phone,
      address: addr.address_line,
      city: addr.city
    }));
  };

  const handleAddressChange = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
        // ...
    } else {
      const addr = addresses.find(a => a.id.toString() === id);
      if (addr) applyAddress(addr);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <div className="flex items-center flex-col text-gray-300 mt-32">
            <TbBasketExclamation strokeWidth={1} className="text-6xl" />
            <span className="block mb-4">Your cart is empty.</span>
            <Button className="rounded-full w-24" asChild>
              <Link href="/shop">Shop</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsProcessing(true);
    setPaymentError('');

    try {
      const orderItems = cart.items.map(item => ({
        article_id: Number(item.id),
        quantity: Number(item.quantity),
        unit_price: Number(item.price)
      }));

      const order = await ordersService.create({
        customer_id: user?.id ? Number(user.id) : undefined,
        coupon_code: coupon ? coupon.code : undefined,
        items: orderItems,
        shipping_cost: 0,
        payment_method: paymentMethod
      });

      if (paymentMethod !== 'cash') {
        const payment = await paymentsService.initiate({
          order_id: Number(order.id),
          method: paymentMethod,
          phone: formData.phone.replace(/\D/g, ''),
          amount: Number(finalTotal)
        });

        if (payment.status === 'failed') {
          setPaymentError("Payment failed (Demo). Order placed but unpaid.");
        }
      }

      clearCart();
      setIsProcessing(false);
      router.push(`/checkout/confirmation/${order.id}`);
      
    } catch (error: any) {
      console.error(error);
      setPaymentError(error.message || "Failed to create order");
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrLoading(true);
    try {
      const addr = await addressService.createAddress(newAddr);
      const updated = await addressService.getAddresses();
      setAddresses(updated);
      setSelectedAddressId(addr.id.toString());
      applyAddress(addr);
      setIsAddrOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setAddrLoading(false);
    }
  };

  const inputClass = (field: string) =>
    cn(
      "w-full h-12 px-4 rounded-xl border bg-[#F0F0F0] text-sm placeholder:text-black/40 outline-none focus:ring-1 focus:ring-[#FF9900] transition-all",
      errors[field] ? "border-red-500" : "border-black/5"
    );

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <h2 className={cn(integralCF.className, "font-bold text-[32px] md:text-[40px] text-black uppercase mb-8")}>
          Checkout
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row lg:space-x-8 items-start">
            <div className="w-full lg:flex-1 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-black flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#FF9900]" />
                    Shipping Information
                </h3>
                
                {user ? (
                    <div className="flex items-center space-x-2">
                        <Select value={selectedAddressId} onValueChange={handleAddressChange}>
                            <SelectTrigger className="w-full sm:w-[240px] h-10 rounded-full border-black/10 bg-white">
                                <SelectValue placeholder="Select address" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">Manual Entry</SelectItem>
                                {addresses.map(addr => (
                                    <SelectItem key={addr.id} value={addr.id.toString()}>
                                        {addr.label} ({addr.city})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Sheet open={isAddrOpen} onOpenChange={setIsAddrOpen}>
                            <SheetTrigger asChild>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    size="icon" 
                                    className="rounded-full border-black/10 hover:bg-[#FF9900]/5 hover:text-[#FF9900]"
                                    onClick={() => setNewAddr({
                                        label: "",
                                        first_name: user.first_name,
                                        last_name: user.last_name,
                                        phone: user.phone || "",
                                        address_line: "",
                                        city: "",
                                        postal_code: "",
                                        is_default: false
                                    })}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-[450px]">
                                <SheetHeader>
                                    <SheetTitle>Add New Address</SheetTitle>
                                    <SheetDescription>Fill in the details for your new shipping destination.</SheetDescription>
                                </SheetHeader>
                                <div className="mt-8 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-black/40 uppercase">Label</label>
                                        <Input placeholder="Work, Friends, etc." value={newAddr.label} onChange={e => setNewAddr({...newAddr, label: e.target.value})} className="rounded-xl" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-black/40 uppercase">First Name</label>
                                            <Input value={newAddr.first_name} onChange={e => setNewAddr({...newAddr, first_name: e.target.value})} className="rounded-xl" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-black/40 uppercase">Last Name</label>
                                            <Input value={newAddr.last_name} onChange={e => setNewAddr({...newAddr, last_name: e.target.value})} className="rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-black/40 uppercase">Phone</label>
                                        <Input value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} className="rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-black/40 uppercase">Address</label>
                                        <Input value={newAddr.address_line} onChange={e => setNewAddr({...newAddr, address_line: e.target.value})} className="rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-black/40 uppercase">City</label>
                                        <Input value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} className="rounded-xl" />
                                    </div>
                                    <Button onClick={handleAddAddress} disabled={addrLoading} className="w-full bg-[#FF9900] rounded-full h-12 font-bold mt-4">
                                        {addrLoading ? "Saving..." : "Add & Select Address"}
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsLoginOpen(true)}
                      className="rounded-full border-black/10 text-xs font-bold uppercase tracking-wider h-10 px-6 hover:bg-[#FF9900]/5 hover:border-[#FF9900] hover:text-[#FF9900] transition-all"
                    >
                      <UserCircle2 className="w-4 h-4 mr-2" />
                      Sign in for saved addresses
                    </Button>
                )}
              </div>

              <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300", selectedAddressId !== "new" && "opacity-60 pointer-events-none grayscale-[0.5]")}>
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClass("firstName")}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClass("lastName")}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                <div className="col-span-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass("email")}
                    disabled={!!user}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="col-span-2">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass("phone")}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClass("address")}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass("city")}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
              </div>
              
              <div>
                <textarea
                  name="notes"
                  placeholder="Order notes (optional)"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className={cn(inputClass("notes"), "resize-none h-auto py-3")}
                />
              </div>

              <div className="pt-8 border-t border-black/10">
                <h3 className="text-xl font-bold text-black mb-6">Payment Method</h3>
                {paymentError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{paymentError}</div>
                )}
                <div className="grid gap-3">
                  {[
                    { id: 'om', label: 'Orange Money', icon: '/images/om-logo.png' },
                    { id: 'mtn', label: 'MTN Mobile Money', icon: '/images/mtn-logo.png' },
                    { id: 'cash', label: 'Cash on Delivery', icon: null }
                  ].map((method) => (
                    <label 
                      key={method.id} 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all",
                        paymentMethod === method.id ? "border-[#FF9900] bg-[#FF9900]/5 ring-1 ring-[#FF9900]" : "border-black/5 hover:border-black/10"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          paymentMethod === method.id ? "border-[#FF9900]" : "border-black/20"
                        )}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />}
                        </div>
                        <span className="font-bold">{method.label}</span>
                      </div>
                      <input 
                        type="radio" 
                        name="payment" 
                        className="hidden"
                        checked={paymentMethod === method.id} 
                        onChange={() => setPaymentMethod(method.id as any)} 
                      />
                      {paymentMethod === method.id && <CheckCircle2 className="w-5 h-5 text-[#FF9900]" />}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:max-w-[440px] mt-8 lg:mt-0 p-6 rounded-[24px] border border-black/5 bg-white shadow-sm sticky top-24">
              <h3 className="text-xl font-bold text-black mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.attributes.join("-")}`} className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.srcUrl || "/images/placeholder.png"}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[#F0EEED] border border-black/5"
                      />
                      <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">{item.name}</p>
                      <p className="text-[10px] text-black/40 font-semibold uppercase tracking-wider">{item.attributes.join(" • ")}</p>
                    </div>
                    <span className="text-sm font-bold text-black uppercase">
                      {(item.price * item.quantity).toLocaleString()} XAF
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 py-6 border-y border-black/5">
                <div className="flex justify-between text-sm">
                  <span className="text-black/60 font-medium">Subtotal</span>
                  <span className="font-bold">{totalPrice.toLocaleString()} XAF</span>
                </div>
                {totalPrice !== adjustedTotalPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60 font-medium">
                      Item Discount
                    </span>
                    <span className="font-bold text-red-500">
                      -{(totalPrice - adjustedTotalPrice).toLocaleString()} XAF
                    </span>
                  </div>
                )}
                {coupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60 font-medium">
                      Promo ({coupon.code})
                    </span>
                    <span className="font-bold text-red-500">
                      -{Math.round(coupon.discount_amount).toLocaleString()} XAF
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-black/60 font-medium">Shipping</span>
                  <span className="font-bold text-black">FREE</span>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flex justify-between mb-6">
                  <span className="text-xl font-bold text-black">Total</span>
                  <span className="text-xl font-bold text-[#FF9900] uppercase">{finalTotal.toLocaleString()} XAF</span>
                </div>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-black hover:bg-black/90 text-white rounded-full h-16 text-lg font-bold shadow-xl shadow-black/10 transition-all disabled:opacity-50"
                >
                  {isProcessing ? "Processing Order..." : `Complete Purchase`}
                </Button>
                <p className="text-center text-[10px] text-black/40 mt-4 px-4 leading-relaxed uppercase tracking-tighter">
                  By clicking "Complete Purchase", you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <LoginSheet 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={() => {}}
      />
    </main>
  );
}
