import React, { useEffect, useState } from 'react';

// Lightweight wrapper that attempts to dynamically import Vercel's Speed Insights
// components for Next.js or React. If unavailable, it shows a fallback link.
export default function SpeedInsightsWidget() {
    const [RemoteComp, setRemoteComp] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        async function load() {
            const candidates = [
                '@vercel/speed-insights/next',
                '@vercel/speed-insights/react',
                '@vercel/speed-insights'
            ];

            for (const name of candidates) {
                try {
                    // dynamic import; if the package exposes a React/Next component
                    // we'll try to render it. This keeps the app resilient if the
                    // named entry doesn't exist in this environment.
                    // eslint-disable-next-line no-await-in-loop
                    const mod = await import(/* @vite-ignore */ name);
                    const Comp = mod.SpeedInsights || mod.default || mod.SpeedInsightsWidget;
                    if (Comp && mounted) {
                        setRemoteComp(() => Comp);
                        return;
                    }
                } catch (e) {
                    // ignore and try next
                }
            }

            if (mounted) setError('Speed Insights not available');
        }

        load();
        return () => { mounted = false; };
    }, []);

    // Basic styled fallback button/link
    const fallback = (
        <a
            href="https://speed-insights.vercel.app/"
            target="_blank"
            rel="noreferrer"
            title="Open Vercel Speed Insights"
            style={{
                display: 'inline-block',
                padding: '6px 10px',
                background: '#111827',
                color: '#fff',
                borderRadius: 6,
                fontSize: 12,
                textDecoration: 'none'
            }}
        >
            Speed Insights
        </a>
    );

    if (RemoteComp) {
        // Render the remote component directly. If it needs props, it's expected
        // to handle defaults. This is best-effort for projects not using Next.
        const Comp = RemoteComp;
        try {
            return <Comp />;
        } catch (e) {
            // If rendering fails, fall back to link
            return fallback;
        }
    }

    return (
        <div style={{ position: 'fixed', right: 12, bottom: 96, zIndex: 9999 }}>
            {error ? fallback : <div style={{ padding: '6px 10px', background: '#f3f4f6', borderRadius: 6, fontSize: 12 }}>Loading...</div>}
        </div>
    );
}
