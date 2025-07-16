# Hypay Payment Integration - Testing Guide

## Overview
The Caption Craft frontend now integrates with Hypay for payment processing. When users click "Buy Now" on a credit pack, they are redirected to Hypay's secure payment page to complete their purchase.

## Payment Flow

1. **User clicks "Buy Now"** on a credit pack in `/dashboard/credits`
2. **Frontend calls** `POST /v1/payments/initiate` with the `creditPackId`
3. **Backend creates** a payment record and returns a Hypay payment page URL
4. **User is redirected** to Hypay's secure payment page
5. **User completes payment** on Hypay's site
6. **Hypay redirects back** to either:
   - Success: `/dashboard/payment/success`
   - Failure: `/dashboard/payment/failure`
7. **Backend processes** the payment result and updates the user's credits

## Test Credentials (Sandbox)

Use these credentials for testing payments:

**Card Details:**
- Number: `5326105300985614`
- Expiry: `12/25`
- CVV: `125`
- ID: `890108566` or `000000000`

**Backend Environment Variables:**
```env
HYPAY_MASOF_ID=4501961334
HYPAY_API_KEY=1a33779d57abe280e7d0e9e8f7b60f5c8488411e
HYPAY_PASSP=vxvxfvfx456
```

## Frontend Features

### Credits Page (`/dashboard/credits`)
- Shows current credit balance
- Displays available credit packs
- Shows payment security information
- Handles payment initiation

### Payment Success Page (`/dashboard/payment/success`)
- Confirms successful payment
- Shows success message
- Auto-redirects to credits page
- Handles authentication checks

### Payment Failure Page (`/dashboard/payment/failure`)
- Shows payment failure reason
- Provides user-friendly error messages
- Offers retry options
- Handles various error codes

## API Integration

The frontend makes a single API call to initiate payments:

```typescript
// POST /v1/payments/initiate
const response = await api.initiatePayment(creditPackId)
window.location.href = response.paymentPageUrl
```

## Security Features

1. **Server-side processing**: All payment logic is handled by the backend
2. **Secure redirects**: Users are redirected to Hypay's secure domain
3. **Authentication required**: Only authenticated users can initiate payments
4. **Error handling**: Comprehensive error handling for all scenarios

## Testing the Integration

1. Start the backend with the sandbox credentials
2. Navigate to `/dashboard/credits`
3. Click "Buy Now" on any credit pack
4. You should be redirected to Hypay's payment page
5. Use the test card details to complete the payment
6. Verify you're redirected back to the success page
7. Check that credits are added to your account

## Error Scenarios to Test

1. **Invalid card**: Use a real card number that would be declined
2. **Expired card**: Use an expired date
3. **Network timeout**: Simulate network issues
4. **Authentication**: Test without being logged in

## Important Notes

- **Never use production credentials** in development
- **Test with small amounts** (5-10 NIS) during development
- **Invoice generation**: Invoices are automatically generated on successful payments
- **Credit transactions**: All credit additions are logged in the database

## Production Deployment

When deploying to production:

1. Update backend with production Hypay credentials
2. Ensure success/failure URLs point to production domain
3. Test thoroughly with real small amounts
4. Monitor payment logs and error rates
5. Set up proper error alerting

## Troubleshooting

**Payment not redirecting:**
- Check backend API URL in `.env.local`
- Verify backend is running and accessible
- Check browser console for errors

**Payment success/failure pages not working:**
- Verify URL routing is correct
- Check authentication is working
- Ensure payment parameters are in URL

**Credits not added after payment:**
- Check backend payment processing logs
- Verify database connection
- Check Supabase credit transaction records
