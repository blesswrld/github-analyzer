import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <title>GitHub Profile Analyzer - In-Depth Stats & Insights</title>
            <meta
                name="description"
                content="Generate a beautiful, shareable dashboard of any GitHub user or organization's coding stats, top languages, and most popular repositories."
            />

            <Head>
                {/* Манифест - главный источник информации об иконках */}
                <link rel="manifest" href="/favicon/manifest.json" />

                {/* Базовая иконка для всех браузеров */}
                <link rel="icon" href="/favicon/favicon.ico" />

                {/* Иконка для Apple устройств */}
                <link
                    rel="apple-touch-icon"
                    href="/favicon/apple-icon-180x180.png"
                />

                {/* Теги для Windows Tiles и цвета темы */}
                <meta name="msapplication-TileColor" content="#0a0a0a" />
                <meta
                    name="msapplication-TileImage"
                    content="/favicon/ms-icon-144x144.png"
                />
                <meta name="theme-color" content="#0a0a0a" />
            </Head>
            <body className="antialiased">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
