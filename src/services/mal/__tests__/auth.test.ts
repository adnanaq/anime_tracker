import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables before any imports
vi.hoisted(() => {
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_MAL_CLIENT_ID: 'test_client_id',
      VITE_MAL_CLIENT_SECRET: 'test_client_secret',
      DEV: true
    },
    writable: true
  });
});

import { MalAuthService } from '../auth';
import { AuthToken } from '../../shared/authTypes';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto.getRandomValues
const mockGetRandomValues = vi.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: mockGetRandomValues,
  },
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});


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

describe('MalAuthService', () => {
  let authService: MalAuthService;
  const mockToken: AuthToken = {
    access_token: 'mock_access_token',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'mock_refresh_token'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new MalAuthService();

    // Mock crypto.getRandomValues to return predictable values
    mockGetRandomValues.mockImplementation((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = i % 64; // Predictable values for testing
      }
      return array;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initiateLogin', () => {
    it('should generate proper authorization URL with PKCE', async () => {
      const authUrl = await authService.initiateLogin();
      
      expect(authUrl).toContain('https://myanimelist.net/v1/oauth2/authorize');
      expect(authUrl).toContain('client_id=test_client_id');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('redirect_uri=http://localhost:3000/auth/mal/callback');
      expect(authUrl).toContain('code_challenge_method=plain');
      expect(authUrl).toContain('code_challenge=');
      expect(authUrl).toContain('state=');
    });

    it('should store code verifier in localStorage', async () => {
      await authService.initiateLogin();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'mal_code_verifier',
        expect.any(String)
      );
    });

    it('should generate code verifier with correct length', async () => {
      await authService.initiateLogin();
      
      const setItemCall = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === 'mal_code_verifier'
      );
      const codeVerifier = setItemCall?.[1];
      
      expect(codeVerifier).toBeDefined();
      expect(typeof codeVerifier).toBe('string');
      expect(codeVerifier.length).toBe(43);
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

    it('should use plain code challenge method', async () => {
      const authUrl = await authService.initiateLogin();
      
      const url = new URL(authUrl);
      expect(url.searchParams.get('code_challenge_method')).toBe('plain');
      
      // Code challenge should equal code verifier for plain method
      const codeChallenge = url.searchParams.get('code_challenge');
      const setItemCall = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === 'mal_code_verifier'
      );
      const codeVerifier = setItemCall?.[1];
      
      expect(codeChallenge).toBe(codeVerifier);
    });

    it('should handle errors during URL generation', async () => {
      // Mock crypto.getRandomValues to throw an error
      mockGetRandomValues.mockImplementationOnce(() => {
        throw new Error('Crypto error');
      });
      
      await expect(authService.initiateLogin()).rejects.toThrow();
    });
  });

  describe('exchangeCodeForToken', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'mal_code_verifier') {
          return 'test_code_verifier';
        }
        return null;
      });
    });

    it('should successfully exchange authorization code for token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      const result = await authService.exchangeCodeForToken('test_code');

      expect(result).toEqual(mockToken);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3002/mal/oauth/token',
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

    it('should include all required parameters including code verifier', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      await authService.exchangeCodeForToken('test_code');

      const callArgs = mockFetch.mock.calls[0];
      const body = callArgs[1].body;
      
      expect(body).toContain('grant_type=authorization_code');
      expect(body).toContain('client_id=test_client_id');
      expect(body).toContain('client_secret=test_client_secret');
      expect(body).toContain('code=test_code');
      expect(body).toContain('redirect_uri=http://localhost:3000/auth/mal/callback');
      expect(body).toContain('code_verifier=test_code_verifier');
    });

    it('should retrieve code verifier from localStorage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      await authService.exchangeCodeForToken('test_code');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('mal_code_verifier');
    });

    it('should throw error if code verifier is missing', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      await expect(authService.exchangeCodeForToken('test_code')).rejects.toThrow(
        'MAL code verifier not found'
      );
    });

    it('should clean up code verifier after successful exchange', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      await authService.exchangeCodeForToken('test_code');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('mal_code_verifier');
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
        'http://localhost:3002/mal/oauth/token',
        expect.any(Object)
      );
    });

    it('should use production URL in non-dev environment', async () => {
      import.meta.env.DEV = false;
      const prodAuthService = new MalAuthService();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      await prodAuthService.exchangeCodeForToken('test_code');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://myanimelist.net/v1/oauth2/token',
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
        'mal-test_code',
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

    it('should not clean up code verifier on failed exchange', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid code'
      });

      await authService.exchangeCodeForToken('invalid_code');

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('generateCodeVerifier', () => {
    it('should generate code verifier with valid characters', async () => {
      await authService.initiateLogin();
      
      const setItemCall = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === 'mal_code_verifier'
      );
      const codeVerifier = setItemCall?.[1] as string;
      
      // Should only contain base64url characters
      const validChars = /^[A-Za-z0-9\-_]+$/;
      expect(validChars.test(codeVerifier)).toBe(true);
    });

    it('should use crypto.getRandomValues for secure generation', async () => {
      await authService.initiateLogin();
      
      expect(mockGetRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
      expect(mockGetRandomValues.mock.calls[0][0].length).toBe(43);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('test_code_verifier');
    });

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
        'MAL token exchange failed:',
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