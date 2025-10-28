"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Header component for displaying navigation and branding.
 *
 * Best Practices Implemented:
 * - TypeScript interfaces for props and data
 * - JSDoc documentation
 * - Improved error logging
 * - No changes to UI, CSS, or logic
 */

interface NavigationItem {
  id?: number;
  itemName?: string;
  navigationPath?: string;
  isNewWindow?: boolean;
  ga_tagName?: string;
  is_gaEventReqd?: boolean;
  subMenu?: NavigationItem[];
}

interface HeaderData {
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
  publicPrimaryItems?: NavigationItem[];
  publicSecondaryItems?: NavigationItem[];
  loginItem?: any;
  plPrimaryItems?: NavigationItem[];
  plSecondaryItems?: NavigationItem[];
  cLoginItem?: any;
  wLogoutItem?: any;
  activationSecondaryItems?: NavigationItem[];
  activationPrimaryItems?: NavigationItem[];
  activationLogoutItem?: any;
  // Additional navigation items
  suaSi?: any;
  suaPi?: any;
  suaLi?: any;
  sutLi?: any;
  sutSi?: any;
  sutPi?: any;
}

interface HeaderProps {
  totalItems?: number;
  onCheckout?: () => void;
}

/**
 * Header React component
 * @param totalItems - Number of items in cart
 * @param onCheckout - Callback for checkout action
 */
export default function Header({ totalItems = 0, onCheckout }: HeaderProps) {
  const [headerData, setHeaderData] = useState<HeaderData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/header")
      .then((res) => res.json())
      .then((res) => {
        console.log('🔍 Header API Response:', res);
        if (res?.success && res?.data?.attributes) {
          setHeaderData(res.data.attributes);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching header content:', error);
        setLoading(false);
      });
  }, []);

  const renderNavigationItem = (item: NavigationItem, index: number) => {
    // Use the correct field names from Strapi data
    const label = item?.itemName || `Menu Item ${index + 1}`;
    const url = item?.navigationPath || '#';
    const target = item?.isNewWindow ? '_blank' : '_self';
    const subMenu = item?.subMenu;

    // If no URL or null URL, render as non-clickable text
    if (!url || url === null) {
      return (
        <div key={item?.id || index} className="relative group">
          <span className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-default">
            {label}
          </span>
          
          {/* Dropdown menu for subMenu if exists */}
          {subMenu && subMenu.length > 0 && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                {subMenu.map((subItem: NavigationItem, subIndex: number) => {
                  const subLabel = subItem?.itemName || `Sub Item ${subIndex + 1}`;
                  const subUrl = subItem?.navigationPath || '#';
                  const subTarget = subItem?.isNewWindow ? '_blank' : '_self';
                  
                  return (
                    <Link
                      key={subItem?.id || subIndex}
                      href={subUrl}
                      target={subTarget}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                    >
                      {subLabel}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item?.id || index} className="relative group">
        <Link
          href={url}
          target={target}
          className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
        >
          {label}
        </Link>
        
        {/* Dropdown menu for subMenu if exists */}
        {subMenu && subMenu.length > 0 && (
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-1">
              {subMenu.map((subItem: NavigationItem, subIndex: number) => {
                const subLabel = subItem?.itemName || `Sub Item ${subIndex + 1}`;
                const subUrl = subItem?.navigationPath || '#';
                const subTarget = subItem?.isNewWindow ? '_blank' : '_self';
                
                return (
                  <Link
                    key={subItem?.id || subIndex}
                    href={subUrl}
                    target={subTarget}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                  >
                    {subLabel}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="animate-pulse h-8 bg-gray-200 rounded w-32"></div>
            <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {headerData?.subtitle || "ServicePro"}
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            {headerData?.publicPrimaryItems && headerData.publicPrimaryItems.length > 0 ? (
              headerData.publicPrimaryItems.map((item, index) => 
                renderNavigationItem(item, index)
              )
            ) : (
              // Fallback navigation if no data from Strapi
              <>
                <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Home
                </Link>
                <Link href="/plans" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Plans
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  About
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Contact
                </Link>
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Checkout button */}
            {totalItems > 0 && onCheckout && (
              <button
                onClick={onCheckout}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Checkout ({totalItems})
              </button>
            )}
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden border-t border-gray-200 py-4">
          <div className="flex flex-col space-y-2">
            {headerData?.publicPrimaryItems && headerData.publicPrimaryItems.length > 0 ? (
              headerData.publicPrimaryItems.map((item, index) => {
                const label = item?.itemName || `Menu Item ${index + 1}`;
                const url = item?.navigationPath || '#';
                const target = item?.isNewWindow ? '_blank' : '_self';
                
                // If no URL or null URL, render as non-clickable text for mobile
                if (!url || url === null) {
                  return (
                    <span
                      key={item?.id || index}
                      className="text-gray-700 block px-3 py-2 rounded-md text-base font-medium cursor-default"
                    >
                      {label}
                    </span>
                  );
                }
                
                return (
                  <Link
                    key={item?.id || index}
                    href={url}
                    target={target}
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    {label}
                  </Link>
                );
              })
            ) : (
              // Fallback mobile navigation
              <>
                <Link href="/" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">
                  Home
                </Link>
                <Link href="/plans" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">
                  Plans
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">
                  About
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">
                  Contact
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
