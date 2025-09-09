"use client";

import { ResponsiveBar, BarDatum, BarTooltipProps } from "@nivo/bar";
import { useTheme } from "next-themes";
// Импортируем хук для отслеживания размера окна
import { useWindowWidth } from "@react-hook/window-size";

// Определяем тип для данных, чтобы было удобнее
interface LanguageData extends BarDatum {
    id: string; // Это будет обрезанное название для оси
    label: string; // Это всегда будет полное название
    value: number;
}

interface LanguagesChartProps {
    data: LanguageData[];
}

export default function LanguagesChart({ data }: LanguagesChartProps) {
    const { theme } = useTheme();
    const windowWidth = useWindowWidth();

    // Определяем, когда переключаться на мобильный (горизонтальный) вид
    const isMobile = windowWidth < 768; // 768px = Tailwind 'md' брейкпоинт

    const chartHeight = "400px"; // Возвращаем фиксированную высоту, т.к. обрезка решает проблему

    // --- Обрезаем длинные названия для подписей (id) ---
    const processedData = data.map((d) => ({
        ...d,
        // Если это мобильный вид и ПОЛНОЕ название (label) длиннее 10 символов, обрезаем id
        id:
            isMobile && d.label.length > 10
                ? `${d.label.substring(0, 10)}…`
                : d.label,
    }));

    // На мобильных переворачиваем обрезанные данные
    const chartData = isMobile ? [...processedData].reverse() : processedData;

    // Определяем цвета для текста и линий в зависимости от темы
    const axisTextColor = theme === "dark" ? "#cbd5e1" : "#475569";
    const gridLineColor = theme === "dark" ? "#334155" : "#e2e8f0";

    // --- Создаем компонент тултипа ---
    const Tooltip = (point: BarTooltipProps<LanguageData>) => (
        <div
            style={{
                background: theme === "dark" ? "#09090b" : "#ffffff",
                color: theme === "dark" ? "#fafafa" : "#09090b",
                padding: "8px 12px",
                border: `1px solid ${theme === "dark" ? "#27270a" : "#ccc"}`,
                borderRadius: "6px",
                boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
            }}
        >
            <strong>{point.data.label}</strong>: {point.formattedValue} repos
        </div>
    );
    // Это нужно для ESLint
    Tooltip.displayName = "BarTooltip";

    return (
        <div style={{ height: chartHeight, width: "100%" }}>
            <ResponsiveBar
                data={chartData}
                keys={["value"]}
                indexBy="id"
                // Передаем наш компонент напрямую
                tooltip={Tooltip}
                // Адаптивные настройки
                layout={isMobile ? "horizontal" : "vertical"}
                margin={
                    isMobile
                        ? { top: 20, right: 40, bottom: 40, left: 80 }
                        : // На десктопе отступ снизу больше для повернутых подписей
                          { top: 20, right: 20, bottom: 100, left: 60 }
                }
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={{ scheme: "category10" }}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                // Настраиваем оси
                gridYValues={5} // Делаем сетку менее частой
                axisTop={null}
                axisRight={null}
                axisBottom={
                    isMobile
                        ? {
                              // Настройки для горизонтального вида
                              legend: "Repository Count",
                              legendPosition: "middle",
                              legendOffset: 34,
                          }
                        : {
                              // Настройки для вертикального вида
                              tickSize: 5,
                              tickPadding: 5,
                              tickRotation: -45,
                              legend: "Language",
                              legendPosition: "middle",
                              legendOffset: 65,
                          }
                }
                axisLeft={
                    isMobile
                        ? {
                              // Настройки для горизонтального вида
                              tickSize: 5,
                              tickPadding: 5,
                              tickRotation: 0,
                          }
                        : {
                              // Настройки для вертикального вида
                              tickSize: 5,
                              tickPadding: 5,
                              tickRotation: 0,
                              legend: "Repository Count",
                              legendPosition: "middle",
                              legendOffset: -50,
                          }
                }
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
                    // Линии сетки
                    grid: {
                        line: {
                            stroke: gridLineColor,
                        },
                    },
                }}
                // Включаем отображение значений на самих столбцах
                // На мобильных отключаем для чистоты
                enableLabel={!isMobile}
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
