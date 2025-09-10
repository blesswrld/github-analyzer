"use client"; // Добавляем, так как будем использовать useState

import { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils"; // Импортируем нашу утилиту cn

// Создаем массив с данными для FAQ для чистоты кода
const faqItems = [
    {
        value: "item-1",
        question: "Is this service free?",
        answer: "Yes, GitHub Analyzer is completely free to use.",
    },
    {
        value: "item-2",
        question: "Do you store my private data?",
        answer: "No. All analysis is performed only on publicly available information from the GitHub API. We do not request access to, analyze, or store any private data.",
    },
    {
        value: "item-3",
        question: "Why should I log in?",
        answer: "Logging in with your GitHub account provides you with a higher API rate limit from GitHub, which can be useful for analyzing very large profiles or organizations without hitting rate limits.",
    },
];

export function FAQ() {
    // Состояние для отслеживания ID открытого элемента
    const [openItem, setOpenItem] = useState<string>("");

    return (
        <Accordion
            type="single"
            collapsible
            className="w-full space-y-4"
            value={openItem} // Контролируем состояние аккордеона
            onValueChange={setOpenItem} // Обновляем состояние при клике
        >
            {faqItems.map((item) => (
                // --- Динамические классы ---
                <div
                    key={item.value}
                    className={cn(
                        "relative p-px rounded-lg from-primary/30 to-primary/60 transition-opacity duration-300",
                        // Если элемент открыт, делаем рамку яркой, иначе - полупрозрачной
                        openItem === item.value
                            ? "opacity-100"
                            : "opacity-50 hover:opacity-100"
                    )}
                >
                    {/* --- ВНУТРЕННИЙ АККОРДЕОН-ЭЛЕМЕНТ --- */}
                    <AccordionItem
                        value={item.value}
                        className="border-none bg-muted rounded-[11px]"
                    >
                        <AccordionTrigger className="p-4 hover:no-underline cursor-pointer">
                            {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                </div>
            ))}
        </Accordion>
    );
}
