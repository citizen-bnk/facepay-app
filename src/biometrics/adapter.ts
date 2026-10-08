/**
 * Biometric / liveness ADAPTER (STUB).
 *
 * This app does NOT perform real face recognition or liveness detection.
 * The camera preview is shown to the user for framing only; no frame is read,
 * stored, or transmitted. `MockLivenessAdapter` simply resolves after a delay.
 *
 * A production build must replace this with a certified liveness SDK provider
 * that returns an opaque, signed result token (never raw images or templates),
 * which is then attached to POST /v1/verification-sessions by the backend.
 */
export interface LivenessResult {
  ok: boolean;
  /** Opaque provider reference. Never contains biometric data. */
  reference: string | null;
  reason?: string;
  mocked: boolean;
}

export interface LivenessAdapter {
  readonly name: string;
  verify(signal?: { cancelled: boolean }): Promise<LivenessResult>;
}

export class MockLivenessAdapter implements LivenessAdapter {
  readonly name = 'mock-liveness (demo stub)';
  constructor(private durationMs = 2600, private forceFail = process.env.EXPO_PUBLIC_MOCK_LIVENESS === 'fail') {}

  verify(signal?: { cancelled: boolean }): Promise<LivenessResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (signal?.cancelled) return resolve({ ok: false, reference: null, reason: 'cancelled', mocked: true });
        if (this.forceFail) return resolve({ ok: false, reference: null, reason: 'liveness_failed', mocked: true });
        resolve({ ok: true, reference: 'mock-liveness-' + Date.now().toString(36), mocked: true });
      }, this.durationMs);
    });
  }
}

export const livenessAdapter: LivenessAdapter = new MockLivenessAdapter();
