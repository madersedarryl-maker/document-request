import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Local storage keys for runtime configuration if env variables are not injected yet
const STORAGE_URL_KEY = 'sdr_supabase_url';
const STORAGE_KEY_KEY = 'sdr_supabase_anon_key';

export const getSupabaseConfig = () => {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  const url = (customUrl || envUrl || '').trim();
  const anonKey = (customKey || envAnonKey || '').trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http')),
  };
};

let activeClient: SupabaseClient | null = null;

const createNewClientInstance = (): SupabaseClient => {
  const config = getSupabaseConfig();
  const validUrl = config.url && config.url.startsWith('http') ? config.url : 'https://placeholder.supabase.co';
  const validKey = config.anonKey || 'placeholder-anon-key';

  return createClient(validUrl, validKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
};

export const getActiveSupabaseClient = (): SupabaseClient => {
  if (!activeClient) {
    activeClient = createNewClientInstance();
  }
  return activeClient;
};

export const saveCustomSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
  // Re-instantiate client immediately
  activeClient = createNewClientInstance();
};

export const clearCustomSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
  activeClient = createNewClientInstance();
};

// Export a proxy so any `supabase.<method>` or property access always routes to the up-to-date client instance
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getActiveSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

/**
 * Validates connection with Supabase by performing a lightweight query and auth ping
 */
export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  hasSchema?: boolean;
}> => {
  try {
    const activeConfig = getSupabaseConfig();
    if (!activeConfig.isConfigured) {
      return {
        connected: false,
        message: 'Supabase URL and Anon Key are not configured yet.',
        hasSchema: false,
      };
    }

    const client = getActiveSupabaseClient();

    // 1. Attempt to query system_settings or document_types table
    const { data, error } = await client.from('system_settings').select('school_name').limit(1);

    if (error) {
      // If table does not exist (relation does not exist error code 42P01 or PGRST204)
      if (
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('relation "public.system_settings"')
      ) {
        return {
          connected: true,
          message: 'Connected to Supabase! However, the database tables have not been created yet. Please copy and run the SQL migration scripts in your Supabase SQL Editor.',
          hasSchema: false,
        };
      }

      // Check if it is an invalid API key / JWT error
      if (error.message?.toLowerCase().includes('jwt') || error.message?.toLowerCase().includes('apikey')) {
        return {
          connected: false,
          message: 'Invalid Anon Key / API key. Please ensure you copied the "anon" public key from Supabase Project Settings -> API.',
          hasSchema: false,
        };
      }

      return {
        connected: false,
        message: error.message || 'Unable to connect to Supabase database.',
        hasSchema: false,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected to Supabase PostgreSQL database!',
      hasSchema: true,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Network error while attempting to connect to Supabase. Check your Project URL.',
      hasSchema: false,
    };
  }
};
