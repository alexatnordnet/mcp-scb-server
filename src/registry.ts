import { PxWebAPI } from './types.js';

/**
 * Registry of known PX-Web API endpoints
 * Based on research from pxweb R package and various statistical agencies
 */
export const PX_WEB_API_REGISTRY: Record<string, PxWebAPI> = {
  // Statistics Sweden (SCB)
  scb: {
    id: 'scb',
    name: 'Statistics Sweden',
    baseUrl: 'https://api.scb.se/OV0104/v1/doris',
    languages: ['en', 'sv'],
    rateLimit: {
      calls: 10,
      period: 10000, // 10 seconds
    },
    description: 'Official statistics from Statistics Sweden covering demographics, economy, education, and social indicators',
    country: 'Sweden',
    organization: 'Statistics Sweden (SCB)',
    metadata: {
      maxValues: 110000,
      timezone: 'Europe/Stockholm',
      website: 'https://www.scb.se'
    }
  },

  // Statistics Finland
  statfi: {
    id: 'statfi',
    name: 'Statistics Finland',
    baseUrl: 'https://statfin.stat.fi/PXWeb/api/v1',
    languages: ['en', 'fi', 'sv'],
    rateLimit: {
      calls: 30,
      period: 10000, // 10 seconds
    },
    description: 'Comprehensive Finnish statistics including population, economy, environment, and social data',
    country: 'Finland',
    organization: 'Statistics Finland (Tilastokeskus)',
    metadata: {
      maxValues: 120000,
      timezone: 'Europe/Helsinki',
      website: 'https://www.stat.fi'
    }
  },

  // Statistics Iceland
  statice: {
    id: 'statice',
    name: 'Statistics Iceland',
    baseUrl: 'http://px.hagstofa.is/px/api/v1',
    languages: ['en', 'is'],
    rateLimit: {
      calls: 30,
      period: 1000, // 1 second (stricter)
    },
    description: 'Icelandic national statistics covering population, economy, tourism, and environmental data',
    country: 'Iceland',
    organization: 'Statistics Iceland (Hagstofa Íslands)',
    metadata: {
      maxValues: 10000,
      timezone: 'Atlantic/Reykjavik',
      website: 'https://www.hagstofa.is'
    }
  },

  // Statistics Faroe Islands
  hagstova: {
    id: 'hagstova',
    name: 'Statistics Faroe Islands',
    baseUrl: 'http://statbank.hagstova.fo/PXWeb/api/v1',
    languages: ['en', 'fo', 'da'],
    rateLimit: {
      calls: 10,
      period: 10000,
    },
    description: 'Statistical data from the Faroe Islands covering demographics, economy, and fisheries',
    country: 'Faroe Islands',
    organization: 'Statistics Faroe Islands (Hagstova Føroya)',
    metadata: {
      maxValues: 10000,
      timezone: 'Atlantic/Faroe',
      website: 'https://www.hagstova.fo'
    }
  },

  // Statistics Greenland
  greenland: {
    id: 'greenland',
    name: 'Statbank Greenland',
    baseUrl: 'https://bank.stat.gl/api/v1',
    languages: ['en', 'kl', 'da'],
    rateLimit: {
      calls: 10000,
      period: 10000,
    },
    description: 'Greenlandic statistics including population, economy, environment, and arctic data',
    country: 'Greenland',
    organization: 'Statistics Greenland',
    metadata: {
      maxValues: 1000000,
      timezone: 'America/Godthab',
      website: 'https://stat.gl'
    }
  }
};

/**
 * Get API configuration by ID
 */
export function getApiConfig(apiId: string): PxWebAPI | null {
  return PX_WEB_API_REGISTRY[apiId] || null;
}

/**
 * Get all available API IDs
 */
export function getAvailableApis(): string[] {
  return Object.keys(PX_WEB_API_REGISTRY);
}

/**
 * Get APIs by country
 */
export function getApisByCountry(country: string): PxWebAPI[] {
  return Object.values(PX_WEB_API_REGISTRY).filter(
    api => api.country?.toLowerCase() === country.toLowerCase()
  );
}

/**
 * Get APIs that support a specific language
 */
export function getApisByLanguage(language: string): PxWebAPI[] {
  return Object.values(PX_WEB_API_REGISTRY).filter(
    api => api.languages.includes(language.toLowerCase())
  );
}

/**
 * Search APIs by name or description
 */
export function searchApis(query: string): PxWebAPI[] {
  const searchTerm = query.toLowerCase();
  return Object.values(PX_WEB_API_REGISTRY).filter(
    api => 
      api.name.toLowerCase().includes(searchTerm) ||
      api.description.toLowerCase().includes(searchTerm) ||
      api.country?.toLowerCase().includes(searchTerm)
  );
}

/**
 * Create a custom API configuration
 */
export function createCustomApiConfig(
  id: string,
  baseUrl: string,
  options: Partial<PxWebAPI> = {}
): PxWebAPI {
  return {
    id,
    name: options.name || `Custom PX-Web API (${id})`,
    baseUrl,
    languages: options.languages || ['en'],
    rateLimit: options.rateLimit || { calls: 10, period: 10000 },
    description: options.description || 'Custom PX-Web compatible API endpoint',
    country: options.country,
    organization: options.organization,
    metadata: options.metadata
  };
}
