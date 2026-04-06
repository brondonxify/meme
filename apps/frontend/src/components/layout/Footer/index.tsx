import Link from "next/link";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { Twitter, Instagram, Facebook, Youtube, Github, Mail, ShieldCheck, Truck, Headphones } from "lucide-react";

const Footer = () => {
    return (
        <footer className="w-full bg-[#000000] text-white pt-20 pb-10 border-t border-white/5">
            <div className="max-w-frame mx-auto px-4">
                {/* Benefits Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 border-b border-white/10 mb-16">
                    <div className="flex items-center space-x-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#ff9900]/30 transition-colors">
                        <div className="bg-[#ff9900]/10 p-3 rounded-xl">
                            <Truck className="w-6 h-6 text-[#ff9900]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Fast Delivery</h4>
                            <p className="text-sm text-white/40">Real-time tracking for every order.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#ff9900]/30 transition-colors">
                        <div className="bg-[#ff9900]/10 p-3 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-[#ff9900]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Secure Payments</h4>
                            <p className="text-sm text-white/40">256-bit SSL encrypted transactions.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#ff9900]/30 transition-colors">
                        <div className="bg-[#ff9900]/10 p-3 rounded-xl">
                            <Headphones className="w-6 h-6 text-[#ff9900]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Tech Support</h4>
                            <p className="text-sm text-white/40">Expert assistance 24/7 online.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className={cn(integralCF.className, "text-3xl font-black tracking-tighter text-white uppercase flex items-baseline")}>
                            HI<span className="text-[#ff9900] tracking-normal">-TECH</span>
                            <span className="w-1.5 h-1.5 bg-[#ff9900] ml-1 rounded-full" />
                        </Link>
                        <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                            The future of electronics at your fingertips. We source only the highest quality components for developers, gamers, and tech enthusiasts.
                        </p>
                        <div className="flex items-center space-x-4 pt-2">
                           {[Twitter, Instagram, Facebook, Youtube, Github].map((Icon, i) => (
                               <Link key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#ff9900] hover:border-[#ff9900] hover:scale-110 transition-all duration-300">
                                   <Icon className="w-4 h-4" />
                               </Link>
                           ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest text-[#ff9900] mb-6">Explore</h4>
                            <ul className="space-y-4 text-sm text-white/60">
                                <li><Link href="/shop" className="hover:text-white hover:translate-x-1 inline-block transition-all">Latest Products</Link></li>
                                <li><Link href="/shop" className="hover:text-white hover:translate-x-1 inline-block transition-all">Featured Tech</Link></li>
                                <li><Link href="/shop" className="hover:text-white hover:translate-x-1 inline-block transition-all">Accessories</Link></li>
                                <li><Link href="/shop" className="hover:text-white hover:translate-x-1 inline-block transition-all">Promotions</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest text-[#ff9900] mb-6">User Portal</h4>
                            <ul className="space-y-4 text-sm text-white/60">
                                <li><Link href="/account" className="hover:text-white hover:translate-x-1 inline-block transition-all">Profile Settings</Link></li>
                                <li><Link href="/account/orders" className="hover:text-white hover:translate-x-1 inline-block transition-all">Order Tracking</Link></li>
                                <li><Link href="/cart" className="hover:text-white hover:translate-x-1 inline-block transition-all">Shopping Cart</Link></li>
                                <li><Link href="/account" className="hover:text-white hover:translate-x-1 inline-block transition-all">Wholesale Portal</Link></li>
                            </ul>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-[#ff9900] mb-6">Newsletter</h4>
                            <p className="text-xs text-white/40 mb-4 leading-relaxed">Join 10k+ tech enthusiasts getting weekly updates.</p>
                            <div className="relative">
                                <Input 
                                    className="bg-white/5 border-white/10 rounded-full h-12 pl-4 pr-12 focus:ring-[#ff9900]"
                                    placeholder="your@email.com"
                                />
                                <button className="absolute right-1 top-1 bottom-1 px-4 bg-[#ff9900] text-black rounded-full hover:bg-[#E68A00] transition-colors">
                                    <Mail className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] text-white/20 font-medium uppercase tracking-widest">
                        © {new Date().getFullYear()} HI-TECH COMPONENTS GROUP. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-tighter text-white/40">
                        <Link href="/" className="hover:text-[#ff9900] transition-colors">Terms of Service</Link>
                        <Link href="/" className="hover:text-[#ff9900] transition-colors">Privacy Policy</Link>
                        <Link href="/" className="hover:text-[#ff9900] transition-colors">Cookies</Link>
                        <Link href="/" className="hover:text-[#ff9900] transition-colors">Legal notice</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Simple Internal Input for Footer
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input 
      {...props} 
      className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} 
    />
);

export default Footer;
