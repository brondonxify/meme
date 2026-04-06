'use client'

import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import * as motion from "framer-motion/client";
import { useAuth } from "@/contexts/auth-context";

const Header = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-[#F2F0F1] pt-10 md:pt-24 lg:pt-32 overflow-hidden">
      <div className="md:max-w-frame mx-auto grid grid-cols-1 md:grid-cols-2">
        <section className="max-w-frame px-4 lg:pb-24">
          <motion.h2
            initial={{ y: "100px", opacity: 0 }}
            whileInView={{ y: "0", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={cn([
              integralCF.className,
              "text-4xl lg:text-[64px] lg:leading-[64px] mb-5 lg:mb-8 uppercase",
            ])}
          >
            {isAuthenticated ? `WELCOME BACK, ${user?.first_name || 'MEMBER'}` : "PREMIUM TECH, DELIVERED FAST"}
          </motion.h2>
          <motion.p
            initial={{ y: "100px", opacity: 0 }}
            whileInView={{ y: "0", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-black/60 text-sm lg:text-lg mb-6 lg:mb-8 max-w-[545px]"
          >
            {isAuthenticated
              ? `Ready to upgrade your setup? Check out the latest high-performance hardware and exclusive tech deals waiting for you.`
              : "Discover the latest hardware, smart home devices, and high-performance computing components at unbeatable prices."}
          </motion.p>
          <motion.div
            initial={{ y: "100px", opacity: 0 }}
            whileInView={{ y: "0", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Link
              href="/shop"
              className="w-full md:w-52 mb-5 md:mb-12 inline-block text-center bg-black hover:bg-black/80 transition-all text-white px-14 py-4 rounded-full text-lg font-bold"
            >
              Shop Now
            </Link>
          </motion.div>
          <motion.div
            initial={{ y: "100px", opacity: 0 }}
            whileInView={{ y: "0", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="flex md:h-full md:max-h-11 lg:max-h-[52px] xl:max-h-[68px] items-center justify-center md:justify-start flex-wrap sm:flex-nowrap md:space-x-3 lg:space-x-6 xl:space-x-8 md:mb-[116px]"
          >
            <div className="flex flex-col">
              <span className="font-bold text-2xl md:text-xl lg:text-3xl xl:text-[40px] xl:mb-2 text-[#ff9900]">
                <AnimatedCounter from={0} to={200} />+
              </span>
              <span className="text-xs xl:text-base text-black/60 text-nowrap font-medium">
                Top Tech Brands
              </span>
            </div>
            <Separator
              className="ml-6 md:ml-0 h-12 md:h-full bg-black/20"
              orientation="vertical"
            />
            <div className="flex flex-col ml-6 md:ml-0">
              <span className="font-bold text-2xl md:text-xl lg:text-3xl xl:text-[40px] xl:mb-2 text-[#ff9900]">
                <AnimatedCounter from={0} to={2000} />+
              </span>
              <span className="text-xs xl:text-base text-black/60 text-nowrap font-medium">
                Prime Components
              </span>
            </div>
            <Separator
              className="hidden sm:block sm:h-12 md:h-full ml-6 md:ml-0 bg-black/20"
              orientation="vertical"
            />
            <div className="flex flex-col w-full text-center sm:w-auto sm:text-left mt-3 sm:mt-0 sm:ml-6 md:ml-0">
              <span className="font-bold text-2xl md:text-xl lg:text-3xl xl:text-[40px] xl:mb-2 text-[#ff9900]">
                <AnimatedCounter from={0} to={5000} />+
              </span>
              <span className="text-xs xl:text-base text-black/60 text-nowrap font-medium">
                Happy Geeks
              </span>
            </div>
          </motion.div>
        </section>
        <motion.section
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.8, duration: 1 }}
          className="hidden md:flex items-center justify-center relative"
        >
          <div className="relative w-full h-[500px]">
            <Image
              src="/images/header-res-img.png"
              alt="Modern Tech Setup"
              fill
              className="object-contain"
              priority
            />
          </div>
          <Image
            priority
            src="/icons/big-star.svg"
            height={104}
            width={104}
            alt="star decorator"
            className="absolute right-0 top-10 animate-[spin_10s_infinite] opacity-30"
          />
        </motion.section>
      </div>
    </header>
  );
};

export default Header;

