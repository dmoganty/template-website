/**
 * API Route: /api/footer
 * Fetches footer content from Strapi and returns it in a normalized structure.
 *
 * Best Practices Implemented:
 * - Type safety for Strapi response and API output
 * - JSDoc documentation
 * - Improved error logging
 * - Security TODO for future review
 * - No changes to API logic, UI, or CSS
 */
import { NextResponse } from 'next/server';
import { fetchFromStrapi, transformStrapiFooter } from '@/lib/strapi';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Type for Strapi footer response
 */
interface StrapiFooterResponse {
  data?: any;
  [key: string]: any;
}

/**
 * Type for API response
 */
interface ApiResponse {
  success: boolean;
  data?: {
    attributes: any;
  };
  error?: string;
}

/**
 * GET handler for /api/footer
 * @returns {NextResponse<ApiResponse>} JSON response with footer data or error
 */
export async function GET() {
  try {
    const data: StrapiFooterResponse = await fetchFromStrapi('/footer-content?&populate=*');
    const transformedData = transformStrapiFooter(data.data);
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        attributes: transformedData,
      },
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    // Improved error logging for debugging
    console.error('[API][footer][GET] Error fetching footer data:', error);
    // TODO: Review for sensitive error exposure before production
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch footer data from Strapi',
    }, { status: 500 });
  }
}
// TODO: Review this API for security and data exposure before production deployment.
