import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no" />
        <meta name="theme-color" content="#081020" />
        <meta name="description" content="FacePay: face your money. Pay with just your face, QR or tap." />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'html,body{background:#f8f6ee;}body{overflow:hidden;}@media(min-width:600px){#root{padding:20px 0;background:radial-gradient(ellipse at 50% 70%,#e5d5b2,#f8f6ee 70%);}}' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
