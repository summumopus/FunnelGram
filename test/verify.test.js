import assert from 'assert';
import { spawnSync } from 'child_process';
import crypto from 'crypto';
import { verifyInitData } from '../api/auth/verify.js';

// Helper to construct a signed initData for testing using a bot token
function makeSignedInitData(paramsObj, botToken) {
    const params = [];
    for (const [k, v] of Object.entries(paramsObj)) {
        params.push(`${k}=${v}`);
    }
    params.sort();
    const dataCheckString = params.join('\n');

    const secret = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

    // Build query string and include hash
    const qs = params.map(p => p).join('&') + `&hash=${hmac}`;
    return qs;
}

const BOT = 'test-bot-token-123';
const goodUser = JSON.stringify({ id: 12345, first_name: 'Tester', username: 'tester' });
const params = { user: encodeURIComponent(goodUser), auth_date: '169' };
const signed = makeSignedInitData(params, BOT);

// Node's test runner looks for exported tests in this file when using `node --test`
export const verify_good = () => {
    const result = verifyInitData(signed, BOT);
    assert.ok(result, 'verifyInitData should return parsed params for valid data');
    assert.strictEqual(decodeURIComponent(result.user), goodUser);
};

export const verify_bad = () => {
    // tamper hash
    const tampered = signed.replace(/.$/, c => (c === '0' ? '1' : '0'));
    const result = verifyInitData(tampered, BOT);
    assert.strictEqual(result, null, 'verifyInitData should return null for invalid data');
};
