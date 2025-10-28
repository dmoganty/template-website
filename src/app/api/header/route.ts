/**
 * API Route: /api/header
 * Fetches header content from Strapi and returns it in a normalized structure.
 *
 * Best Practices Implemented:
 * - Type safety for Strapi response and API output
 * - JSDoc documentation
 * - Improved error logging
 * - Security TODO for future review
 * - No changes to API logic, UI, or CSS
 */
import { NextResponse } from 'next/server';
import { fetchFromStrapi, transformStrapiHeader } from '@/lib/strapi';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Type for Strapi header response
 */
interface StrapiHeaderResponse {
  data?: any;
  [key: string]: any;
}

/**
 * Type for API response
 */
interface ApiResponse {
  success: boolean;
  source?: string;
  data?: {
    attributes: any;
  };
  error?: string;
}

/**
 * GET handler for /api/header
 * @returns {NextResponse<ApiResponse>} JSON response with header data or error
 */
async function fetchWithRetry(endpoint: string, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${endpoint}`);
      const data = await fetchFromStrapi(endpoint);
      console.log(`✅ Success on attempt ${attempt}`);
      console.log("✅ Success data",data);
      return data;
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

export async function GET() {
  try {
    console.log('🌟 Starting header data fetch from Strapi');
    
    // Try to fetch from Strapi with retry logic
    const data: StrapiHeaderResponse = await fetchWithRetry('/about?&populate=*');
    
    console.log('🎉 Successfully fetched header data from Strapi');
    console.log('🔍 Raw Strapi data structure:', JSON.stringify(data, null, 2));
    
    const transformedData = transformStrapiHeader(data.data);
    console.log('✨ Transformed header data:', JSON.stringify(transformedData, null, 2));
    
    return NextResponse.json<ApiResponse>({
      success: true,
      source: 'strapi',
      data: {
        attributes: transformedData
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('[API][header][GET] Error fetching header data:', error);
    // TODO: Review for sensitive error exposure before production
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch header data from Strapi'
    }, { status: 500 });
  }
}
// TODO: Review this API for security and data exposure before production deployment.
