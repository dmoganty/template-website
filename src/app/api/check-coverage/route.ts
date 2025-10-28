import { NextResponse } from 'next/server';

interface CoverageCheckRequest {
  address: string;
}

interface CoverageCheckResult {
  status: string;
  data: {
    msg: string;
    signal5g: string;
    signal4g: string;
    isValid: boolean;
    mode: string;
    wifiCalling: string;
    wfcCompatible: boolean;
    volteCompatible: boolean;
    compatibility5G: boolean;
    cdmaLess: string;
    hdVoice: string;
    lostOrStolen: string;
    inProgress: boolean;
    isLocked: string;
    filteredDevice: string;
    compatibleFuture: boolean;
    esimAvailable: boolean;
    psimAvailable: boolean;
    brandCoverage: boolean;
    refNumbers: string[];
    preLoadedValid: boolean;
    tradeInEnable: boolean;
    fiberValid: boolean;
    compatibility5g: boolean;
  };
}

// Mock coverage check function - simulates checking coverage for an address
function checkCoverage(address: string): CoverageCheckResult {
  // Simulate different coverage scenarios based on address keywords
  const addressLower = address.toLowerCase();
  
  // Mock different coverage scenarios
  let coverage5g = false;
  let signal5g = "poor";
  let signal4g = "good";
  let msg = "fair";
  
  // Better coverage for urban areas
  if (addressLower.includes('new york') || addressLower.includes('los angeles') || 
      addressLower.includes('chicago') || addressLower.includes('houston') ||
      addressLower.includes('city') || addressLower.includes('downtown')) {
    coverage5g = true;
    signal5g = "excellent";
    signal4g = "excellent";
    msg = "excellent";
  }
  // Good coverage for suburban areas
  else if (addressLower.includes('suburb') || addressLower.includes('avenue') || 
           addressLower.includes('street') || addressLower.includes('road')) {
    coverage5g = Math.random() > 0.3; // 70% chance of 5G
    signal5g = coverage5g ? "good" : "poor";
    signal4g = "good";
    msg = "good";
  }
  // Poor coverage for rural areas
  else if (addressLower.includes('rural') || addressLower.includes('farm') || 
           addressLower.includes('mountain') || addressLower.includes('valley')) {
    coverage5g = false;
    signal5g = "poor";
    signal4g = "fair";
    msg = "fair";
  }
  // Default coverage
  else {
    coverage5g = Math.random() > 0.5; // 50% chance of 5G
    signal5g = coverage5g ? "good" : "fair";
    signal4g = "good";
    msg = coverage5g ? "good" : "fair";
  }

  return {
    status: "SUCCESS",
    data: {
      msg,
      signal5g,
      signal4g,
      isValid: true,
      mode: "NA",
      wifiCalling: "Available",
      wfcCompatible: true,
      volteCompatible: true,
      compatibility5G: coverage5g,
      cdmaLess: "NA",
      hdVoice: "Available",
      lostOrStolen: "NA",
      inProgress: false,
      isLocked: "No",
      filteredDevice: "NA",
      compatibleFuture: coverage5g,
      esimAvailable: true,
      psimAvailable: true,
      brandCoverage: true,
      refNumbers: [],
      preLoadedValid: false,
      tradeInEnable: false,
      fiberValid: Math.random() > 0.6, // 40% chance of fiber
      compatibility5g: coverage5g
    }
  };
}

export async function POST(request: Request) {
  try {
    const body: CoverageCheckRequest = await request.json();
    
    if (!body.address || body.address.trim().length < 5) {
      return NextResponse.json({
        success: false,
        error: "Please provide a valid address (minimum 5 characters)"
      }, { status: 400 });
    }

    console.log(`🗺️ Coverage check for address: ${body.address}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const coverageResult = checkCoverage(body.address);
    
    console.log(`📶 Coverage result for ${body.address}:`, {
      signal5g: coverageResult.data.signal5g,
      compatibility5G: coverageResult.data.compatibility5G,
      msg: coverageResult.data.msg
    });
    
    return NextResponse.json({
      success: true,
      address: body.address,
      ...coverageResult
    });
  } catch (error) {
    console.error('❌ Error checking coverage:', error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to check coverage. Please try again."
    }, { status: 500 });
  }
}

export async function GET() {
  // Provide information about coverage check API
  return NextResponse.json({
    success: true,
    info: {
      description: "Coverage Check API",
      usage: "POST /api/check-coverage with { address: 'your-address' }",
      features: [
        "5G and 4G signal strength analysis",
        "Coverage compatibility check", 
        "WiFi calling availability",
        "VoLTE support verification",
        "eSIM and pSIM availability"
      ],
      responseFields: {
        compatibility5G: "Boolean indicating 5G network compatibility",
        signal5g: "5G signal strength (poor/fair/good/excellent)",
        signal4g: "4G signal strength (poor/fair/good/excellent)",
        msg: "Overall coverage quality",
        wfcCompatible: "WiFi calling compatibility",
        volteCompatible: "VoLTE service compatibility"
      },
      examples: {
        urbanArea: "New York, NY 10001 - Excellent 5G coverage",
        suburbanArea: "123 Main Street, Suburb City - Good coverage",
        ruralArea: "Rural Route 1, Countryside - Limited 5G"
      }
    }
  });
}