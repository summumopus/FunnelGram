export function wrap(handler) {
    return async function (req, res) {
        try {
            await handler(req, res);
        } catch (err) {
            // Log full error server-side
            console.error('Unhandled handler error:', err && (err.stack || err.message || err));
            // Attempt to return JSON with details for debugging (temporary)
            try {
                res.status(500).json({ ok: false, error: (err && err.message) || 'internal error', stack: err && err.stack });
            } catch (e) {
                // If JSON response fails, fallback to plain text
                try { res.statusCode = 500; res.end('Internal server error'); } catch (e2) { /* ignore */ }
            }
        }
    };
}
