import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export function Features() {
    const featuresList = [
        "In-depth language analysis",
        "Top repositories insights",
        "Key contribution statistics",
        "Shareable dashboards",
        "Organization support",
        "Light & Dark themes",
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featuresList.map((feature, index) => (
                // --- ВНЕШНЯЯ ОБЕРТКА ДЛЯ ГРАДИЕНТА ---
                <div
                    key={index}
                    className="relative p-px rounded-lg from-primary/30 to-primary/60 opacity-50 hover:opacity-100 transition-opacity duration-300"
                >
                    {/* --- ВНУТРЕННЯЯ КАРТОЧКА --- */}
                    <Card className="relative h-full rounded-[11px]">
                        <CardContent className="p-4 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-primary text-sm">
                                {feature}
                            </span>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    );
}
