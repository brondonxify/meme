import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Target, Lightbulb, Rocket } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    const team = [
        { name: "Mr. NGANGONG Divine", role: "CEO & General Director", image: "/placeholder-user.jpg" },
        { name: "Mrs. KONFOR Lois", role: "Lead Developer", image: "/placeholder-user.jpg" },
        { name: "FANKEM Leonnel", role: "Product Designer", image: "/placeholder-user.jpg" },
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative h-[40vh] flex items-center justify-center bg-slate-900 border-b border-slate-800">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=rmat&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
                <div className="container relative z-10 text-center space-y-4">
                    <Badge className="bg-orange-600 hover:bg-orange-600">ABOUT US</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                        Innovating the <span className="text-orange-500">Future</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        A high-tech digital platform dedicated to building powerful, intelligent solutions for businesses and individuals.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-orange-500">Who We Are</h2>
                    <p className="text-slate-400 leading-relaxed">
                        Our mission is to use modern technology to solve real-world problems and bring innovation to everyone. We believe in building secure, scalable, and user-friendly systems that shape the next generation of tech innovation.
                    </p>
                    <ul className="space-y-3">
                        {[
                            "Deliver top-tier digital products",
                            "Empower users with advanced technology",
                            "Create secure, scalable systems",
                            "Shape future tech innovation"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-300">
                                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-900/50 border-slate-800 p-6 flex flex-col items-center text-center space-y-2">
                        <Target className="h-8 w-8 text-orange-500" />
                        <h4 className="font-bold">Precision</h4>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 p-6 flex flex-col items-center text-center space-y-2">
                        <Users className="h-8 w-8 text-orange-500" />
                        <h4 className="font-bold">Collaboration</h4>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 p-6 flex flex-col items-center text-center space-y-2">
                        <Lightbulb className="h-8 w-8 text-orange-500" />
                        <h4 className="font-bold">Innovation</h4>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 p-6 flex flex-col items-center text-center space-y-2">
                        <Rocket className="h-8 w-8 text-orange-500" />
                        <h4 className="font-bold">Scale</h4>
                    </Card>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-slate-950">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Meet the <span className="text-orange-500">Team</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {team.map((member, i) => (
                            <Card key={i} className="bg-slate-900 border-slate-800 overflow-hidden group hover:border-orange-500/50 transition-colors">
                                <CardHeader className="p-0">
                                    <div className="aspect-square bg-slate-800 relative">
                                        <Users className="absolute inset-0 m-auto h-20 w-20 text-slate-700" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 text-center">
                                    <CardTitle className="text-lg">{member.name}</CardTitle>
                                    <p className="text-sm text-slate-400 mt-1">{member.role}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
