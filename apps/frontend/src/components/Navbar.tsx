"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";
import { articlesService } from "@/services/articles.service";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { isAuthenticated, isAdmin, logout } = useAuth();
    const { itemCount } = useCart();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isProductsPage = pathname === "/products";

    const { data: suggestions, isLoading: isSearching } = useQuery({
        queryKey: ["search-suggestions", searchQuery],
        queryFn: () => articlesService.getAll({ search: searchQuery, limit: 5 }),
        enabled: searchQuery.length > 2 && !isProductsPage,
    });

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <header className="w-full relative z-50">
            {/* Top Bar - Amazon style dark slate */}
            <div className="bg-[#131921] text-white py-2">
                <div className="container mx-auto flex items-center justify-between px-3 md:px-4 gap-4 md:gap-6">
                    {/* Logo using Serif Font */}
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <span className="font-serif text-[28px] md:text-3xl font-black tracking-tighter text-white hover:text-white border border-transparent hover:border-white px-2 py-1 -ml-2 rounded-sm transition-all">
                            HI<span className="text-[#ff9900]">-TECH</span>
                        </span>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 max-w-4xl relative">
                        <Popover open={isSearchOpen && searchQuery.length > 0} onOpenChange={setIsSearchOpen}>
                            <PopoverTrigger asChild>
                                <form onSubmit={handleSearch} className="flex flex-1 h-10 w-full rounded-md overflow-hidden ring-0 focus-within:ring-[3px] focus-[&:focus-within]:ring-[#ff9900]/50 transition-all">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className="bg-gray-100 text-gray-700 px-3 flex items-center justify-center border-r border-gray-300 text-sm hover:bg-gray-200 cursor-pointer p-0 h-full gap-1 rounded-l-md" onClick={(e) => e.stopPropagation()}>
                                                All <Menu className="w-3 h-3 ml-1" />
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-56 p-2 bg-white shadow-lg border border-gray-200">
                                            <div className="flex flex-col space-y-1">
                                                <div className="font-bold px-3 py-2 border-b border-gray-100">Departments</div>
                                                <button className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded" onClick={(e) => { e.preventDefault(); router.push('/products'); }}>Electronics</button>
                                                <button className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded" onClick={(e) => { e.preventDefault(); router.push('/products'); }}>Computers</button>
                                                <button className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded" onClick={(e) => { e.preventDefault(); router.push('/products'); }}>Smart Home</button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="search"
                                        placeholder="Search products..."
                                        className="h-full rounded-none border-none text-black bg-white focus-visible:ring-0 px-4 w-full"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (e.target.value.length > 0) setIsSearchOpen(true);
                                        }}
                                        onFocus={() => {
                                            if (searchQuery.length > 0) setIsSearchOpen(true);
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        className="h-full px-5 bg-[#febd69] hover:bg-[#f3a847] text-black transition-colors flex items-center justify-center cursor-pointer w-14"
                                    >
                                        <Search className="h-5 w-5" />
                                    </button>
                                </form>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 bg-white border border-slate-200 rounded-lg shadow-xl" align="start">
                                <Command className="bg-transparent border-none">
                                    <CommandList>
                                        {isSearching && (
                                            <div className="p-4 flex justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin text-[#ff9900]" />
                                            </div>
                                        )}
                                        <CommandEmpty className="py-4 text-center text-sm text-slate-500">No results found.</CommandEmpty>
                                        <CommandGroup heading="Suggestions" className="text-slate-500 font-medium bg-white pb-2">
                                            {suggestions?.data.map((item) => (
                                                <CommandItem
                                                    key={item.id}
                                                    onSelect={() => {
                                                        router.push(`/products?search=${item.name}`);
                                                        setIsSearchOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="cursor-pointer hover:bg-gray-100 flex items-center py-2 px-3 data-[selected='true']:bg-gray-100"
                                                >
                                                    <Search className="h-4 w-4 mr-3 text-slate-400" />
                                                    <span className="text-black">{item.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Right side Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
                        {/* Account Actions */}
                        {mounted && isAuthenticated ? (
                            <div className="flex items-center gap-1">
                                <button
                                    className="flex flex-col flex-shrink-0 items-start hover:border hover:border-white px-2 py-1 rounded-sm border border-transparent transition-all"
                                    onClick={() => router.push(isAdmin ? '/admin' : '/account')}
                                >
                                    <span className="text-[11px] leading-tight text-slate-300">Hello, {isAdmin ? 'Admin' : 'User'}</span>
                                    <span className="text-[14px] font-bold text-white flex items-center leading-tight">
                                        Account & Lists
                                    </span>
                                </button>
                                <button
                                    className="text-slate-300 hover:text-white transition-colors hover:border hover:border-white p-2 rounded-sm border border-transparent"
                                    onClick={handleLogout}
                                    title="Sign Out"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : mounted ? (
                            <button
                                className="flex flex-col items-start hover:border hover:border-white px-2 py-1 rounded-sm border border-transparent transition-all"
                                onClick={() => router.push('/')}
                            >
                                <span className="text-[11px] leading-tight text-slate-300">Hello, sign in</span>
                                <span className="text-[14px] font-bold text-white leading-tight">Account & Lists</span>
                            </button>
                        ) : (
                            <div className="w-24 h-10" />
                        )}

                        {/* Valid Amazon Cart style */}
                        <button
                            className="flex items-end hover:border hover:border-white px-2 py-1 rounded-sm border border-transparent transition-all"
                            onClick={() => router.push('/cart')}
                        >
                            <div className="relative flex flex-col items-center">
                                <span className="absolute -top-[8px] min-w-[20px] text-center text-[#ff9900] font-bold text-[16px] leading-[20px] z-20">
                                    {mounted ? itemCount : 0}
                                </span>
                                <ShoppingCart className="h-[34px] w-[38px] text-white relative z-10 -ml-1" strokeWidth={1.5} />
                            </div>
                            <span className="hidden sm:inline font-bold mt-auto mb-[2px] text-[14px] text-white">Cart</span>
                        </button>

                        <button
                            className="md:hidden text-white p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu className="h-7 w-7" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub Nav - Amazon style light slate navigation */}
            <div className="bg-[#232f3e] text-white">
                <div className="container mx-auto px-2 flex items-center h-10 overflow-x-auto no-scrollbar gap-2 text-[14px] font-medium">
                    <button 
                        className="flex items-center gap-1 font-bold whitespace-nowrap hover:border hover:border-white py-[6px] px-2 rounded-sm border border-transparent transition-all flex-shrink-0"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu className="h-[18px] w-[18px]" />
                        All
                    </button>
                    <Link href="/products" className="whitespace-nowrap hover:border hover:border-white py-[6px] px-2 rounded-sm border border-transparent transition-all flex-shrink-0">Today's Deals</Link>
                    <Link href="/products" className="whitespace-nowrap hover:border hover:border-white py-[6px] px-2 rounded-sm border border-transparent transition-all flex-shrink-0">Customer Service</Link>
                    <Link href="/products" className="whitespace-nowrap hover:border hover:border-white py-[6px] px-2 rounded-sm border border-transparent transition-all flex-shrink-0">About Us</Link>
                    <Link href="/products" className="whitespace-nowrap hover:border hover:border-white py-[6px] px-2 rounded-sm border border-transparent transition-all flex-shrink-0">New Releases</Link>
                </div>
            </div>

            {/* Mobile Nav Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white text-black shadow-lg absolute w-full top-full left-0 z-50">
                    {!isProductsPage && (
                        <div className="p-3 bg-[#232f3e]">
                            <form onSubmit={handleSearch} className="flex relative items-center w-full h-11 rounded-md overflow-hidden">
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    className="w-full h-full rounded-none border-none text-black bg-white focus-visible:ring-0 px-4 text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="h-full px-5 text-gray-800 bg-[#febd69] font-bold">
                                    <Search className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    )}
                    <div className="flex flex-col h-[calc(100vh-120px)] overflow-y-auto pb-10">
                        <div className="bg-[#131921] text-white py-4 px-5 font-bold flex items-center justify-between">
                            <div className="flex items-center gap-3 font-serif text-xl tracking-wide">
                                <User className="h-7 w-7" />
                                Hello, {isAuthenticated ? (isAdmin ? 'Admin' : 'User') : 'sign in'}
                            </div>
                            <button onClick={() => setIsMenuOpen(false)}>✕</button>
                        </div>

                        <div className="py-2">
                            <h3 className="font-bold text-[18px] px-5 py-3">Trending</h3>
                            <Link href="/products" className="block px-5 py-3 hover:bg-gray-100 text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Best Sellers</Link>
                            <Link href="/products" className="block px-5 py-3 hover:bg-gray-100 text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>New Releases</Link>
                        </div>

                        <div className="border-t border-gray-300 py-2">
                            <h3 className="font-bold text-[18px] px-5 py-3">Help & Settings</h3>
                            {isAuthenticated ? (
                                <>
                                    <Link href={isAdmin ? '/admin' : '/account'} className="block px-5 py-3 hover:bg-gray-100 text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Your Account</Link>
                                    <button className="block px-5 py-3 hover:bg-gray-100 text-gray-700 font-medium w-full text-left" onClick={() => { setIsMenuOpen(false); handleLogout(); }}>Sign Out</button>
                                </>
                            ) : (
                                <Link href="/" className="block px-5 py-3 hover:bg-gray-100 text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
