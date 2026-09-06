import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var g=typeof globalThis!=='undefined'?globalThis:(typeof window!=='undefined'?window:this);if(g){if(!g.crypto){try{g.crypto={};}catch(e){}}if(typeof Crypto!=='undefined'&&Crypto.prototype&&typeof Crypto.prototype.randomUUID!=='function'){try{Object.defineProperty(Crypto.prototype,'randomUUID',{value:function(){if(typeof this.getRandomValues==='function'){return'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,function(c){return(c^(this.getRandomValues(new Uint8Array(1))[0]&(15>>(c/4)))).toString(16);}.bind(this));}return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);});},writable:true,configurable:true});}catch(e){}}if(g.crypto&&typeof g.crypto.randomUUID!=='function'){var fn=function(){if(typeof g.crypto.getRandomValues==='function'){return'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,function(c){return(c^(g.crypto.getRandomValues(new Uint8Array(1))[0]&(15>>(c/4)))).toString(16);});}return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);});};try{g.crypto.randomUUID=fn;}catch(e){try{Object.defineProperty(g.crypto,'randomUUID',{value:fn,writable:true,configurable:true});}catch(err){}}}}}catch(err){}})();`,
          }}
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
