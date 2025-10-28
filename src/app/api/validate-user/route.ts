import { NextRequest, NextResponse } from 'next/server';

// Mock user database for demonstration purposes
// In production, replace this with your actual PostgreSQL database
const mockUsers = [
  {
    id: 1,
    email: 'john.doe@example.com',
    name: 'John Doe',
    phone: '1234567890',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    phone: '9876543210',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    email: 'test@test.com',
    name: 'Test User',
    phone: '5555555555',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    email: 'demo@demo.com',
    name: 'Demo User',
    phone: '1111111111',
    created_at: new Date(),
    updated_at: new Date()
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 User validation API called');
    
    const body = await request.json();
    const { email, name, phone } = body;
    
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required', isValid: false },
        { status: 400 }
      );
    }
    
    console.log('📧 Validating user:', { email, name, phone });
    
    // Mock database validation - check if user exists in mock data
    // Only validate email address, ignore name and phone
    const user = mockUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (user) {
      console.log('✅ User found in mock database:', user);
      return NextResponse.json({
        isValid: true,
        message: 'User validated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone
        }
      });
    } else {
      console.log('❌ User not found in mock database');
      return NextResponse.json({
        isValid: false,
        message: 'Not a valid customer'
      });
    }
  } catch (error) {
    console.error('🚨 User validation error:', error);
    return NextResponse.json(
      { error: 'Validation service error', isValid: false },
      { status: 500 }
    );
  }
}