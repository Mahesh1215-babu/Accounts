# Pawn Broker Application

A modern web application for managing pawn broker operations, built with Next.js and MongoDB. This application helps manage customers, loans, payments, and vouchers efficiently.

## Features

- **Customer Management**: Add, view, and manage customer information
- **Loan Management**: Create and track loans with detailed information
- **Payment Processing**: Record and manage loan payments
- **Voucher System**: Generate and manage vouchers for transactions
- **RESTful API**: Complete API endpoints for all operations
- **Database Integration**: MongoDB backend with Mongoose ORM
- **Responsive UI**: Modern, intuitive user interface

## Tech Stack

- **Frontend**: React 18, Next.js 14
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Language**: TypeScript
- **Utilities**: date-fns for date handling

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. Navigate to the project directory:
```bash
cd pawn-broker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the project root with your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
```

## Project Structure

```
pawn-broker/
├── app/
│   ├── api/                 # API routes
│   │   ├── customers/       # Customer endpoints
│   │   ├── loans/          # Loan endpoints
│   │   ├── payments/       # Payment endpoints
│   │   └── vouchers/       # Voucher endpoints
│   ├── customers/          # Customer pages
│   ├── loans/             # Loan pages
│   ├── payments/          # Payment pages
│   ├── vouchers/          # Voucher pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── globals.css        # Global styles
├── lib/
│   ├── models/            # Database models
│   ├── mongoose.ts        # MongoDB connection
│   └── finance.ts         # Financial utilities
├── models/                # TypeScript type definitions
└── package.json
```

## Getting Started

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will run on `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

### Production

Start the production server:
```bash
npm start
```

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers/[id]` - Get customer by ID
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create a new loan
- `GET /api/loans/[id]` - Get loan by ID
- `PUT /api/loans/[id]` - Update loan
- `DELETE /api/loans/[id]` - Delete loan

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record a payment
- `GET /api/payments/[id]` - Get payment by ID
- `PUT /api/payments/[id]` - Update payment
- `DELETE /api/payments/[id]` - Delete payment

### Vouchers
- `GET /api/vouchers` - Get all vouchers
- `POST /api/vouchers` - Create a new voucher
- `GET /api/vouchers/[id]` - Get voucher by ID
- `PUT /api/vouchers/[id]` - Update voucher
- `DELETE /api/vouchers/[id]` - Delete voucher

## Database Models

### Customer
- ID
- Name
- Email
- Phone
- Address
- Created Date

### Loan
- ID
- Customer ID
- Loan Amount
- Interest Rate
- Loan Date
- Due Date
- Status

### Payment
- ID
- Loan ID
- Payment Amount
- Payment Date
- Status

### Voucher
- ID
- Transaction ID
- Voucher Type
- Amount
- Issue Date
- Expiry Date

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Environment Variables

Create a `.env.local` file with the following variables:

```
MONGODB_URI=your_mongodb_uri
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is private and proprietary.

## Support

For issues and questions, please contact the development team.
