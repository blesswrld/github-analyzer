import { ResponsiveBar, BarDatum } from "@nivo/bar";

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
    return (
        <div style={{ height: "400px", width: "100%" }}>
            <ResponsiveBar
                data={data}
                keys={["value"]}
                indexBy="id"
                margin={{ top: 50, right: 60, bottom: 50, left: 80 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={{ scheme: "category10" }}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Language",
                    legendPosition: "middle",
                    legendOffset: 32,
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Repository Count",
                    legendPosition: "middle",
                    legendOffset: -60,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                legends={[]}
                animate={true}
                role="application"
                ariaLabel="Nivo bar chart showing top languages"
            />
        </div>
    );
}
