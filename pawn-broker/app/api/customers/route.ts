import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Customer from '@/lib/models/customer';

export async function GET() {
  try {
    await connectToDatabase();
    const customers = await Customer.find().sort({ createdAt: -1 });
    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    if (!data.name || !data.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    const customer = new Customer(data);
    await customer.save();
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/customers error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A customer with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create customer' }, { status: 500 });
  }
}
