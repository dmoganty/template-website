import { NextResponse } from 'next/server';

interface IMEIValidationRequest {
  imei: string;
}

interface IMEIValidationResult {
  isValid: boolean;
  message: string;
  details: {
    length: boolean;
    checksim: boolean;
    format: boolean;
  };
  deviceInfo?: {
    tac: string;
    serialNumber: string;
    checkDigit: string;
    formatted: string;
  };
}

// IMEI validation using Luhn algorithm
function validateIMEI(imeiNumber: string): IMEIValidationResult {
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
    
    // Format IMEI with spaces for better readability: XX XXXXXX XXXXXX X
    const formatted = `${cleanIMEI.substring(0, 2)} ${cleanIMEI.substring(2, 8)} ${cleanIMEI.substring(8, 14)} ${cleanIMEI.substring(14, 15)}`;
    
    return {
      isValid: true,
      message: "Valid IMEI number! This device can be authenticated.",
      details,
      deviceInfo: {
        tac: cleanIMEI.substring(0, 8), // Type Allocation Code
        serialNumber: cleanIMEI.substring(8, 14),
        checkDigit: cleanIMEI.substring(14, 15),
        formatted
      }
    };
  } else {
    return {
      isValid: false,
      message: `Invalid IMEI checksim. Expected check digit: ${calculatedCheckDigit}, got: ${actualCheckDigit}`,
      details
    };
  }
}

export async function POST(request: Request) {
  try {
    const body: IMEIValidationRequest = await request.json();
    
    if (!body.imei) {
      return NextResponse.json({
        success: false,
        error: "IMEI number is required"
      }, { status: 400 });
    }

    const validationResult = validateIMEI(body.imei);
    
    return NextResponse.json({
      success: true,
      data: validationResult
    });
  } catch (error) {
    console.error('Error validating IMEI:', error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to validate IMEI"
    }, { status: 500 });
  }
}

export async function GET() {
  // Provide information about IMEI validation
  return NextResponse.json({
    success: true,
    info: {
      description: "IMEI Validation API",
      usage: "POST /api/imei-validation with { imei: 'your-imei-number' }",
      validation: {
        algorithm: "Luhn Algorithm",
        requirements: [
          "Exactly 15 digits",
          "Numeric characters only",
          "Valid checksim"
        ]
      },
      examples: {
        valid: "123456789012345",
        invalid: "123456789012340"
      }
    }
  });
}
