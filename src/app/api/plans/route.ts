/**
 * API Route: /api/plans
 * Fetches plan cards from Strapi and returns them in a normalized structure.
 *
 * Best Practices Implemented:
 * - Type safety for Strapi response and API output
 * - JSDoc documentation
 * - Improved error logging
 * - Security TODO for future review
 * - No changes to API logic, UI, or CSS
 */
import { NextResponse } from 'next/server';
import { fetchFromStrapi } from '@/lib/strapi';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Type for a single plan card object from Strapi
 */
interface PlanCard {
  // Define properties as per Strapi response structure
  [key: string]: any;
}

/**
 * Type for Strapi response
 */
interface StrapiPlanResponse {
  data?: {
    cards?: PlanCard[];
    ttl?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Type for API response
 */
interface ApiResponse {
  success: boolean;
  data?: {
    data: PlanCard[];
    title: string;
  };
  error?: string;
}

/**
 * GET handler for /api/plans
 * @returns {NextResponse<ApiResponse>} JSON response with plans data or error
 */
export async function GET() {
  try {
    // Fetch plan cards from Strapi
    const data: StrapiPlanResponse = await fetchFromStrapi('/plan-card?&populate=*');

    // Transform the data using the new response structure
    const transformedPlans: PlanCard[] = data.data?.cards || [];

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        data: transformedPlans,
        title: data.data?.ttl || 'Our Service Plans',
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
    console.error('[API][plans][GET] Error fetching plans data:', error);

    // TODO: Review for sensitive error exposure before production
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch plans data from Strapi',
    }, { status: 500 });
  }
}
// TODO: Review this API for security and data exposure before production deployment.
