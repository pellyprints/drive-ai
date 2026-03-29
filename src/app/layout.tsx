import { SpeedInsights } from '@vercel/speed-insights/next';
import { type ReactNode, Suspense } from 'react';

import Analytics from '@/components/Analytics';

const inVercel = process.env.VERCEL === '1';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html suppressHydrationWarning lang={'en'} style={{ height: '100%' }}>
      <head>
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="black-translucent" name="apple-mobile-web-app-status-bar-style" />
        <meta content="Drive AI" name="apple-mobile-web-app-title" />
        <meta content="#0f172a" name="theme-color" />
      </head>
      <body style={{ height: '100%', margin: 0 }}>
        {children}
        <Suspense fallback={null}>
          <Analytics />
          {inVercel && <SpeedInsights />}
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
