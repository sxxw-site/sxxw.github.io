import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let feedback;
let shareFeedbackFiles;

before(async () => {
  server = await createServer({ optimizeDeps: { noDiscovery: true, entries: [] }, server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  feedback = await server.ssrLoadModule('/src/lib/feedback.ts');
  ({ shareFeedbackFiles } = await server.ssrLoadModule('/src/lib/feedback-share.ts'));
});

after(async () => { await server?.close(); });

function resolve(search) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { search } } });
  try { return feedback.resolveFeedbackApp(); }
  finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else delete globalThis.window;
  }
}

for (const app of ['unknown', 'constructor', '__proto__', 'hasownproperty', 'hasOwnProperty', '']) {
  test(`unknown feedback app ${JSON.stringify(app)} uses the generic contact`, () => {
    const result = resolve(`?app=${encodeURIComponent(app)}`);
    assert.equal(result.app, feedback.FEEDBACK_GENERIC);
    assert.equal(result.store, undefined);
    assert.match(feedback.buildFeedbackMailto(result.app.email, 'Feedback', feedback.FEEDBACK_FALLBACK, ''), /^mailto:house@sxxw\.site\?/);
  });
}

test('known app normalization and store selection retain the existing fallback', () => {
  for (const [query, appKey, storeKey] of [
    ['?app=memoria', 'memoria', 'appstore'],
    ['?app=%20MEMORIA%20&platform=harmonyos', 'memoria', 'huawei'],
    ['?app=memoria&store=appgallery', 'memoria', 'huawei'],
    ['?app=memoria&store=ios', 'memoria', 'appstore'],
    ['?app=timetrails&store=huawei', 'timetrails', 'appstore'],
    ['?app=traceapp&platform=harmony', 'traceapp', 'appstore'],
  ]) {
    const result = resolve(query);
    assert.equal(result.app, feedback.FEEDBACK_APPS[appKey], query);
    assert.equal(result.store, feedback.FEEDBACK_APPS[appKey].stores[storeKey], query);
  }
});

const data = () => ({ files: [{ name: 'recording.mp4' }], title: 'Feedback', text: 'Keep my message and recording' });

test('unsupported selected files report failure rather than choosing email', async () => {
  const draft = data();
  let shared = false;
  const result = await shareFeedbackFiles(draft, { canShare: () => false, share: async () => { shared = true; } });
  assert.equal(result, 'failed');
  assert.equal(shared, false);
  assert.deepEqual(draft, data());
});

test('non-Abort share failures report failure and preserve the draft for retry', async () => {
  const draft = data();
  const result = await shareFeedbackFiles(draft, {
    canShare: () => true,
    share: async () => { throw Object.assign(new Error('Share permission denied'), { name: 'NotAllowedError' }); },
  });
  assert.equal(result, 'failed');
  assert.deepEqual(draft, data());
  let sent;
  assert.equal(await shareFeedbackFiles(draft, { canShare: () => true, share: async (value) => { sent = value; } }), 'shared');
  assert.equal(sent, draft);
});

test('cancelling the share does not report an error or choose email', async () => {
  assert.equal(await shareFeedbackFiles(data(), {
    canShare: () => true,
    share: async () => { throw Object.assign(new Error('User cancelled'), { name: 'AbortError' }); },
  }), 'cancelled');
});

test('successful sharing preserves the complete data and reports success', async () => {
  const draft = data();
  let sent;
  assert.equal(await shareFeedbackFiles(draft, { canShare: () => true, share: async (value) => { sent = value; } }), 'shared');
  assert.equal(sent, draft);
  assert.equal(sent.files[0].name, 'recording.mp4');
  assert.equal(sent.text, 'Keep my message and recording');
});

test('capability exceptions or missing sharing APIs report a recoverable failure', async () => {
  assert.equal(await shareFeedbackFiles(data(), {}), 'failed');
  assert.equal(await shareFeedbackFiles(data(), { canShare: () => { throw new Error('Capability unavailable'); } }), 'failed');
});
