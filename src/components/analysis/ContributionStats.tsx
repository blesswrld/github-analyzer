import { Flame, Repeat, CalendarCheck2, TrendingUp } from "lucide-react";

interface Stats {
    totalYearContributions: number;
    longestStreak: number;
    currentStreak: number;
    mostProductiveDay: string;
}

interface ContributionStatsProps {
    stats: Stats;
}

// Маленький компонент для одной карточки
const StatItem = ({
    title,
    value,
    icon,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}) => (
    <div className="flex flex-col items-center justify-center p-4 text-center border rounded-lg bg-background">
        <div className="text-muted-foreground">{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{title}</div>
    </div>
);

export default function ContributionStats({ stats }: ContributionStatsProps) {
    return (
        <div className="grid grid-cols-1 p-4 md:grid-cols-4 md:p-0 gap-4 mt-4">
            <StatItem
                title="Contributions this year"
                value={stats.totalYearContributions.toLocaleString()}
                icon={<TrendingUp className="h-6 w-6 mb-1" />}
            />
            <StatItem
                title="Longest Streak"
                value={`${stats.longestStreak} days`}
                icon={<Flame className="h-6 w-6 mb-1" />}
            />
            <StatItem
                title="Current Streak"
                value={`${stats.currentStreak} days`}
                icon={<Repeat className="h-6 w-6 mb-1" />}
            />
            <StatItem
                title="Busiest Day"
                value={stats.mostProductiveDay}
                icon={<CalendarCheck2 className="h-6 w-6 mb-1" />}
            />
        </div>
    );
}
