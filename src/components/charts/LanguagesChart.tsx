import { ResponsiveBar, BarDatum } from "@nivo/bar";
import { useTheme } from "next-themes";

// Определяем тип для данных, чтобы было удобнее
interface LanguageData extends BarDatum {
    id: string;
    label: string;
    value: number;
}

interface LanguagesChartProps {
    data: LanguageData[];
}

export default function LanguagesChart({ data }: LanguagesChartProps) {
    const { theme } = useTheme();

    // Определяем цвета для текста и линий в зависимости от темы
    const axisTextColor = theme === "dark" ? "#cbd5e1" : "#475569";
    const gridLineColor = theme === "dark" ? "#334155" : "#e2e8f0";

    return (
        <div style={{ height: "400px", width: "100%" }}>
            <ResponsiveBar
                data={data}
                keys={["value"]}
                indexBy="id"
                margin={{ top: 20, right: 20, bottom: 100, left: 60 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={{ scheme: "category10" }}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                // Настраиваем оси
                gridYValues={5} // Делаем сетку менее частой
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: "Language",
                    legendPosition: "middle",
                    legendOffset: 65,
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Repository Count",
                    legendPosition: "middle",
                    legendOffset: -50,
                }}
                // НАСТРАИВАЕМ ВСЕ ЦВЕТА ЧЕРЕЗ ПРОП 'theme'
                theme={{
                    // Типографика
                    text: {
                        fontSize: 11,
                        fill: axisTextColor,
                    },
                    // Оси
                    axis: {
                        ticks: {
                            text: { fill: axisTextColor },
                        },
                        legend: {
                            text: {
                                fill: axisTextColor,
                                fontSize: 12,
                                fontWeight: 500,
                            },
                        },
                    },
                    // Линии сетки (ПРАВИЛЬНОЕ МЕСТО ДЛЯ НАСТРОЙКИ)
                    grid: {
                        line: {
                            stroke: gridLineColor,
                        },
                    },
                    // Всплывающие подсказки
                    tooltip: {
                        container: {
                            background:
                                theme === "dark" ? "#1e293b" : "#ffffff",
                            color: theme === "dark" ? "#f8fafc" : "#020817",
                            fontSize: 12,
                        },
                    },
                }}
                // Включаем отображение значений на самих столбцах
                enableLabel={true}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                // Остальные пропсы
                animate={true}
                role="application"
                ariaLabel="Bar chart showing top languages by repository count"
            />
        </div>
    );
}
