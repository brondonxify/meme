"use client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { customersService } from "@/services/customers.service";
import { addressService, ShippingAddress } from "@/services/address.service";
import { Plus, MapPin, Phone, User, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

export default function AccountPage() {
  const { user, logout, isLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [isAddrOpen, setIsAddrOpen] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
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
    if (!isLoading && !user) router.push("/auth/login");
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      });
      fetchAddresses();
    }
  }, [user, isLoading, router]);

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="py-20 text-center">Loading profile...</div>;
  if (!user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    try {
      await customersService.updateProfile(formData);
      await refreshUser();
      setIsEditing(false);
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrLoading(true);
    try {
      await addressService.createAddress(newAddr);
      await fetchAddresses();
      setIsAddrOpen(false);
      setNewAddr({
        label: "",
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: user?.phone || "",
        address_line: "",
        city: "",
        postal_code: "",
        is_default: false
      });
    } catch (e) {
      console.error(e);
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await addressService.deleteAddress(id);
      await fetchAddresses();
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <main className="max-w-frame mx-auto px-4 py-10 mt-10">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="border border-black/10 rounded-2xl p-6 shadow-sm bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </h2>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-[#FF9900] hover:text-[#E68A00]">
                  Edit Details
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
                {errorMsg && <div className="col-span-2 text-red-500 text-sm bg-red-50 p-3 rounded">{errorMsg}</div>}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black/40 uppercase">First Name</label>
                  <Input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required className="rounded-xl border-black/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black/40 uppercase">Last Name</label>
                  <Input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required className="rounded-xl border-black/10" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-black/40 uppercase">Phone Number</label>
                  <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl border-black/10" />
                </div>
                <div className="flex space-x-3 pt-4 col-span-2">
                  <Button type="submit" disabled={isSaving} className="bg-black text-white px-8 rounded-full h-12">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-full h-12">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-black/40 uppercase mb-1">Full Name</p>
                  <p className="font-bold">{user.first_name} {user.last_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/40 uppercase mb-1">Email Address</p>
                  <p className="font-bold">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/40 uppercase mb-1">Phone Number</p>
                  <p className="font-bold">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Addresses Section */}
          <div className="border border-black/10 rounded-2xl p-6 shadow-sm bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Information
              </h2>
              <Sheet open={isAddrOpen} onOpenChange={setIsAddrOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#FF9900] text-[#FF9900] hover:bg-[#FF9900]/5 rounded-full"
                    onClick={() => setNewAddr({...newAddr, first_name: user.first_name, last_name: user.last_name, phone: user.phone || ""})}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add New
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-[500px]">
                  <SheetHeader>
                    <SheetTitle>Add Shipping Address</SheetTitle>
                    <SheetDescription>Enter the address where you'd like to receive your high-tech gear.</SheetDescription>
                  </SheetHeader>
                  <form onSubmit={handleAddAddress} className="mt-8 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-black/40 uppercase">Address Label (e.g. Home, Office)</label>
                      <Input placeholder="Home" value={newAddr.label} onChange={e => setNewAddr({...newAddr, label: e.target.value})} required className="rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-black/40 uppercase">First Name</label>
                        <Input value={newAddr.first_name} onChange={e => setNewAddr({...newAddr, first_name: e.target.value})} required className="rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-black/40 uppercase">Last Name</label>
                        <Input value={newAddr.last_name} onChange={e => setNewAddr({...newAddr, last_name: e.target.value})} required className="rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-black/40 uppercase">Phone Number</label>
                      <Input value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} required className="rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-black/40 uppercase">Street Address</label>
                      <Input value={newAddr.address_line} onChange={e => setNewAddr({...newAddr, address_line: e.target.value})} required className="rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-black/40 uppercase">City</label>
                        <Input value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} required className="rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-black/40 uppercase">Postal Code</label>
                        <Input value={newAddr.postal_code} onChange={e => setNewAddr({...newAddr, postal_code: e.target.value})} className="rounded-xl" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                       <input 
                         type="checkbox" 
                         id="is_default" 
                         checked={newAddr.is_default} 
                         onChange={e => setNewAddr({...newAddr, is_default: e.target.checked})}
                         className="w-4 h-4 rounded border-gray-300 text-[#FF9900] focus:ring-[#FF9900]"
                       />
                       <label htmlFor="is_default" className="text-sm text-black/60">Set as default address</label>
                    </div>
                    <Button type="submit" disabled={addrLoading} className="w-full bg-[#FF9900] hover:bg-[#E68A00] h-14 rounded-full font-bold mt-4">
                      {addrLoading ? "Saving..." : "Save Address"}
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.length === 0 ? (
                <div className="col-span-2 py-8 text-center border-2 border-dashed border-black/5 rounded-2xl">
                  <p className="text-black/40 italic">No shipping addresses saved yet.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="border border-black/10 rounded-2xl p-4 relative group hover:border-[#FF9900]/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded">
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <span className="text-[10px] font-bold uppercase border border-[#FF9900] text-[#FF9900] px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm">{addr.first_name} {addr.last_name}</p>
                    <p className="text-sm text-black/60 mt-1">{addr.address_line}</p>
                    <p className="text-sm text-black/60">{addr.city}{addr.postal_code ? `, ${addr.postal_code}` : ''}</p>
                    <div className="flex items-center mt-3 text-xs text-black/40">
                      <Phone className="w-3 h-3 mr-1" />
                      {addr.phone}
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="absolute bottom-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border border-black/10 rounded-2xl p-6 flex flex-col space-y-4 shadow-sm bg-white h-fit">
            <Button asChild className="w-full bg-black rounded-full h-14 font-bold tracking-wide">
              <Link href="/account/orders">My Orders</Link>
            </Button>
            <Button variant="outline" className="w-full rounded-full h-14 border-black/10 font-bold text-black/60 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
