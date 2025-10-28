# Service Plans Application

A Next.js application for selecting service plans and completing checkout with amount calculation, integrated with Strapi CMS for dynamic content management.

## Features

### Homepage
- **Dynamic Banner Section**: Content fetched from Strapi CMS with customizable title, description, and CTA text
- **Dynamic Plans Section**: Service plans loaded from Strapi with:
  - Plan details and pricing from CMS
  - Increment/decrement buttons for quantity selection
  - Real-time quantity tracking
  - Fallback to default plans if API fails
- **Check Coverage Section**: Address input field to verify service availability
- **Dynamic Footer**: Footer content and links managed through Strapi CMS

### Checkout Page
- **Order Summary**: Display selected plans with quantities and pricing
- **Dynamic Calculation**: Automatic calculation of subtotal, tax (8%), and total amount
- **Customer Information Form**: Required fields for name, email, and phone
- **Payment Information**: Credit card input fields
- **Quantity Management**: Ability to modify plan quantities during checkout
- **Responsive Design**: Works on both desktop and mobile devices

### Strapi CMS Integration
- **API Routes**: Server-side API routes for fetching content from Strapi
- **Dynamic Content**: Header, plans, and footer content managed through Strapi
- **Error Handling**: Graceful fallbacks when Strapi API is unavailable
- **Loading States**: User-friendly loading indicators while fetching data
- **Type Safety**: TypeScript interfaces for all Strapi data structures

### Checkout Page
- **Order Summary**: Display selected plans with quantities and pricing
- **Dynamic Calculation**: Automatic calculation of subtotal, tax (8%), and total amount
- **Customer Information Form**: Required fields for name, email, and phone
- **Payment Information**: Credit card input fields
- **Quantity Management**: Ability to modify plan quantities during checkout
- **Responsive Design**: Works on both desktop and mobile devices

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

The application includes the following API endpoints for Strapi integration:

- `GET /api/header` - Fetches header/banner content from Strapi
- `GET /api/plans` - Fetches service plans from Strapi  
- `GET /api/footer` - Fetches footer content and links from Strapi

### Strapi Content Types Expected

The application expects the following content types in Strapi:

1. **T1-header** - Header/banner content with fields:
   - `title` - Main banner title
   - `subtitle` - Brand/company name  
   - `description` - Banner description text
   - `cta_text` - Call-to-action text

2. **service-plans** - Service plans collection with fields:
   - `name` - Plan name
   - `price` - Monthly price
   - `description` - Plan description
   - `features` - Array of feature strings

3. **footer-content** - Footer content with fields:
   - `company_name` - Company name
   - `company_description` - Company description
   - `footer_sections` - Array of footer link sections

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_STRAPI_API_URL=https://cms-common-qa.example.com/api
STRAPI_API_TOKEN=your_strapi_api_token_here
```

**Note**: `STRAPI_API_TOKEN` is optional and only used for authenticated requests on the server-side.

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: State management with useState and useEffect
- **Strapi CMS**: Headless CMS for content management
- **API Routes**: Server-side API endpoints for data fetching

## Project Structure

```
src/
├── app/
│   ├── api/                # API routes for Strapi integration
│   │   ├── header/
│   │   │   └── route.ts    # Header content API
│   │   ├── plans/
│   │   │   └── route.ts    # Plans API
│   │   └── footer/
│   │       └── route.ts    # Footer content API
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage with Strapi integration
│   ├── checkout/
│   │   └── page.tsx        # Checkout page
│   └── globals.css         # Global styles
├── lib/
│   └── strapi.ts           # Strapi utility functions
```

## Usage

1. **Select Plans**: Use the + and - buttons to select quantity for each plan
2. **Enter Address**: Optionally enter your address to check coverage
3. **Checkout**: Click the "Checkout" button when you have items selected
4. **Complete Order**: Fill out customer and payment information to complete the order

## Build for Production

```bash
npm run build
npm start
```

## Contributing

This is a demo application. Feel free to extend it with additional features like:
- Payment processing integration
- User authentication
- Database integration
- Email notifications
- Advanced form validation

