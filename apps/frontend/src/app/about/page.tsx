"use client";

import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { CheckCircle2, Users, Target, Lightbulb, Rocket, ShieldCheck, Zap, Mail } from "lucide-react";
import * as motion from "framer-motion/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const team = [
    { name: "Mr. NGANGONG Divine", role: "CEO & General Director", image: "/placeholder-user.jpg" },
    { name: "Mrs. KONFOR Lois", role: "Lead Developer", image: "/placeholder-user.jpg" },
    { name: "FANKEM Leonnel", role: "Product Designer", image: "/placeholder-user.jpg" },
];

const values = [
    { icon: Target, title: "Precision", desc: "Meticulous attention to detail in every component we source." },
    { icon: Users, title: "Collaboration", desc: "Working closely with global tech leaders to bring you the best." },
    { icon: Lightbulb, title: "Innovation", desc: "Constantly evolving to provide the most advanced technology." },
    { icon: Rocket, title: "Scale", desc: "Empowering businesses to grow with future-proof tech." },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-black py-20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-white" />

                <div className="max-w-frame mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center space-x-2 bg-[#FF9900]/10 border border-[#FF9900]/20 px-4 py-2 rounded-full mb-6"
                    >
                        <Zap className="w-4 h-4 text-[#FF9900]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF9900]">The Future of Tech</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={cn(integralCF.className, "text-5xl md:text-7xl lg:text-8xl text-white uppercase leading-none tracking-tighter")}
                    >
                        Innovating <br />
                        The <span className="text-[#FF9900]">Future</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="mt-8 text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium"
                    >
                        A high-tech digital platform dedicated to building powerful, intelligent solutions for businesses and individuals.
                    </motion.p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 max-w-frame mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className={cn(integralCF.className, "text-4xl md:text-5xl text-black uppercase")}>Who We Are</h2>
                            <div className="w-20 h-1.5 bg-[#FF9900] rounded-full" />
                        </div>

                        <p className="text-black/60 text-lg leading-relaxed">
                            Our mission is to use modern technology to solve real-world problems and bring innovation to everyone.
                            We believe in building secure, scalable, and user-friendly systems that shape the next generation of tech innovation.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                "Deliver top-tier digital products",
                                "Empower users with technology",
                                "Create secure, scalable systems",
                                "Shape future tech innovation"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center space-x-3 p-4 bg-black/5 rounded-2xl border border-black/5 group hover:bg-[#FF9900]/5 hover:border-[#FF9900]/20 transition-all">
                                    <CheckCircle2 className="w-5 h-5 text-[#FF9900]" />
                                    <span className="font-bold text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 relative">
                        <div className="absolute -inset-4 bg-[#FF9900]/5 blur-3xl rounded-full -z-10" />
                        {values.map((v, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className={cn(
                                    "p-8 rounded-[32px] border border-black/5 flex flex-col items-center text-center space-y-4 transition-all duration-300 shadow-sm",
                                    i % 2 === 1 ? "bg-white mt-8" : "bg-white"
                                )}
                            >
                                <div className="w-16 h-16 rounded-3xl bg-[#FF9900]/10 flex items-center justify-center">
                                    <v.icon className="w-8 h-8 text-[#FF9900]" />
                                </div>
                                <h4 className="font-bold text-xl">{v.title}</h4>
                                <p className="text-xs text-black/40 leading-relaxed font-medium">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 bg-[#F2F0F1]">
                <div className="max-w-frame mx-auto px-4 text-center">
                    <h2 className={cn(integralCF.className, "text-4xl md:text-5xl text-black uppercase mb-16")}>
                        Meet The <span className="text-[#FF9900]">Team</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {team.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="group"
                            >
                                <div className="aspect-[4/5] bg-black rounded-[40px] overflow-hidden relative mb-6 shadow-2xl shadow-black/10">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                    <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                        <Users className="w-24 h-24 text-white/10" />
                                    </div>
                                    <div className="absolute bottom-10 inset-x-0 px-6">
                                        <h3 className="text-white font-bold text-2xl mb-1">{member.name}</h3>
                                        <p className="text-[#FF9900] text-sm uppercase tracking-widest font-black">{member.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 max-w-frame mx-auto px-4">
                <div className="bg-black rounded-[48px] p-12 md:p-20 relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <ShieldCheck className="w-40 h-40 text-[#FF9900]" />
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className={cn(integralCF.className, "text-4xl md:text-6xl text-white uppercase leading-tight")}>
                            Building The <br /> Infrastructure <br /> of <span className="text-[#FF9900]">Tomorrow</span>
                        </h2>
                        <p className="text-white/40 text-lg font-medium">
                            Connect with our team to learn more about our high-tech solutions and how they can accelerate your growth.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button asChild className="bg-[#FF9900] hover:bg-[#E68A00] text-black h-16 px-10 rounded-full font-bold text-lg">
                                <Link href="/shop">Explore Solutions</Link>
                            </Button>
                            <Button variant="outline" asChild className="border-white/20 text-white bg-transparent h-16 px-10 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/40 transition-all">
                                <a href="mailto:sales@hi-tech.com">
                                    <Mail className="w-5 h-5 mr-2" />
                                    Contact Sales
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
