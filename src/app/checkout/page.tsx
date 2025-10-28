"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 29.99,
    description: "Perfect for individuals"
  },
  {
    id: "premium", 
    name: "Premium Plan",
    price: 59.99,
    description: "Great for small teams"
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: 99.99,
    description: "For large organizations"
  }
];

interface CheckoutItem {
  plan: Plan;
  quantity: number;
  subtotal: number;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  // const [address, setAddress] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isValidatingUser, setIsValidatingUser] = useState(false);
  const [userValidationError, setUserValidationError] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    // address: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  useEffect(() => {
    const items: CheckoutItem[] = [];
    
    plans.forEach(plan => {
      const quantity = parseInt(searchParams.get(plan.id) || "0");
      if (quantity > 0) {
        items.push({
          plan,
          quantity,
          subtotal: plan.price * quantity
        });
      }
    });
    
    setCheckoutItems(items);
    // setAddress(searchParams.get('address') || "");
  }, [searchParams]);

  const getTotalAmount = () => {
    return checkoutItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const getTax = () => {
    return getTotalAmount() * 0.08; // 8% tax
  };

  const getFinalTotal = () => {
    return getTotalAmount() + getTax();
  };

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    // Check for numbers in name
    if (/\d/.test(name)) return "Name cannot contain numbers";
    // Check for special characters (allow spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) return "Name can only contain letters, spaces, hyphens, and apostrophes";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required";
    // Extract only digits from the phone number
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) return "Phone number must be exactly 10 digits";
    return "";
  };

  // const validateAddress = (address: string) => {
  //   if (!address.trim()) return "Address is required";
  //   if (address.trim().length < 10) return "Please enter a complete address";
  //   // Check for at least one number (street number)
  //   if (!/\d/.test(address)) return "Address should include a street number";
  //   return "";
  // };

  const validateCardNumber = (cardNumber: string) => {
    if (!cardNumber.trim()) return "Card number is required";
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanCard)) return "Please enter a valid card number (13-19 digits)";
    return "";
  };

  const validateExpiry = (expiry: string) => {
    if (!expiry.trim()) return "Expiry date is required";
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) return "Please enter expiry date in MM/YY format";
    
    // Check if date is not in the past
    const [month, year] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    if (expiryDate < currentDate) return "Card has expired";
    
    return "";
  };

  const validateCVV = (cvv: string) => {
    if (!cvv.trim()) return "CVV is required";
    if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3 or 4 digits";
    return "";
  };

  const validateAllFields = () => {
    const newErrors = {
      name: validateName(customerInfo.name),
      email: validateEmail(customerInfo.email),
      phone: validatePhone(customerInfo.phone),
      // address: validateAddress(address),
      cardNumber: validateCardNumber(paymentInfo.cardNumber),
      expiry: validateExpiry(paymentInfo.expiry),
      cvv: validateCVV(paymentInfo.cvv)
    };
    
    setErrors(newErrors);
    
    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation error
    setUserValidationError("");
    
    // Validate all fields
    if (!validateAllFields()) {
      return;
    }
    
    // Set loading state for user validation
    setIsValidatingUser(true);
    
    try {
      console.log('🔍 Validating user before processing payment...');
      
      // Call user validation API
      const response = await fetch('/api/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone
        }),
      });
      
      const result = await response.json();
      
      if (result.isValid) {
        console.log('✅ User validation successful:', result);
        
        // Generate order number
        const orderNum = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        setOrderNumber(orderNum);
        
        // Simulate order processing
        setTimeout(() => {
          setOrderSuccess(true);
          setIsValidatingUser(false);
        }, 1000);
      } else {
        console.log('❌ User validation failed:', result);
        setUserValidationError(result.message || "Not a valid customer");
        setIsValidatingUser(false);
      }
    } catch (error) {
      console.error('🚨 User validation error:', error);
      setUserValidationError("Unable to validate customer. Please try again.");
      setIsValidatingUser(false);
    }
  };

  // Real-time validation handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Filter out numbers and invalid characters, allow only letters, spaces, hyphens, apostrophes
    value = value.replace(/[^a-zA-Z\s\-']/g, '');
    setCustomerInfo(prev => ({...prev, name: value}));
    if (errors.name) {
      setErrors(prev => ({...prev, name: validateName(value)}));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Allow valid email characters: letters, numbers, @, ., -, _
    value = value.replace(/[^a-zA-Z0-9@.\-_]/g, '');
    setCustomerInfo(prev => ({...prev, email: value}));
    if (errors.email) {
      setErrors(prev => ({...prev, email: validateEmail(value)}));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Allow only numbers
    value = value.replace(/\D/g, '');
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    setCustomerInfo(prev => ({...prev, phone: value}));
    if (errors.phone) {
      setErrors(prev => ({...prev, phone: validatePhone(value)}));
    }
  };

  // const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   let value = e.target.value;
  //   // Allow alphanumeric characters, spaces, commas, periods, hyphens for addresses
  //   value = value.replace(/[^a-zA-Z0-9\s,.\-#]/g, '');
  //   setAddress(value);
  //   if (errors.address) {
  //     setErrors(prev => ({...prev, address: validateAddress(value)}));
  //   }
  // };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Format card number with spaces (XXXX XXXX XXXX XXXX)
    value = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    if (value.length <= 23) { // Max length with spaces
      setPaymentInfo(prev => ({...prev, cardNumber: value}));
      if (errors.cardNumber) {
        setErrors(prev => ({...prev, cardNumber: validateCardNumber(value)}));
      }
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Format expiry date (MM/YY)
    value = value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    if (value.length <= 5) {
      setPaymentInfo(prev => ({...prev, expiry: value}));
      if (errors.expiry) {
        setErrors(prev => ({...prev, expiry: validateExpiry(value)}));
      }
    }
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 4) {
      setPaymentInfo(prev => ({...prev, cvv: value}));
      if (errors.cvv) {
        setErrors(prev => ({...prev, cvv: validateCVV(value)}));
      }
    }
  };

  const updateQuantity = (planId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item from checkout
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.delete(planId);
      router.push(`/checkout?${updatedParams.toString()}`);
    } else {
      // Update quantity
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.set(planId, newQuantity.toString());
      router.push(`/checkout?${updatedParams.toString()}`);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Please select some plans to continue</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  // Success Page
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Successful! 🎉</h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your purchase! Your order has been confirmed and is being processed.
            </p>
            
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Order Number:</span>
                  <span className="font-mono text-blue-600">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{customerInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{customerInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-semibold text-green-600">${getFinalTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {checkoutItems.map((item) => (
                  <div key={item.plan.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.plan.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => window.print()}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Print Receipt
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team at{" "}
                <a href="mailto:support@company.com" className="text-blue-600 hover:underline">
                  support@company.com
                </a>{" "}
                or call{" "}
                <a href="tel:+1234567890" className="text-blue-600 hover:underline">
                  (123) 456-7890
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Plans
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {checkoutItems.map((item) => (
                <div key={item.plan.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.plan.name}</h3>
                    <p className="text-sm text-gray-600">{item.plan.description}</p>
                    <div className="flex items-center mt-2 space-x-3">
                      <button
                        onClick={() => updateQuantity(item.plan.id, item.quantity - 1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.plan.id, item.quantity + 1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${item.subtotal.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">${item.plan.price}/month each</div>
                  </div>
                </div>
              ))}
            </div>

            {/* {address && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-gray-900 mb-1">Service Address</h4>
                <p className="text-gray-700">{address}</p>
              </div>
            )} */}

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${getTotalAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%):</span>
                <span>${getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>${getFinalTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
            
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={customerInfo.name}
                  onChange={handleNameChange}
                  onBlur={() => setErrors(prev => ({...prev, name: validateName(customerInfo.name)}))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={customerInfo.email}
                  onChange={handleEmailChange}
                  onBlur={() => setErrors(prev => ({...prev, email: validateEmail(customerInfo.email)}))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={customerInfo.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setErrors(prev => ({...prev, phone: validatePhone(customerInfo.phone)}))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.phone 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="1234567890 (10 digits)"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={address}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.address 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your full address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div> */}

              <div className="pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      required
                      value={paymentInfo.cardNumber}
                      onChange={handleCardNumberChange}
                      onBlur={() => setErrors(prev => ({...prev, cardNumber: validateCardNumber(paymentInfo.cardNumber)}))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.cardNumber 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      placeholder="MM/YY"
                      required
                      value={paymentInfo.expiry}
                      onChange={handleExpiryChange}
                      onBlur={() => setErrors(prev => ({...prev, expiry: validateExpiry(paymentInfo.expiry)}))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.expiry 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.expiry && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      placeholder="123"
                      required
                      value={paymentInfo.cvv}
                      onChange={handleCVVChange}
                      onBlur={() => setErrors(prev => ({...prev, cvv: validateCVV(paymentInfo.cvv)}))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.cvv 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
                >
                  Complete Order - ${getFinalTotal().toFixed(2)}
                </button>
                {userValidationError && (
                  <p className="mt-2 text-sm text-red-600 text-center">{userValidationError}</p>
                )}
              </div>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>🔒 Your payment information is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
