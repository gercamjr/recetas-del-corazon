import { afterEach, describe, expect, it, vi } from 'vitest';
import { authorizeWrite } from './write-auth';

const environment = process.env as Record<string, string | undefined>;
const originalFamilyToken = process.env.FAMILY_ACCESS_TOKEN;
const originalLegacyToken = process.env.RDC_WRITE_TOKEN;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalFamilyToken === undefined) delete environment.FAMILY_ACCESS_TOKEN;
  else environment.FAMILY_ACCESS_TOKEN = originalFamilyToken;

  if (originalLegacyToken === undefined) delete environment.RDC_WRITE_TOKEN;
  else environment.RDC_WRITE_TOKEN = originalLegacyToken;

  if (originalNodeEnv === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = originalNodeEnv;

  vi.restoreAllMocks();
});

function request(headers: HeadersInit = {}) {
  return new Request('http://localhost/api/recipes', { headers });
}

describe('authorizeWrite', () => {
  it('accepts the configured family token from the request header', () => {
    environment.FAMILY_ACCESS_TOKEN = 'family-secret';
    environment.NODE_ENV = 'production';

    expect(authorizeWrite(request({ 'x-family-token': 'family-secret' }))).toBeNull();
  });

  it('accepts the configured family token from a cookie', () => {
    environment.FAMILY_ACCESS_TOKEN = 'family-secret';
    environment.NODE_ENV = 'production';

    expect(authorizeWrite(request({ cookie: 'theme=dark; family_access_token=family-secret' }))).toBeNull();
  });

  it('rejects a missing or incorrect token without revealing which case occurred', async () => {
    environment.FAMILY_ACCESS_TOKEN = 'family-secret';
    environment.NODE_ENV = 'production';

    for (const candidate of [undefined, 'incorrect-secret']) {
      const response = authorizeWrite(request(candidate ? { 'x-family-token': candidate } : {}));

      expect(response?.status).toBe(401);
      await expect(response?.json()).resolves.toEqual({
        success: false,
        error: 'Family access token is required.',
      });
    }
  });

  it('fails closed in production when no write token is configured', async () => {
    delete environment.FAMILY_ACCESS_TOKEN;
    delete environment.RDC_WRITE_TOKEN;
    environment.NODE_ENV = 'production';

    const response = authorizeWrite(request());

    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toEqual({
      success: false,
      error: 'Recipe writes are not configured.',
    });
  });

  it('allows development writes with a warning when no token is configured', () => {
    delete environment.FAMILY_ACCESS_TOKEN;
    delete environment.RDC_WRITE_TOKEN;
    environment.NODE_ENV = 'development';
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(authorizeWrite(request())).toBeNull();
    expect(warning).toHaveBeenCalledWith(
      'FAMILY_ACCESS_TOKEN is not configured; allowing write request outside production.',
    );
  });

  it('supports RDC_WRITE_TOKEN as a backwards-compatible fallback', () => {
    delete environment.FAMILY_ACCESS_TOKEN;
    environment.RDC_WRITE_TOKEN = 'legacy-secret';
    environment.NODE_ENV = 'production';

    expect(authorizeWrite(request({ 'x-family-token': 'legacy-secret' }))).toBeNull();
  });
});
