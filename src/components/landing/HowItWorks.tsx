import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Keyboard, BarChart3, Share2 } from "lucide-react";

export function HowItWorks() {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                        <Keyboard className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>1. Enter a Username</CardTitle>
                    <CardDescription>
                        Simply type in any GitHub username or organization name.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                        <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>2. Generate Dashboard</CardTitle>
                    <CardDescription>
                        Our tool fetches public data and generates a beautiful
                        dashboard in seconds.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                        <Share2 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>3. Share Your Stats</CardTitle>
                    <CardDescription>
                        Get a unique, shareable link to your analysis to
                        showcase your work.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
