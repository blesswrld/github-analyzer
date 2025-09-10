import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Keyboard,
    BarChart3,
    Share2,
    /* MousePointerClick,
    Laptop,
    Users, */
} from "lucide-react";

const steps = [
    {
        icon: <Keyboard className="h-6 w-6 text-primary" />,
        title: "1. Enter a Username",
        description: "Simply type in any GitHub username or organization name.",
    },
    {
        icon: <BarChart3 className="h-6 w-6 text-primary" />,
        title: "2. Generate Dashboard",
        description:
            "Our tool fetches public data and generates a beautiful dashboard in seconds.",
    },
    {
        icon: <Share2 className="h-6 w-6 text-primary" />,
        title: "3. Share Your Stats",
        description:
            "Get a unique, shareable link to your analysis to showcase your work.",
    },
    /* {
        icon: <Laptop className="h-6 w-6 text-primary" />,
        title: "4. Fully Responsive",
        description:
            "Your dashboard is beautifully designed to look great on desktops, tablets, and mobile devices.",
    },
    {
        icon: <MousePointerClick className="h-6 w-6 text-primary" />,
        title: "5. Interactive & Clickable",
        description:
            "Explore the data: click on stats to go to GitHub, hover over charts for details, and switch to dark mode for comfort.",
    },
    {
        icon: <Users className="h-6 w-6 text-primary" />,
        title: "6. Compare Profiles",
        description:
            "Analyze two profiles side-by-side to compare their statistics and programming language preferences.",
    }, */
];

export function HowItWorks() {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
                // --- ВНЕШНЯЯ ОБЕРТКА ДЛЯ ГРАДИЕНТА ---
                <div
                    key={index}
                    className="relative p-px rounded-lg lg:from-primary/30 lg:to-primary/60 lg:opacity-50 lg:hover:opacity-100 lg:transition-opacity lg:duration-300"
                >
                    {/* --- ВНУТРЕННЯЯ КАРТОЧКА --- */}
                    <Card className="relative h-full rounded-[11px]">
                        <CardHeader>
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                                {step.icon}
                            </div>
                            <CardTitle>{step.title}</CardTitle>
                            <CardDescription>
                                {step.description}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            ))}
        </div>
    );
}
