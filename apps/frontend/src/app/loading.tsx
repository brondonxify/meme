import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-orange-600 animate-spin" />
                <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-orange-500 animate-pulse" />
            </div>
            <p className="text-slate-400 font-mono tracking-widest text-xs animate-pulse uppercase">Initializing Neural Link...</p>
        </div>
    );
}
