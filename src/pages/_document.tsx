import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico?v=concha" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=concha" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=concha" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=concha" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=concha" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=JetBrains+Mono:wght@400;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
