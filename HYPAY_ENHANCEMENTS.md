# Hypay Integration Enhancements

**Severity:** 8

This document lists potential enhancements for the Hypay payment integration, derived from the provided `Docs.md`. These are considerations for future development to improve security, robustness, and feature parity.

## 1. Signature Verification (High Priority - Security)

**Reference:** "Step 1 - APISign (Payment Page Request)", "Step 3 - Success Page Redirect", "Step 4 - Verification"

**Description:** The documentation explicitly mentions a `signature` parameter returned by Hypay after the `APISign` request and in the success page redirect URL. It also details a "Step 4 - Verification" process using `action=APISign` and `What=VERIFY` to verify the transaction's integrity using this signature.

**Enhancement:**
*   **Implement Signature Verification on Webhooks:** Crucially, the server-to-server webhooks (`app/api/payments/hypay/success/route.ts` and `app/api/payments/hypay/failure/route.ts`) should perform signature verification. This prevents tampering with payment data and ensures the callback genuinely originated from Hypay.
*   **Implement Signature Verification on Client-Side Redirects:** While the primary source of truth is the webhook, verifying the signature on the client-side redirect pages (`app/dashboard/payment/success/page.tsx` and `app/dashboard/payment/failure/page.tsx`) can provide an additional layer of client-side security and prevent displaying false success messages due to malicious URL manipulation.

## 2. Comprehensive Error Handling and Mapping

**Reference:** "Error Codes", "Hypay Error codes", "Shva Error codes"

**Description:** The documentation provides extensive lists of Hypay-specific error codes (201-999) and Shva error codes (0-200). The current `app/api/payments/hypay/failure/route.ts` has a basic switch case, but it could be more robust.

**Enhancement:**
*   **Detailed Error Mapping:** Create a more comprehensive mapping of all documented Hypay and Shva error codes to user-friendly messages. This will allow for more specific feedback to users and better internal debugging.
*   **Logging of All Error Parameters:** Ensure all relevant error parameters (e.g., `CCode`, `ErrMsg`, `Id`, `Order`) are consistently logged for every failure callback to aid in troubleshooting.

## 3. Tokenization for Recurring Payments / Stored Cards

**Reference:** "Tokens", "Soft Protocol - Transaction in web server"

**Description:** Hypay supports tokenization, allowing you to save a token that replaces credit card information for future transactions. This is ideal for recurring payments or "card-on-file" functionality.

**Enhancement:**
*   **Implement Token Generation:** After a successful initial payment, implement the "getToken" action to retrieve and securely store the payment token for the user.
*   **Implement Soft Protocol for Token Usage:** Utilize the "Soft Protocol" to process subsequent transactions using the stored tokens, avoiding the need for the user to re-enter card details. This improves user experience and can help with PCI compliance (as you're not storing sensitive card data directly).

## 4. Postponed Transactions

**Reference:** "Postpone Transaction"

**Description:** Hypay offers a "Postpone Transaction" mechanism (CCode=800) to divide the execution and implementation stages of a transaction. This can be useful for order verification before final capture.

**Enhancement:**
*   **Conditional Capture:** If your business logic requires it (e.g., manual order review, inventory check), implement the "Postpone" feature during the initial payment request.
*   **Commit/Cancel Postponed Transactions:** Develop functionality to either "commit" or "cancel" these postponed transactions via API calls within a specified timeframe (e.g., 72 hours).

## 5. Refund and Cancellation Functionality

**Reference:** "Cancel/ Refund Transaction"

**Description:** The API supports canceling transactions (before 23:20 on the same day) and issuing refunds (even after the daily cutoff).

**Enhancement:**
*   **Implement Cancellation API:** For immediate cancellations, integrate the `CancelTrans` action.
*   **Implement Refund API:** For refunds, integrate the `zikoyAPI` action (refund by transaction ID) or the `soft` protocol with `zPass` (PAYout). This is crucial for customer service and financial operations.

## 6. EzCount Invoice Integration (Advanced)

**Reference:** "EzCount Invoice module"

**Description:** Hypay integrates with EzCount for automatic invoice generation. This includes passing item details and printing invoices via API.

**Enhancement:**
*   **Automated Invoice Generation:** If using EzCount, ensure your payment initiation process sends the necessary `SendHesh`, `heshDesc`, and `Pritim` parameters to automatically generate invoices.
*   **Invoice Retrieval/Printing:** Implement functionality to retrieve or print invoices using the `PrintHesh` action, potentially allowing users to download their invoices directly from your platform.

## 7. Apple Pay and Google Pay Integration (UX Improvement)

**Reference:** "Apple Pay and Google Pay Integration"

**Description:** Hypay supports Apple Pay and Google Pay, offering a seamless checkout experience.

**Enhancement:**
*   **Integrate Digital Wallets:** Follow the documentation for "Redirect Implementation" or "IFRAME Implementation" to enable Apple Pay and Google Pay buttons on your payment page, improving conversion rates and user convenience.

## 8. Transaction Information and Reporting

**Reference:** "Parameter - Pay Protocol", "Returned parameters from credit card company"

**Description:** Various parameters are returned by Hypay that can enrich your internal transaction records and provide better reporting.

**Enhancement:**
*   **Store More Data:** Beyond the basic `Id`, `Amount`, and `Order`, consider storing additional returned parameters like `ACode` (confirmation code), `Bank`, `Payments`, `Brand`, `Issuer`, `L4digit`, `street`, `city`, `zip`, `cell`, `Coin`, `Tmonth`, `Tyear`, and `Hesh`. This data can be valuable for analytics, customer support, and reconciliation.
*   **Utilize `MoreData=True`:** Ensure you are sending `MoreData=True` in your initial payment request to receive a richer set of returned parameters in the success/failure callbacks.
