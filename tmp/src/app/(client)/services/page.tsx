import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Laptop, ShieldCheck, Database, Settings, Headphones } from "lucide-react";

export default function ServicesPage() {
    const services = [
        {
            title: "Device Repair",
            desc: "Smartphones, laptops, and tablets fixed with genuine parts and precision.",
            icon: Smartphone,
        },
        {
            title: "Tech Consultation",
            desc: "Expert guidance for choosing hardware and software solutions tailored for you.",
            icon: Laptop,
        },
        {
            title: "Data Recovery",
            desc: "Secure retrieval of lost files from HDDs, SSDs, and external devices.",
            icon: Database,
        },
        {
            title: "Security Audit",
            desc: "Protecting your digital assets with advanced encryption and vulnerability tests.",
            icon: ShieldCheck,
        },
        {
            title: "System Optimization",
            desc: "Boost your device performance with professional software tuning.",
            icon: Settings,
        },
        {
            title: "24/7 Remote Support",
            desc: "Instant help for your technical issues from anywhere in the world.",
            icon: Headphones,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-950">
            <section className="py-20 text-center container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white mb-4">
                    Our <span className="text-orange-500">Services</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Expert solutions to keep your tech running smoothly and securely.
                </p>
            </section>

            <section className="py-20 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, i) => (
                        <Card key={i} className="bg-slate-900 border-slate-800 hover:border-orange-500/40 transition-all hover:-translate-y-1 group duration-300">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 group-hover:bg-orange-600/10 group-hover:border-orange-500/50 transition-colors">
                                    <service.icon className="h-6 w-6 text-orange-500" />
                                </div>
                                <CardTitle className="text-xl">{service.title}</CardTitle>
                                <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                                    {service.desc}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs font-mono text-slate-600">SERVICEID: 00{i + 1}-TECH</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-orange-600/5 border-y border-orange-500/20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold">Need a Custom Solution?</h2>
                    <p className="text-slate-400 max-w-lg mx-auto">
                        Our engineers are ready to build the next big thing for your business. Let's talk tech.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="px-8 py-3 bg-orange-600 rounded-lg font-bold hover:bg-orange-700 transition-colors">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
