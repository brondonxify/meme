import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full bg-[#131921] text-white">
            <div className="bg-[#232f3e]">
                <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="font-serif text-3xl font-black tracking-tighter text-white">
                            HI<span className="text-[#ff9900]">-TECH.</span>
                        </span>
                        <p className="mt-4 text-slate-300 max-w-sm leading-relaxed text-sm">
                            High-performance gear, everyday low prices. We are committed to providing the best tech products directly to your doorstep.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-lg">Make Money with Us</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li><Link href="/" className="hover:underline">Sell products</Link></li>
                            <li><Link href="/" className="hover:underline">Sell on HI-TECH Business</Link></li>
                            <li><Link href="/" className="hover:underline">About Our Company</Link></li>
                            <li><Link href="/" className="hover:underline">Our Services</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-lg">Let Us Help You</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li><Link href="/account" className="hover:underline">Your Account</Link></li>
                            <li><Link href="/account" className="hover:underline">Your Orders</Link></li>
                            <li><Link href="/" className="hover:underline">Shipping Rates & Policies</Link></li>
                            <li><Link href="/" className="hover:underline">Returns & Replacements</Link></li>
                            <li><Link href="/" className="hover:underline">Help</Link></li>
                        </ul>
                    </div>
                </div>
            </div>


            <div className="bg-[#131921] py-8 border-t border-[#3a4553] text-center">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-6 text-xs text-slate-300 font-medium">
                    <Link href="/conditions" className="hover:underline hover:text-white transition-colors">Conditions of Use</Link>
                    <Link href="/privacy" className="hover:underline hover:text-white transition-colors">Privacy Notice</Link>
                    <Link href="/ads" className="hover:underline hover:text-white transition-colors">Consumer Health Data Privacy Disclosure</Link>
                    <span className="text-slate-400">© {new Date().getFullYear()} , HI-TECH.com, Inc. or its affiliates</span>
                </div>
            </div>
        </footer>
    );
}
