import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use actual environment variables for consistency

import { AniListAuthService } from '../auth';
import { AuthToken } from '../../shared/authTypes';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock BaseAuthService
vi.mock('../../shared/BaseAuthService', () => ({
  BaseAuthService: class {
    protected config: any;
    protected tokenKey: string;
    
    constructor(config: any, tokenKey: string) {
      this.config = config;
      this.tokenKey = tokenKey;
    }
    
    protected preventDuplicateExchange = vi.fn((key: string, fn: () => Promise<any>) => fn());
    protected saveToken = vi.fn();
    protected getToken = vi.fn();
    protected clearToken = vi.fn();
  }
}));

describe('AniListAuthService', () => {
  let authService: AniListAuthService;
  const mockToken: AuthToken = {
    access_token: 'mock_access_token',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'mock_refresh_token'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AniListAuthService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initiateLogin', () => {
    it('should generate proper authorization URL', async () => {
      const authUrl = await authService.initiateLogin();
      
      expect(authUrl).toContain('https://anilist.co/api/v2/oauth/authorize');
      expect(authUrl).toContain('client_id=');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fanilist%2Fcallback');
      expect(authUrl).toContain('state=');
    });

    it('should generate unique state parameter', async () => {
      const authUrl1 = await authService.initiateLogin();
      const authUrl2 = await authService.initiateLogin();
      
      const state1 = new URL(authUrl1).searchParams.get('state');
      const state2 = new URL(authUrl2).searchParams.get('state');
      
      expect(state1).toBeDefined();
      expect(state2).toBeDefined();
      expect(state1).not.toBe(state2);
    });

    it('should handle errors during URL generation', async () => {
      // Mock Math.random to throw an error
      const originalRandom = Math.random;
      Math.random = vi.fn().mockImplementation(() => {
        throw new Error('Random generation failed');
      });
      
      await expect(authService.initiateLogin()).rejects.toThrow('Random generation failed');
      
      // Restore original Math.random
      Math.random = originalRandom;
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should successfully exchange authorization code for token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      const result = await authService.exchangeCodeForToken('test_code');

      expect(result).toEqual(mockToken);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3002/anilist/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: expect.stringContaining('grant_type=authorization_code')
        })
      );
    });

    it('should include all required parameters in token exchange', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      await authService.exchangeCodeForToken('test_code');

      const callArgs = mockFetch.mock.calls[0];
      const body = callArgs[1].body;
      
      expect(body).toContain('grant_type=authorization_code');
      expect(body).toContain('client_id=');
      expect(body).toContain('client_secret=');
      expect(body).toContain('code=test_code');
      expect(body).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fanilist%2Fcallback');
    });

    it('should handle failed token exchange', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid authorization code'
      });

      const result = await authService.exchangeCodeForToken('invalid_code');

      expect(result).toBeNull();
    });

    it('should handle network errors during token exchange', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.exchangeCodeForToken('test_code');

      expect(result).toBeNull();
    });

    it('should use development proxy URL in dev environment', async () => {
      import.meta.env.DEV = true;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      await authService.exchangeCodeForToken('test_code');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3002/anilist/oauth/token',
        expect.any(Object)
      );
    });


    it('should prevent duplicate token exchanges', async () => {
      const preventDuplicateSpy = vi.fn((key: string, fn: () => Promise<any>) => fn());
      // @ts-ignore
      authService.preventDuplicateExchange = preventDuplicateSpy;
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      await authService.exchangeCodeForToken('test_code');

      expect(preventDuplicateSpy).toHaveBeenCalledWith(
        'anilist-test_code',
        expect.any(Function)
      );
    });

    it('should save token after successful exchange', async () => {
      const saveTokenSpy = vi.fn();
      // @ts-ignore
      authService.saveToken = saveTokenSpy;
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      await authService.exchangeCodeForToken('test_code');

      expect(saveTokenSpy).toHaveBeenCalledWith(mockToken);
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const result = await authService.exchangeCodeForToken('test_code');

      expect(result).toBeNull();
    });

    it('should log detailed error information', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid client credentials'
      });

      await authService.exchangeCodeForToken('test_code');

      expect(consoleSpy).toHaveBeenCalledWith(
        'AniList token exchange failed:',
        expect.objectContaining({
          status: 401,
          statusText: 'Unauthorized',
          body: 'Invalid client credentials'
        })
      );
      
      consoleSpy.mockRestore();
    });
  });
});