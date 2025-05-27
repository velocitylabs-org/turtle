# Turtle Analytics

## Overview

Turtle Analytics is a web application that provides metrics and volume data regarding transactions handled in the Turtle app. It serves as the analytics platform for tracking token transfers, displaying transaction volumes, success rates, and other key metrics.

You can access the analytics dashboard at [https://analytics.turtle.cool](https://analytics.turtle.cool).

This project is part of the Turtle monorepo, managed with Turbo. It provides a centralized location for all analytics data, allowing both the main Turtle application and other components like the widget to send and retrieve transaction information.

## Project Structure

This is a Next.js project that consists of:

- **Frontend**: React-based dashboard for visualizing analytics data
- **Backend**: API endpoints and server actions for data ingestion and retrieval
- **Database**: MongoDB instance in MongoDB Atlas with Mongoose for data validation

## Technology Stack

- **Frontend**:
  - Next.js
  - React
  - TailwindCSS for styling
  - Recharts for data visualization
  - React Query for data fetching

- **Backend**:
  - Next.js API routes and server actions
  - MongoDB with Mongoose for data modeling and validation

- **Infrastructure**:
  - MongoDB Atlas for database hosting
  - Sentry for error tracking
  - Part of a Turbo monorepo
  - Vercel for deployment and hosting

## Data Model

The core data entity is the Transaction, which includes:
- Source and destination chain information
- Source and destination token details
- Transaction amounts (in native tokens and USD)
- Transaction fees
- Sender and recipient addresses
- Transaction status and timestamps

## Setup Instructions

1. Clone the repository
2. Install dependencies in the root directory (see root directory for instructions since this is a monorepo handled with Turbo, where you can learn how to add/remove dependencies and run projects):
   ```
   pnpm install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in the required environment variables
4. Run the development server in root directory:
   ```
   pnpm run dev-analytics
   ```
5. Linter and format can be run from the root directory

## API Endpoints

- **POST /api/create-transaction**: Submit new transaction data
- **GET /api/simple-summary**: Get basic analytics data (total volume and transaction count) 
  - This endpoint is used for displaying transaction data in the public landing page of Turtle

### Security Measures for Transaction Submission

The `/api/create-transaction` endpoint implements security measures to ensure only authorized sources can submit transaction data:

**Origin Whitelisting**: The endpoint checks the request's origin and verifies it against a whitelist of approved origins. The whitelisted origins are stored as environment variables, so make sure to add your origin to the environment variable in order to whitelist it.

**Authorization Token**: All requests must include an authorization token in the `Authorization` header. This token must match the `auth_token` environment variable configured in the project.

Both security measures must be satisfied for a request to be accepted - the request must be from a whitelisted origin AND include the correct authorization token that matches the environment variable.

## Server Actions

The application uses Next.js server actions for internal data retrieval:
- `getSummaryData`: Provides summary metrics for the dashboard
- `getTransactionsData`: Retrieves filtered transaction data with summary statistics

## Integration

This analytics platform integrates with:
- The main Turtle app
- The Turtle widget
- Other services that need to submit or retrieve transaction data