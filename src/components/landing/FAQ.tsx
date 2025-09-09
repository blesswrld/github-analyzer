import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Is this service free?</AccordionTrigger>
                <AccordionContent>
                    Yes, GitHub Analyzer is completely free to use.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>
                    Do you store my private data?
                </AccordionTrigger>
                <AccordionContent>
                    No. All analysis is performed only on publicly available
                    information from the GitHub API. We do not request access
                    to, analyze, or store any private data.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Why should I log in?</AccordionTrigger>
                <AccordionContent>
                    Logging in with your GitHub account provides you with a
                    higher API rate limit from GitHub, which can be useful for
                    analyzing very large profiles or organizations without
                    hitting rate limits.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
