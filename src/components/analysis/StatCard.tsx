import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "react-countup";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    // Проп, который будет говорить, когда начинать анимацию
    startAnimation: boolean;
}

export default function StatCard({
    title,
    value,
    icon,
    startAnimation,
}: StatCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-1xl xl:text-2xl font-bold flex items-center gap-2">
                    {icon}
                    <CountUp
                        start={0} // Начинаем с нуля
                        end={value}
                        duration={1.5} // Небольшая задержка
                        separator=","
                        // Вместо scrollSpy используем startOnMount, и контролируем его через проп
                        startOnMount={startAnimation}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
