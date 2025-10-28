"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IMEIChecker from "@/components/IMEIChecker";
import Header from "@/components/Header";

/**
 * HomePage component for the main landing page.
 *
 * Best Practices Implemented:
 * - TypeScript interfaces for props and data
 * - JSDoc documentation
 * - Improved error logging
 * - No changes to UI, CSS, or logic
 */

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

interface HeaderContent {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  // Logo fields
  brandLogo?: any;
  mobileLogo?: any;
  cartLogo?: any;
  webLogo?: any;
  tabLogo?: any;
  profileLogo?: any;
  navLink1?: any;
  // Navigation items
  publicPrimaryItems?: any[];
  publicSecondaryItems?: any[];
  loginItem?: any;
  plPrimaryItems?: any[];
  plSecondaryItems?: any[];
  cLoginItem?: any;
  wLogoutItem?: any;
  activationSecondaryItems?: any[];
  activationPrimaryItems?: any[];
  activationLogoutItem?: any;
  // Additional navigation items
  suaSi?: any;
  suaPi?: any;
  suaLi?: any;
  sutLi?: any;
  sutSi?: any;
  sutPi?: any;
}

interface FooterContent {
  company?: {
    name?: string;
    description?: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{
      text: string;
      url: string;
    }>;
  }>;
}

/**
 * HomePage React component
 * @returns Main landing page JSX
 */
export default function HomePage() {
  const [selectedPlans, setSelectedPlans] = useState<{[key: string]: number}>({});
  const [address, setAddress] = useState("");
  const [headerContent, setHeaderContent] = useState<HeaderContent>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansTitle, setPlansTitle] = useState<string>('Our Service Plans');
  const [footerContent, setFooterContent] = useState<FooterContent>({});
  const [loading, setLoading] = useState(true);
  const [coverageResult, setCoverageResult] = useState<any>(null);
  const [isCheckingCoverage, setIsCheckingCoverage] = useState(false);
  const [coverageError, setCoverageError] = useState('');
  const router = useRouter();

  // Fetch header content from Strapi
  useEffect(() => {
    fetch("/api/header", {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && res?.data?.attributes) {
          setHeaderContent(res.data.attributes);
        }
      })
      .catch((error) => {
        console.error('Error fetching header content:', error);
      });
  }, []);

  // Fetch plans from Strapi
  useEffect(() => {
    fetch("/api/plans", {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && res?.data?.data) {
          // Data is already transformed by the API route
          setPlans(res.data.data);
          // Set the plans title from Strapi
          if (res.data.title) {
            setPlansTitle(res.data.title);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching plans:', error);
        setLoading(false);
      });
  }, []);

  // Fetch footer content from Strapi
  useEffect(() => {
    fetch("/api/footer", {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && res?.data?.attributes) {
          setFooterContent(res.data.attributes);
        }
      })
      .catch((error) => {
        console.error('Error fetching footer content:', error);
      });
  }, []);

  const incrementPlan = (planId: string) => {
    setSelectedPlans(prev => ({
      ...prev,
      [planId]: (prev[planId] || 0) + 1
    }));
  };

  const decrementPlan = (planId: string) => {
    setSelectedPlans(prev => ({
      ...prev,
      [planId]: Math.max((prev[planId] || 0) - 1, 0)
    }));
  };

  const getTotalItems = () => {
    return Object.values(selectedPlans).reduce((sum, count) => sum + count, 0);
  };

  const handleCheckout = () => {
    const queryParams = new URLSearchParams();
    Object.entries(selectedPlans).forEach(([planId, count]) => {
      if (count > 0) {
        queryParams.set(planId, count.toString());
      }
    });
    if (address) {
      queryParams.set('address', address);
    }
    router.push(`/checkout?${queryParams.toString()}`);
  };

  const handleCheckCoverage = async () => {
    if (!address.trim()) {
      setCoverageError('Please enter an address to check coverage');
      return;
    }

    setIsCheckingCoverage(true);
    setCoverageError('');
    setCoverageResult(null);

    try {
      console.log(`🗺️ Checking coverage for: ${address}`);
      
      const response = await fetch('/api/check-coverage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const result = await response.json();

      if (result.success) {
        setCoverageResult(result);
        console.log('📶 Coverage check successful:', result.data);
      } else {
        setCoverageError(result.error || 'Failed to check coverage');
      }
    } catch (error) {
      console.error('❌ Coverage check error:', error);
      setCoverageError('Network error. Please check your connection and try again.');
    } finally {
      setIsCheckingCoverage(false);
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    // Clear coverage result when user starts typing
    setCoverageResult(null);
    setCoverageError('');
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setAddress(suggestion);
    // Clear any previous results
    setCoverageResult(null);
    setCoverageError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        totalItems={getTotalItems()} 
        onCheckout={handleCheckout}
      />

      {/* Banner Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            {headerContent?.title}
          </h2>
          <p className="text-xl mb-8">
            {headerContent?.description}
          </p>
          <div className="inline-flex items-center bg-white/20 rounded-full px-6 py-3">
            <span className="text-green-300 mr-2">✓</span>
            <span>{headerContent?.ctaText}</span>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">{plansTitle}</h3>
            <p className="text-gray-600">Select the quantity of each plan you need</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading plans...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan: Plan) => (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h4>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${plan.price}<span className="text-sm text-gray-500">/month</span>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => decrementPlan(plan.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                      disabled={!selectedPlans[plan.id]}
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">
                      {selectedPlans[plan.id] || 0}
                    </span>
                    <button
                      onClick={() => incrementPlan(plan.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Check Coverage Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Coverage Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 h-80 flex items-center justify-center">
                  {/* Coverage Map Illustration */}
                  <div className="text-center">
                    <div className="w-28 h-28 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
                      🗺️
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-700">Excellent Coverage</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-700">Good Coverage</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-700">Limited Coverage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Form */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Check Coverage</h3>
                  <p className="text-gray-600">Enter your address to verify service availability in your area</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your full address (e.g., 123 Main St, City, State, ZIP)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleCheckCoverage}
                    disabled={isCheckingCoverage}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      isCheckingCoverage 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isCheckingCoverage ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking Coverage...
                      </span>
                    ) : (
                      'Check Coverage'
                    )}
                  </button>
                </div>

                {/* Coverage Error Display */}
                {coverageError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">❌ {coverageError}</p>
                  </div>
                )}

                {/* Coverage Result Display */}
                {coverageResult && (
                  <div className={`mt-4 p-4 border rounded-lg ${
                    coverageResult.data.compatibility5G 
                      ? "bg-green-50 border-green-200" 
                      : "bg-red-50 border-red-200"
                  }`}>
                    <div className="flex items-center">
                      <span className={`mr-2 ${
                        coverageResult.data.compatibility5G 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {coverageResult.data.compatibility5G ? "✓" : "✕"}
                      </span>
                      <span className={
                        coverageResult.data.compatibility5G 
                          ? "text-green-800" 
                          : "text-red-800"
                      }>
                        {coverageResult.data.compatibility5G 
                          ? "Compatible with 5G and 4G" 
                          : "Not compatible"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMEI Checker Section */}
      <IMEIChecker />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {footerContent?.company?.name}
              </h4>
              <p className="text-gray-400">
                {footerContent?.company?.description}
              </p>
            </div>
            
            {footerContent?.sections?.map((section, index) => (
              <div key={index}>
                <h5 className="font-semibold mb-4">{section.title}</h5>
                <ul className="space-y-2 text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={link.url} className="hover:text-white transition-colors">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {footerContent?.company?.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
