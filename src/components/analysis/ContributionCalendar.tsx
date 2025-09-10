"use client";

import CalendarHeatmap, {
    ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
// Импортируем startOfYear для получения 1 января
import { startOfYear, format, parseISO } from "date-fns";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface ContributionCalendarProps {
    data: { date: string; count: number }[];
}

export default function ContributionCalendar({
    data,
}: ContributionCalendarProps) {
    const currentYear = new Date().getFullYear();
    // Начало года (1 января)
    const startDate = startOfYear(new Date());
    // Конец года (31 декабря)
    const endDate = new Date(currentYear, 11, 31);

    return (
        <div className="react-calendar-heatmap-container">
            <CalendarHeatmap
                startDate={startDate} // Начинаем с 1 января
                endDate={endDate} // Заканчиваем 31 декабря
                values={data}
                // Показывать названия месяцев
                showMonthLabels={true}
                classForValue={(value) => {
                    if (!value || value.count === 0) {
                        return "color-empty";
                    }
                    const count =
                        typeof value.count === "number" ? value.count : 0;
                    return `color-github-${Math.min(count, 4)}`;
                }}
                // @ts-ignore
                tooltipDataAttrs={(
                    value: ReactCalendarHeatmapValue<string>
                ) => {
                    if (!value || !value.date) {
                        return { "data-tooltip-id": "heatmap-tooltip" };
                    }
                    const formattedDate = format(
                        parseISO(value.date),
                        "MMMM d, yyyy"
                    );
                    return {
                        "data-tooltip-id": "heatmap-tooltip",
                        "data-tooltip-content": `${
                            value.count || 0
                        } contributions on ${formattedDate}`,
                    };
                }}
            />
            <ReactTooltip id="heatmap-tooltip" />
        </div>
    );
}
