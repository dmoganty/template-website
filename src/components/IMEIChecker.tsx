"use client";

import { useState } from "react";

interface IMEIValidationResult {
  isValid: boolean;
  message: string;
  details?: {
    length: boolean;
    checksim: boolean;
    format: boolean;
  };
}

export default function IMEIChecker() {
  const [imei, setImei] = useState("");
  const [validationResult, setValidationResult] = useState<IMEIValidationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // IMEI validation using Luhn algorithm
  const validateIMEI = (imeiNumber: string): IMEIValidationResult => {
    // Remove any spaces, dashes, or other non-numeric characters
    const cleanIMEI = imeiNumber.replace(/\D/g, '');
    
    const details = {
      length: false,
      checksim: false,
      format: false
    };

    // Check if IMEI is exactly 15 digits
    if (cleanIMEI.length !== 15) {
      return {
        isValid: false,
        message: `IMEI must be exactly 15 digits. Current length: ${cleanIMEI.length}`,
        details
      };
    }
    details.length = true;

    // Check if all characters are numeric
    if (!/^\d{15}$/.test(cleanIMEI)) {
      return {
        isValid: false,
        message: "IMEI must contain only numeric digits",
        details
      };
    }
    details.format = true;

    // Validate using Luhn algorithm (used for IMEI validation)
    const digits = cleanIMEI.split('').map(Number);
    let sum = 0;

    // Process digits from right to left (excluding the last check digit)
    for (let i = 0; i < 14; i++) {
      let digit = digits[i];
      
      // Double every second digit from the right
      if ((14 - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }

    // Calculate check digit
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    const actualCheckDigit = digits[14];

    if (calculatedCheckDigit === actualCheckDigit) {
      details.checksim = true;
      return {
        isValid: true,
        message: "Valid IMEI number! This device can be authenticated.",
        details
      };
    } else {
      return {
        isValid: false,
        message: `Invalid IMEI checksim. Expected check digit: ${calculatedCheckDigit}, got: ${actualCheckDigit}`,
        details
      };
    }
  };

  const handleIMEICheck = async () => {
    if (!imei.trim()) {
      setValidationResult({
        isValid: false,
        message: "Please enter an IMEI number",
        details: { length: false, checksim: false, format: false }
      });
      return;
    }

    setIsChecking(true);
    
    try {
      // Try server-side validation first for enhanced features
      const response = await fetch('/api/imei-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imei }),
      });

      if (response.ok) {
        const apiResult = await response.json();
        if (apiResult.success && apiResult.data) {
          setValidationResult(apiResult.data);
          setIsChecking(false);
          return;
        }
      }
      
      // Fallback to client-side validation if API fails
      console.log('Using client-side validation as fallback');
      const result = validateIMEI(imei);
      setValidationResult(result);
    } catch (error) {
      console.error('Error during IMEI validation:', error);
      // Fallback to client-side validation
      const result = validateIMEI(imei);
      setValidationResult(result);
    }
    
    setIsChecking(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers, spaces, and dashes for better UX
    const sanitized = value.replace(/[^\d\s-]/g, '');
    
    // Extract only digits to check length
    const digitsOnly = sanitized.replace(/\D/g, '');
    
    // Limit to 15 digits maximum
    if (digitsOnly.length <= 15) {
      setImei(sanitized);
    }
    
    // Clear previous validation when user starts typing
    if (validationResult) {
      setValidationResult(null);
    }
  };

  const formatIMEI = (value: string) => {
    // Format IMEI with spaces for better readability: XX XXXXXX XXXXXX X
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{6})(\d{6})(\d{1})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
    return value;
  };

  return (
    <section className="py-12 bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* IMEI Form */}
          <div className="order-1 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg p-6 h-80 flex flex-col justify-center">
              <div className="mb-4">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">IMEI Validation</h3>
                <p className="text-gray-600">Verify your device&apos;s IMEI number to check if it&apos;s valid and can be authenticated</p>
              </div>
              <div className="space-y-4 mb-4">
                <div>
                  <label htmlFor="imei" className="block text-sm font-medium text-gray-700 mb-2">
                    IMEI Number (15 digits)
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1">
                      <input
                        id="imei"
                        type="text"
                        placeholder="Enter IMEI (e.g., 123456789012345)"
                        value={imei}
                        onChange={handleInputChange}
                        maxLength={17} // 15 digits + minimal formatting
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-mono h-12"
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        <p>📱 Find your IMEI by dialing *#06# on your device</p>
                        {validationResult && (
                          <p className={`mt-1 font-medium ${
                            validationResult.isValid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {validationResult.isValid ? '✓ Valid IMEI' : '✗ Invalid IMEI'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:mt-0">
                      <button
                        onClick={handleIMEICheck}
                        disabled={isChecking || !imei.trim()}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition-colors whitespace-nowrap font-semibold h-12 flex items-center justify-center"
                      >
                        {isChecking ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Validating...
                          </span>
                        ) : (
                          "Validate IMEI"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* IMEI Image */}
          <div className="order-2 lg:order-2">
            <div className="relative h-80">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-6 h-full flex items-center justify-center">
                {/* IMEI/Phone Illustration */}
                <div className="text-center">
                  <div className="w-32 h-48 mx-auto mb-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center relative shadow-2xl">
                    {/* Phone Screen */}
                    <div className="w-24 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-xl mb-2">📱</div>
                        <div className="text-xs font-mono bg-black bg-opacity-20 rounded px-2 py-1">
                          *#06#
                        </div>
                        <div className="text-xs mt-2 font-mono">
                          123456789012345
                        </div>
                      </div>
                    </div>
                    {/* Phone Home Button */}
                    <div className="absolute bottom-3 w-6 h-6 bg-gray-700 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Valid IMEI Detection</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Luhn Algorithm Check</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Device Authentication</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
