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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featuresList.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-muted-foreground">{feature}</span>
                </div>
            ))}
        </div>
    );
}
