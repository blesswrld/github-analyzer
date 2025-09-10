import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full border-t">
            <div className="container mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-2">
                <p className="text-muted-foreground text-sm text-center md:text-left">
                    Built by{" "}
                    <Link
                        href="https://github.com/blesswrld/github-analyzer"
                        target="_blank"
                        className="font-semibold text-primary hover:underline"
                    >
                        blesswrld
                    </Link>
                </p>
                <p className="text-muted-foreground text-xs text-center md:text-right">
                    Powered by Next.js, Vercel, and the GitHub API.
                </p>
            </div>
        </footer>
    );
}
