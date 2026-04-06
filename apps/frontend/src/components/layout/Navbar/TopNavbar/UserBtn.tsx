"use client";

import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const UserBtn = () => {
  const { user, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative ml-2 p-1" ref={dropdownRef} onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button 
        className="flex items-center justify-center p-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isLoading ? (
          <div className="w-[22px] h-[22px] bg-gray-200 rounded-full animate-pulse" />
        ) : (
          <Image
            priority
            src="/icons/user.svg"
            height={100}
            width={100}
            alt="user"
            className="max-w-[22px] max-h-[22px] cursor-pointer"
          />
        )}
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute right-0 top-full pt-2 w-48 transition-all duration-200 origin-top-right ${
          isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
        }`}
      >
        <div className="bg-white rounded-xl shadow-lg border border-black/5 overflow-hidden flex flex-col py-2">
          {user ? (
            <>
              <div className="px-4 py-2 border-b border-black/5 mb-1">
                <p className="text-sm font-bold truncate">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-black/60 truncate">{user.email}</p>
              </div>
              <Link 
                href="/account" 
                className="px-4 py-2 flex items-center text-sm font-medium hover:bg-black/5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Account
              </Link>
              <Link 
                href="/account/orders" 
                className="px-4 py-2 flex items-center text-sm font-medium hover:bg-black/5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Orders
              </Link>
              <button 
                onClick={() => {
                  logout();
                  setIsOpen(false);
                  router.push("/");
                }}
                className="px-4 py-2 flex items-center text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="px-4 py-2 flex items-center text-sm font-bold bg-black text-white hover:bg-black/80 transition-colors mx-2 rounded-lg justify-center mb-2"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <div className="px-4 pb-1 text-center text-xs text-black/60">
                New customer?
              </div>
              <Link 
                href="/auth/register" 
                className="px-4 py-2 flex items-center justify-center text-sm font-medium hover:bg-black/5 transition-colors mx-2 rounded-lg border border-black/10"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBtn;
