import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "react-countup";
import Link from "next/link";
import { useState, useEffect } from "react";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    // Проп, который будет говорить, когда начинать анимацию
    startAnimation: boolean;
    href: string;
}

export default function StatCard({
    title,
    value,
    icon,
    startAnimation,
    href,
}: StatCardProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <Card className="relative hover:bg-muted/50 transition-colors">
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10"
            >
                <span className="sr-only">View {title} on GitHub</span>
            </Link>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2 flex-wrap">
                    {/* Иконка не сжимается */}
                    <div className="flex-shrink-0">{icon}</div>

                    {/* Число теперь может переноситься */}
                    <span className="break-all">
                        {isMounted ? (
                            <CountUp
                                start={0} // Начинаем с нуля
                                end={value}
                                duration={1.5} // Небольшая задержка
                                separator=","
                                // Вместо scrollSpy используем startOnMount, и контролируем его через проп
                                startOnMount={startAnimation}
                            />
                        ) : (
                            value.toLocaleString()
                        )}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
