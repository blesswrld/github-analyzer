"use client";

import { ResponsiveBar, BarDatum } from "@nivo/bar";
import { useTheme } from "next-themes";
import { useWindowWidth } from "@react-hook/window-size";

// Тип для исходных данных
interface LanguageData {
    id: string;
    label: string;
    value: number;
}

// Тип для данных, преобразованных для графика
interface TransformedData extends BarDatum {
    language: string;
    [key: string]: string | number; // Позволяет иметь динамические ключи (name1, name2)
}

interface CompareLanguagesChartProps {
    data1: LanguageData[];
    data2: LanguageData[];
    name1: string;
    name2: string;
}

export default function CompareLanguagesChart({
    data1,
    data2,
    name1,
    name2,
}: CompareLanguagesChartProps) {
    const { theme } = useTheme();
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    // 1. Собираем все уникальные языки от обоих пользователей/организаций
    const allLangs = new Set([
        ...data1.map((d) => d.label),
        ...data2.map((d) => d.label),
    ]);

    // 2. Преобразуем данные в формат, понятный Nivo для сгруппированного графика
    const transformedData: TransformedData[] = Array.from(allLangs)
        .map((lang) => {
            const lang1 = data1.find((d) => d.label === lang);
            const lang2 = data2.find((d) => d.label === lang);
            return {
                language: lang,
                [name1]: lang1 ? lang1.value : 0,
                [name2]: lang2 ? lang2.value : 0,
            };
        })
        // 3. Сортируем по суммарному количеству репозиториев и берем топ-15
        .sort(
            (a, b) =>
                (b[name1] as number) +
                (b[name2] as number) -
                ((a[name1] as number) + (a[name2] as number))
        )
        .slice(0, 15);

    // Если на мобильном, переворачиваем для горизонтального вида
    if (isMobile) {
        transformedData.reverse();
    }

    // Настройки цветов и текста для тем
    const axisTextColor = theme === "dark" ? "#cbd5e1" : "#475569";
    const gridLineColor = theme === "dark" ? "#334155" : "#e2e8f0";

    return (
        <div style={{ height: "500px" }}>
            <ResponsiveBar
                data={transformedData}
                keys={[name1, name2]}
                indexBy="language"
                groupMode="grouped" // Включаем режим группировки
                layout={isMobile ? "horizontal" : "vertical"}
                margin={
                    isMobile
                        ? { top: 20, right: 20, bottom: 50, left: 100 }
                        : { top: 50, right: 20, bottom: 100, left: 60 }
                }
                padding={0.2}
                innerPadding={2}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                // Используем два разных цвета для сравнения
                colors={["#2563eb", "#db2777"]}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={
                    isMobile
                        ? undefined
                        : { tickRotation: -45, legendOffset: 65 }
                }
                axisLeft={
                    isMobile
                        ? undefined
                        : {
                              legend: "Repository Count",
                              legendPosition: "middle",
                              legendOffset: -50,
                          }
                }
                enableLabel={false} // Отключаем метки внутри столбцов, они будут мешать
                theme={{
                    text: { fontSize: 11, fill: axisTextColor },
                    axis: {
                        ticks: { text: { fill: axisTextColor } },
                        legend: {
                            text: {
                                fill: axisTextColor,
                                fontSize: 12,
                                fontWeight: 500,
                            },
                        },
                    },
                    grid: { line: { stroke: gridLineColor } },
                    tooltip: {
                        container: {
                            background:
                                theme === "dark" ? "#1e293b" : "#ffffff",
                            color: theme === "dark" ? "#f8fafc" : "#020817",
                        },
                    },
                    legends: {
                        text: { fill: axisTextColor },
                    },
                }}
                // Легенда для цветов
                legends={[
                    {
                        dataFrom: "keys",
                        anchor: "bottom",
                        direction: "row",
                        justify: false,
                        translateX: 20,
                        translateY: isMobile ? 40 : 80,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: "left-to-right",
                        itemOpacity: 0.85,
                        symbolSize: 12,
                    },
                ]}
                animate={true}
                role="application"
                ariaLabel="Comparison bar chart of programming languages"
            />
        </div>
    );
}
