Seamless Payments with Hypay: A Full-Stack Integration Guide for NestJS & Next.js


  This guide provides a comprehensive overview of integrating the Hypay (formerly YaadPay) payment gateway into your NestJS backend and Next.js frontend. It covers the database schema, backend logic for generating payment links and handling callbacks, and the frontend flow for a
  seamless user experience, including automatic invoice generation.

  ---

  1. Overview of the Payment Flow


  The payment integration follows a hosted payment page model, where your application redirects users to Hypay's secure payment page to complete transactions.


   1. User Initiates Purchase (Frontend): The user selects a credit pack on your Next.js frontend and clicks "Buy".
   2. Backend Generates Payment Link (NestJS): Your frontend calls your NestJS backend, which:
       * Authenticates the user.
       * Fetches the user's profile details.
       * Creates a pending payment record in your database.
       * Constructs a Hypay payment page URL with all necessary transaction and client details.
       * Returns this URL to the frontend.
   3. User Redirects to Hypay (Frontend): The frontend redirects the user's browser to the Hypay URL.
   4. User Completes Payment (Hypay): The user enters their payment information on Hypay's secure page.
   5. Hypay Redirects Back (Frontend): Upon completion (success or failure), Hypay redirects the user back to a pre-configured URL on your frontend, appending transaction details as query parameters.
   6. Backend Handles Callback (NestJS - Implicitly): Your NestJS backend's payment success/failure endpoints are implicitly called by the frontend's redirect. These endpoints update the payment status, add credits, and trigger invoice record updates.
   7. Invoice Generation (Hypay/EzCount): Hypay automatically generates an EzCount invoice upon successful payment and provides the invoice number in the callback.

  ---

  2. Backend Integration (NestJS)


  2.1. Database Schema

  To support payments and invoices, the following tables are crucial:

  profiles Table (Updated)

  This table now stores additional user details necessary for Hypay and EzCount.


  | Column       | Data Type | Description                                   |
  | :----------- | :-------- | :-------------------------------------------- |
  | id         | uuid    | User\'s unique identifier.                    |
  | email      | text    | User\'s email.                                |
  | credits    | integer | User\'s current credit balance.               |
  | first_name | text    | User\'s first name.                           |
  | last_name  | text    | User\'s last name.                            |
  | phone_number | text    | User\'s phone number.                         |
  | street     | text    | User\'s street address.                       |
  | city       | text    | User\'s city.                                 |
  | zip_code   | text    | User\'s zip code.                             |


  Migration SQL (`migrations/add_client_details_to_profiles.sql`):


   1 ALTER TABLE profiles
   2 ADD COLUMN first_name TEXT,
   3 ADD COLUMN last_name TEXT,
   4 ADD COLUMN phone_number TEXT,
   5 ADD COLUMN street TEXT,
   6 ADD COLUMN city TEXT,
   7 ADD COLUMN zip_code TEXT;



  credit_packs Table (Updated)

  The currency column has been renamed to price_nis.


  | Column         | Data Type | Description                                   |
  | :------------- | :-------- | :-------------------------------------------- |
  | id           | uuid    | Credit pack\'s unique identifier.             |
  | name         | text    | Name of the credit pack.                      |
  | credits_amount | integer | Number of credits in the pack.                |
  | price_nis    | numeric | Price of the pack in New Israeli Shekels (NIS). |


  Migration SQL (`migrations/rename_credit_pack_price_usd_to_nis.sql`):


   1 ALTER TABLE credit_packs RENAME COLUMN price_usd TO price_nis;


  payments Table (New)

  Records all payment attempts.


  | Column                 | Data Type        | Description                                                              |\n| :--------------------- | :--------------- | :----------------------------------------------------------------------- |\n| id                   | uuid
    | Unique identifier for the payment.                                       |\n| user_id              | uuid           | ID of the user making the payment.                                       |\n| credit_pack_id       | uuid           | ID of the purchased credit pack.
                                 |\n| amount               | numeric        | The amount of the payment.                                               |\n| status               | payment_status | Current status (pending, succeeded, failed).                       |\n|
  hypay_transaction_id | text           | Transaction ID from Hypay.                                               |\n| provider_response    | jsonb          | Raw response data from Hypay.                                            |\
  | created_at           | timestamptz    | Timestamp of creation.                                                   |\
  | updated_at           | timestamptz    | Timestamp of last update.                                                |

  invoices Table (New)

  Records generated invoices.


  | Column              | Data Type     | Description                                                              |\n| :------------------ | :------------ | :----------------------------------------------------------------------- |\
  | id                | uuid        | Unique identifier for the invoice.                                       |\
  | payment_id        | uuid        | ID of the associated payment.                                            |\
  | invoice_number    | text        | Invoice number from EzCount.                                             |\
  | invoice_url       | text        | URL to download the invoice.                                             |\
  | status            | text        | Status of invoice generation (pending, generated).                   |\
  | provider_response | jsonb       | Raw response data from EzCount.                                          |\
  | created_at        | timestamptz | Timestamp of creation.                                                   |\
  | updated_at        | timestamptz | Timestamp of last update.                                                |

  Migration SQL (`migrations/add_payments_and_invoices_tables.sql`):



    1 CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed');
    2 
    3 CREATE TABLE payments (
    4     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    5     user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    6     credit_pack_id uuid REFERENCES credit_packs(id),
    7     amount numeric NOT NULL,
    8     status payment_status NOT NULL DEFAULT 'pending',
    9     hypay_transaction_id text,
   10     provider_response jsonb,
   11     created_at timestamptz DEFAULT now(),
   12     updated_at timestamptz DEFAULT now()
   13 );
   14 
   15 CREATE TABLE invoices (
   16     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   17     payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
   18     invoice_number text,
   19     invoice_url text,
   20     status text,
   21     provider_response jsonb,
   22     created_at timestamptz DEFAULT now(),
   23     updated_at timestamptz DEFAULT now()
   24 );
   25 
   26 -- Add RLS policies
   27 ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
   28 ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
   29 
   30 CREATE POLICY "Allow users to see their own payments" ON payments
   31 FOR SELECT USING (auth.uid() = user_id);
   32 
   33 CREATE POLICY "Allow users to create their own payments" ON payments
   34 FOR INSERT WITH CHECK (auth.uid() = user_id);
   35 
   36 CREATE POLICY "Allow users to see their own invoices" ON invoices
   37 FOR SELECT USING (auth.uid() = (SELECT user_id FROM payments WHERE id = invoices.payment_id));
   38 
   39 -- Function to update updated_at timestamp
   40 CREATE OR REPLACE FUNCTION trigger_set_timestamp()
   41 RETURNS TRIGGER AS $$
   42 BEGIN
   43   NEW.updated_at = NOW();
   44   RETURN NEW;
   45 END;
   46 $$ LANGUAGE plpgsql;
   47 
   48 -- Triggers to update updated_at on changes
   49 CREATE TRIGGER set_payments_timestamp
   50 BEFORE UPDATE ON payments
   51 FOR EACH ROW
   52 EXECUTE PROCEDURE trigger_set_timestamp();
   53 
   54 CREATE TRIGGER set_invoices_timestamp
   55 BEFORE UPDATE ON invoices
   56 FOR EACH ROW
   57 EXECUTE PROCEDURE trigger_set_timestamp();


  add_credits Function

  This function is used to update user credits and log transactions.


  Migration SQL (`migrations/add_credits_function.sql`):



    1 CREATE OR REPLACE FUNCTION add_credits(p_user_id uuid, p_amount integer)
    2 RETURNS void
    3 LANGUAGE plpgsql
    4 AS $$
    5 BEGIN
    6   UPDATE profiles
    7   SET credits = credits + p_amount
    8   WHERE id = p_user_id;
    9 
   10   INSERT INTO credit_transactions (user_id, amount_changed, reason)
   11   VALUES (p_user_id, p_amount, 'credit_purchase');
   12 END;
   13 $$;


  2.2. Environment Configuration (.env)


  Store your Hypay credentials and currency settings securely.



   1 # .env
   2 HYPAY_MASOF_ID=4501961334
   3 HYPAY_USER_ID=2005822
   4 HYPAY_PASS_P=vxvxfvfx456
   5 HYPAY_API_KEY=7110eda4d09e062aa5e4a390b0a572ac0d2c0220 # Used for PrintHesh signature
   6 HYPAY_BASE_URL=https://pay.hyp.co.il/p/
   7 HYPAY_CURRENCY_CODE=1 # 1 = NIS


  2.3. NestJS Modules and Services

  PaymentsModule (src/modules/payments/)

  Handles payment initiation and callbacks.


   * `payments.module.ts`: Imports DatabaseModule, CreditsModule, InvoicesModule.
   * `payments.controller.ts`:
       * POST /v1/payments/initiate: Initiates payment, expects creditPackId.
       * GET /v1/payments/success: Hypay redirect for successful payments.
       * GET /v1/payments/failure: Hypay redirect for failed payments.
   * `payments.service.ts`:
       * `initiatePayment(user: AuthenticatedUser, creditPackId: string)`:
           * Fetches creditPack details from credit_packs table.
           * Fetches userProfile (first name, last name, address, phone) from profiles table using user.id.
           * Creates a pending record in the payments table.
           * Constructs Hypay parameters:
               * action: 'pay'
               * Masof, UserId (merchant\'s), PassP, Coin (currency code) from ConfigService.
               * Order: The payment.id (UUID).
               * Info: creditPack.name.
               * Amount: creditPack.price_nis (whole NIS units, Math.round(parseFloat(creditPack.price_nis))).
               * Tash: 1, FixTash: 'False', UTF8: 'True', UTF8out: 'True'.
               * SendHesh: 'True': Crucial for automatic EzCount invoice generation.
               * Pritim: 'True': Enables itemized invoice.
               * heshDesc: Formatted as [0~${creditPack.name}~1~${amountInCents}] for itemized receipt.
               * ClientName, ClientLName, email, phone, street, city, zip: Populated from userProfile.
           * Generates the paymentPageUrl using URLSearchParams.
       * `handleSuccessfulPayment(query: any)`:
           * Extracts Order (payment ID), Id (Hypay transaction ID), and Hesh (invoice number) from query parameters.
           * Updates payments table status to succeeded.
           * Adds credits to user\'s profiles via CreditsService.add().
           * Calls InvoicesService.updateInvoiceRecord to update the invoice record with the Hesh number and generated status.
       * `handleFailedPayment(query: any)`:
           * Extracts Order (payment ID) from query parameters.
           * Updates payments table status to failed.

  InvoicesModule (src/modules/invoices/)


  Handles invoice record management and download link generation.


   * `invoices.module.ts`: Imports DatabaseModule.
   * `invoices.service.ts`:
       * `createInvoice(paymentId: string, amount: number, description: string)`:
           * Creates a pending record in the invoices table.
           * Generates the invoice_url for downloading the invoice using Hypay\'s PrintHesh action.
           * Signature for `PrintHesh`: stringToSign = PrintHesh${masof}${paymentId}EZCOUNT${apiKey}`, then crypto.createHash('sha256').update(stringToSign).digest('hex')`.
       * `updateInvoiceRecord(paymentId: string, invoiceNumber: string, status: string, providerResponse: any)`:
           * Updates the invoices table with the actual invoice_number (Hesh) received from Hypay\'s success callback, status, and provider response.

  CreditsModule (src/modules/credits/)


   * `credits.service.ts`:
       * add(userId: string, amount: number): Calls the add_credits PostgreSQL function to safely increment user credits and log the transaction.
       * listPacks(): Now explicitly selects price_nis.

  ---

  3. Frontend Integration (Next.js)


  The frontend will orchestrate the user experience, from displaying credit packs to redirecting for payment and handling the return from Hypay.

  3.1. Displaying Credit Packs and Initiating Payment

  You'll have a component (e.g., components/BuyCreditsSection.tsx) responsible for this.



     1 // components/BuyCreditsSection.tsx
     2 import React, { useState, useEffect } from 'react';
     3 // import { useRouter } from 'next/router'; // If using Next.js for routing
     4 
     5 interface CreditPack {
     6   id: string;
     7   name: string;
     8   credits_amount: number;
     9   price_nis: number;
    10 }
    11 
    12 export function BuyCreditsSection() {
    13   const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
    14   const [loading, setLoading] = useState(true);
    15   const [error, setError] = useState<string | null>(null);
    16   const [isBuying, setIsBuying] = useState(false);
    17 
    18   // Function to retrieve JWT (replace with your actual auth context/logic)
    19   const getJwt = () => {
    20     // Example: retrieve from local storage or your auth provider
    21     return localStorage.getItem('jwt_token');
    22   };
    23 
    24   useEffect(() => {
    25     const fetchCreditPacks = async () => {
    26       try {
    27         const jwt = getJwt();
    28         if (!jwt) {
    29           setError('User not authenticated. Please log in.');
    30           setLoading(false);
    31           return;
    32         }
    33 
    34         // Call your backend to get available credit packs
    35         const response = await fetch('http://localhost:3000/v1/credits/packs', {
    36           headers: {
    37             'Authorization': `Bearer ${jwt}`,
    38             'Content-Type': 'application/json',
    39           },
    40         });
    41 
    42         if (!response.ok) {
    43           const errorData = await response.json();
    44           throw new Error(errorData.message || 'Failed to fetch credit packs');
    45         }
    46 
    47         const data = await response.json();
    48         setCreditPacks(data);
    49       } catch (err: any) {
    50         setError(err.message);
    51       } finally {
    52         setLoading(false);
    53       }
    54     };
    55 
    56     fetchCreditPacks();
    57   }, []);
    58 
    59   const handleBuyClick = async (packId: string) => {
    60     setIsBuying(true);
    61     try {
    62       const jwt = getJwt();
    63       if (!jwt) {
    64         alert('You must be logged in to purchase credits.');
    65         setIsBuying(false);
    66         return;
    67       }
    68 
    69       // Call your backend to initiate the payment and get the Hypay URL
    70       const response = await fetch('http://localhost:3000/v1/payments/initiate', {
    71         method: 'POST',
    72         headers: {
    73           'Authorization': `Bearer ${jwt}`,
    74           'Content-Type': 'application/json',
    75         },
    76         body: JSON.stringify({ creditPackId: packId }),
    77       });
    78 
    79       if (!response.ok) {
    80         const errorData = await response.json();
    81         throw new Error(errorData.message || 'Failed to initiate payment');
    82       }
    83 
    84       const { paymentPageUrl } = await response.json();
    85 
    86       // Redirect the user to Hypay's payment page
    87       window.location.href = paymentPageUrl;
    88 
    89     } catch (err: any) {
    90       setError(err.message);
    91       setIsBuying(false);
    92     }
    93   };
    94 
    95   if (loading) {
    96     return <div>Loading credit packs...</div>;
    97   }
    98 
    99   if (error) {
   100     return <div>Error: {error}</div>;
   101   }
   102 
   103   return (
   104     <div>
   105       <h2>Buy Credits</h2>
   106       {creditPacks.length === 0 ? (
   107         <p>No credit packs available.</p>
   108       ) : (
   109         <ul>
   110           {creditPacks.map((pack) => (
   111             <li key={pack.id}>
   112               {pack.name} ({pack.credits_amount} credits) - ₪{pack.price_nis}
   113               <button onClick={() => handleBuyClick(pack.id)} disabled={isBuying}>
   114                 {isBuying ? 'Processing...' : 'Buy Now'}
   115               </button>
   116             </li>
   117           ))}
   118         </ul>
   119       )}
   120     </div>
   121   );
   122 }


  3.2. Handling Redirects from Hypay


  You'll create dedicated Next.js pages to handle the success and failure redirects from Hypay.

  pages/payments/success.tsx



    1 // pages/payments/success.tsx
    2 import { useRouter } from 'next/router';
    3 import React, { useEffect, useState } from 'react';
    4 
    5 export default function PaymentSuccessPage() {
    6   const router = useRouter();
    7   const [message, setMessage] = useState('Verifying your payment...');
    8   const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    9   const [error, setError] = useState<string | null>(null);
   10 
   11   useEffect(() => {
   12     if (router.isReady) {
   13       const { Id, CCode, Amount, Order, Hesh, ...otherParams } = router.query;
   14 
   15       console.log('Hypay Success Redirect Params:', router.query);
   16 
   17       if (CCode === '0') { // CCode '0' indicates success
   18         setMessage('Payment successful! Your credits have been added.');
   19         // You might want to trigger a re-fetch of user credits here
   20         // e.g., dispatch(fetchUserCredits());
   21 
   22         // Construct invoice download URL (assuming your InvoicesService generates it)
   23         // This is a simplified example; in a real app, you might fetch the invoice record
   24         // from your backend using the 'Order' (paymentId) to get the stored invoice_url.
   25         // For now, we'll use the Hesh (invoice number) if available.
   26         if (Hesh) {
   27           // This URL needs to be generated by your backend's InvoicesService
   28           // and stored in your 'invoices' table.
   29           // For demonstration, let's assume a pattern or fetch from backend.
   30           // A more robust solution would fetch the invoice record from your DB
   31           // using the 'Order' (paymentId) and display its 'invoice_url'.
   32           // For now, we'll use the Hesh (invoice number) if available.
   33           // The actual invoice URL is generated by InvoicesService.createInvoice
   34           // and stored in the DB. You'd fetch it here.
   35           // Example: setInvoiceUrl(`/api/invoices/download?paymentId=${Order}`);
   36           // For direct download from Hypay, you'd need the full URL from the DB.
   37           // For now, we'll just indicate that an invoice was generated.
   38           setMessage(prev => prev + ` Invoice number: ${Hesh}.`);
   39         }
   40 
   41       } else {
   42         setError(`Payment completed with status code: ${CCode}. Details: ${JSON.stringify(otherParams)}`);
   43         setMessage('Payment completed, but there was an issue. Please check your account.');
   44       }
   45 
   46       // IMPORTANT: For production, you should also verify this transaction server-side
   47       // using a webhook from Hypay or by making a direct API call to verify the transaction ID.
   48       // This client-side redirect is not fully secure for crediting users.
   49     }
   50   }, [router.isReady, router.query]);
   51 
   52   return (
   53     <div>
   54       <h1>Payment Status</h1>
   55       <p>{message}</p>
   56       {error && <p style={{ color: 'red' }}>Error: {error}</p>}
   57       {invoiceUrl && (
   58         <p>
   59           <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
   60             Download your invoice
   61           </a>
   62         </p>
   63       )}
   64       <p>Thank you for your purchase!</p>
   65       <button onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
   66     </div>
   67   );
   68 }


  pages/payments/failure.tsx



    1 // pages/payments/failure.tsx
    2 import { useRouter } from 'next/router';
    3 import React, { useEffect, useState } from 'react';
    4 
    5 export default function PaymentFailurePage() {
    6   const router = useRouter();
    7   const [message, setMessage] = useState('Your payment could not be processed.');
    8   const [errorDetails, setErrorDetails] = useState<string | null>(null);
    9 
   10   useEffect(() => {
   11     if (router.isReady) {
   12       const { CCode, ErrMsg, ...otherParams } = router.query;
   13 
   14       console.log('Hypay Failure Redirect Params:', router.query);
   15 
   16       setMessage(`Payment failed. Status Code: ${CCode}.`);
   17       if (ErrMsg) {
   18         setErrorDetails(`Error Message: ${ErrMsg}`);
   19       } else {
   20         setErrorDetails(`Additional details: ${JSON.stringify(otherParams)}`);
   21       }
   22     }
   23   }, [router.isReady, router.query]);
   24 
   25   return (
   26     <div>
   27       <h1>Payment Status</h1>
   28       <p>{message}</p>
   29       {errorDetails && <p>{errorDetails}</p>}
   30       <p>Please try again or contact support if the issue persists.</p>
   31       <button onClick={() => router.push('/buy-credits')}>Try Again</button>
   32     </div>
   33   );
   34 }



  3.3. User Profile Page Enhancements

  On your user's profile or dashboard page, you can display their current credit balance and a history of their payments/invoices.



     1 // pages/profile.tsx (or components/UserProfile.tsx)
     2 import React, { useState, useEffect } from 'react';
     3 // import { useRouter } from 'next/router'; // If needed for navigation
     4 
     5 interface UserProfile {
     6   id: string;
     7   email: string;
     8   credits: number;
     9   // Add other profile fields
    10   first_name?: string;
    11   last_name?: string;
    12   phone_number?: string;
    13   street?: string;
    14   city?: string;
    15   zip_code?: string;
    16 }
    17 
    18 interface PaymentRecord {
    19   id: string;
    20   amount: number;
    21   status: string;
    22   created_at: string;
    23   invoice_url?: string; // Assuming you fetch this with payment history
    24   invoice_number?: string;
    25 }
    26 
    27 export default function UserProfilePage() {
    28   const [profile, setProfile] = useState<UserProfile | null>(null);
    29   const [payments, setPayments] = useState<PaymentRecord[]>([]);
    30   const [loading, setLoading] = useState(true);
    31   const [error, setError] = useState<string | null>(null);
    32 
    33   const getJwt = () => {
    34     return localStorage.getItem('jwt_token');
    35   };
    36 
    37   useEffect(() => {
    38     const fetchData = async () => {
    39       try {
    40         const jwt = getJwt();
    41         if (!jwt) {
    42           setError('User not authenticated.');
    43           setLoading(false);
    44           return;
    45         }
    46 
    47         // Fetch user profile
    48         const profileRes = await fetch('http://localhost:3000/v1/credits/me', { // Assuming this endpoint returns full profile
    49           headers: { 'Authorization': `Bearer ${jwt}` },
    50         });
    51         if (!profileRes.ok) throw new Error('Failed to fetch profile');
    52         const profileData = await profileRes.json();
    53         setProfile(profileData);
    54 
    55         // Fetch payment history (you'll need to implement this endpoint in NestJS)
    56         const paymentsRes = await fetch('http://localhost:3000/v1/payments', { // Assuming /v1/payments returns user's payments
    57           headers: { 'Authorization': `Bearer ${jwt}` },
    58         });
    59         if (!paymentsRes.ok) throw new Error('Failed to fetch payments');
    60         const paymentsData = await paymentsRes.json();
    61         setPayments(paymentsData);
    62 
    63       } catch (err: any) {
    64         setError(err.message);
    65       } finally {
    66         setLoading(false);
    67       }
    68     };
    69 
    70     fetchData();
    71   }, []);
    72 
    73   if (loading) return <div>Loading profile...</div>;
    74   if (error) return <div>Error: {error}</div>;
    75   if (!profile) return <div>No profile data.</div>;
    76 
    77   return (
    78     <div>
    79       <h1>Welcome, {profile.first_name || profile.email}!</h1>
    80       <p>Current Credits: {profile.credits}</p>
    81 
    82       <h2>Your Information</h2>
    83       <p>Email: {profile.email}</p>
    84       <p>Name: {profile.first_name} {profile.last_name}</p>
    85       <p>Phone: {profile.phone_number}</p>
    86       <p>Address: {profile.street}, {profile.city}, {profile.zip_code}</p>
    87       {/* Add an "Edit Profile" button here */}
    88 
    89       <h2>Payment History</h2>
    90       {payments.length === 0 ? (
    91         <p>No payment history found.</p>
    92       ) : (
    93         <ul>
    94           {payments.map((payment) => (
    95             <li key={payment.id}>
    96               Payment ID: {payment.id} - Amount: ₪{payment.amount} - Status: {payment.status} - Date: {new Date(payment.created_at).toLocaleDateString()}
    97               {payment.invoice_url && (
    98                 <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px' }}>
    99                   Download Invoice
   100                 </a>
   101               )}
   102             </li>
   103           ))}
   104         </ul>
   105       )}
   106     </div>
   107   );
   108 }


  ---

  4. Testing and Debugging

  4.1. Sandbox Credentials


  Ensure your .env file (or environment variables) contains the following:



   1 HYPAY_MASOF_ID=4501961334
   2 HYPAY_USER_ID=2005822
   3 HYPAY_PASS_P=vxvxfvfx456
   4 HYPAY_API_KEY=7110eda4d09e062aa5e4a390b0a572ac0d2c0220 # Used for PrintHesh signature
   5 HYPAY_BASE_URL=https://pay.hyp.co.il/p/
   6 HYPAY_CURRENCY_CODE=1 # 1 = NIS


  4.2. Test Card Data

  Use the following test card details for sandbox transactions:


   * Card Number: 5326105300985614
   * Validity Date: 12/25
   * CVV: 125
   * ID: real id number or 890108566 or 000000000


  4.3. Running the Backend

  Ensure your NestJS application is running.

   1 npm run start:prod # Or npm run start:dev for development with watch mode


  4.4. Running the payment_tester.js Script


  This script helps verify the backend's payment link generation.


   1 node payment_tester.js


  Check the console output for the Hypay Payment Page URL.

  4.5. Debugging Tips


   * Backend Logs: Monitor your NestJS application's console output for console.log and console.error messages, especially from PaymentsService and InvoicesService.
   * Supabase Dashboard: Regularly check your payments, invoices, profiles, and credit_transactions tables in the Supabase dashboard to verify data integrity and status updates.
   * Network Tab: Use your browser's developer tools (Network tab) to inspect the requests made by your frontend and the redirects from Hypay.

  ---

  5. Future Enhancements


   * Webhooks: Implement a dedicated webhook endpoint in your NestJS backend to receive server-to-server notifications from Hypay. This is the most secure way to confirm payment success and credit users, as client-side redirects can be spoofed.
   * Payment History Endpoint: Create a new endpoint in your NestJS backend (e.g., /v1/payments) that returns a user's payment history, including invoice URLs.
   * Error Handling: Implement more granular error handling and user feedback for various payment failure scenarios.
   * User Profile Update: Add functionality to your frontend and backend to allow users to update their first_name, last_name, phone_number, street, city, and zip_code in the profiles table.


  This guide provides a solid foundation for your Hypay integration. By following these steps, you can enable credit pack purchases and automatic invoice generation in your application.