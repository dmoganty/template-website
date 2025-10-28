/**
 * Utility functions for Strapi API calls
 *
 * Best Practices Implemented:
 * - TypeScript interfaces for Strapi data
 * - JSDoc documentation
 * - Improved error logging
 * - Security TODO for future review
 * - No changes to API logic, UI, or CSS
 */

// Import RequestInit type for fetch options
// Use the built-in RequestInit type from the DOM lib for fetch options
// @ts-ignore: RequestInit is available in the global lib for Next.js/TypeScript
import type { RequestInit } from 'node-fetch';

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://192.168.236.105:1337/api';

/**
 * Generic Strapi API response type
 */
export interface StrapiResponse<T = any> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Strapi item type
 */
export interface StrapiItem {
  id: number;
  attributes: Record<string, any>;
}

/**
 * Fetch data from Strapi API with enhanced error handling and logging
 * @param endpoint - Strapi API endpoint
 * @param options - Fetch options
 * @returns JSON response from Strapi
 */
export async function fetchFromStrapi(endpoint: string, options?: RequestInit): Promise<any> {
  const url = `${STRAPI_BASE_URL}${endpoint}`;
  
  // Enhanced logging for debugging
  console.log('\n======================================');
  console.log('🚀 STRAPI API CALL DEBUG');
  console.log('======================================');
  console.log('📍 Base URL:', STRAPI_BASE_URL);
  console.log('🔗 Endpoint:', endpoint);
  console.log('🌐 Full URL:', url);
  console.log('🔑 Token Present:', !!process.env.STRAPI_API_TOKEN);
  console.log('🔑 Token Value:', process.env.STRAPI_API_TOKEN ? 
    process.env.STRAPI_API_TOKEN.substring(0, 10) + '...' : 'NOT_SET');
  console.log('🖥️  Server Side:', typeof window === 'undefined');
  console.log('======================================\n');

  const defaultHeaders: Record<string, string> = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-IN,en;q=0.9,en-US;q=0.8,te;q=0.7',
    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
  };

  // Don't add authorization header for public endpoints
  const isPublicEndpoint = endpoint.includes('/T1-header') || endpoint.includes('/about');
  
  // Add authorization header only if token is available, we're on server-side, and it's not a public endpoint
  if (process.env.STRAPI_API_TOKEN && typeof window === 'undefined' && !isPublicEndpoint && process.env.STRAPI_API_TOKEN !== '') {
    defaultHeaders['Authorization'] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
  }

  console.log('🔐 Public Endpoint Check:', isPublicEndpoint);
  console.log('🔐 Authorization Header Added:', !isPublicEndpoint && !!process.env.STRAPI_API_TOKEN);
  
  // Add timeout and better error handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json, text/plain, */*',
        ...defaultHeaders,
        ...options?.headers,
      },
      cache: 'no-store',
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    console.log('📡 Response1:', response);
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response body:', errorText);
      throw new Error(`Strapi API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const jsonData = await response.json();
    return jsonData;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Strapi API request timed out after 10 seconds');
    }
    
    throw error;
  }
}

/**
 * Transform Strapi plan data to Plan interface
 * @param strapiItem - Strapi item
 * @returns Normalized plan object
 */
export function transformStrapiPlan(strapiItem: StrapiItem) {
  const attributes = strapiItem.attributes;
  return {
    id: strapiItem.id?.toString() || attributes?.slug,
    name: attributes?.name || attributes?.title,
    price: attributes?.price || attributes?.monthly_price,
    description: attributes?.description || attributes?.short_description,
    features: attributes?.features || attributes?.feature_list || []
  };
}

/**
 * Transform Strapi header data
 * @param strapiData - Strapi header data
 * @returns Normalized header object
 */
export function transformStrapiHeader(strapiData: any) {
  // Handle the new response structure from /about endpoint
  const data = strapiData || {};
  console.log(data,"data1234")
  return {
    title: data?.title,
    subtitle: data?.subtitle,
    description: data?.desc,
    ctaText: data?.btn,
    // Additional logo and navigation data
    brandLogo: data?.brand_logo,
    mobileLogo: data?.mobile_logo,
    cartLogo: data?.cart_logo,
    webLogo: data?.web_logo,
    tabLogo: data?.tab_logo,
    profileLogo: data?.profile_logo,
    navLink1: data?.nav_link1,
    // Navigation items
    publicPrimaryItems: data?.public_primary_items,
    publicSecondaryItems: data?.public_secondary_items,
    loginItem: data?.login_item,
    plPrimaryItems: data?.pl_primary_items,
    plSecondaryItems: data?.pl_secondary_items,
    cLoginItem: data?.c_login_item,
    wLogoutItem: data?.w_logout_item,
    activationSecondaryItems: data?.activation_secondary_items,
    activationPrimaryItems: data?.activation_primary_items,
    activationLogoutItem: data?.activation_logout_item,
    // Additional navigation items
    suaSi: data?.s_u_a_s_i,
    suaPi: data?.s_u_a_p_i,
    suaLi: data?.s_u_a_l_i,
    sutLi: data?.s_u_t_l_i,
    sutSi: data?.s_u_t_s_i,
    sutPi: data?.s_u_t_p_i
  };
}

/**
 * Transform Strapi footer data
 * @param strapiData - Strapi footer data
 * @returns Normalized footer object
 */
export function transformStrapiFooter(strapiData: any) {
  const attributes = strapiData?.attributes || strapiData;
  return {
    company: {
      name: attributes?.company_name || attributes?.brand_name,
      description: attributes?.company_description || attributes?.tagline
    },
    sections: attributes?.footer_sections || []
  };
}

// TODO: Review Strapi utility functions for security and data exposure before production deployment.
