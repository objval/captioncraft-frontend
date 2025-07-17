# Hypay Integration Enhancements

This document lists potential enhancements for the Hypay payment integration, derived from the provided `Docs.md`. These are considerations for future development to improve security, robustness, and feature parity.

## Signature Verification (High Priority - Security)

**Reference:** "Step 1 - APISign (Payment Page Request)", "Step 3 - Success Page Redirect", "Step 4 - Verification"

**Description:**
The documentation explicitly mentions a `signature` parameter returned by Hypay after the `APISign` request and in the success page redirect URL. It also details a "Step 4 - Verification" process using `action=APISign` and `What=VERIFY` to verify the transaction's integrity using this signature.

**Enhancements:**
- **Implement Signature Verification on Webhooks:** Ensure server-to-server webhooks (`app/api/payments/hypay/success/route.ts` and `app/api/payments/hypay/failure/route.ts`) perform signature verification to prevent tampering and confirm the callback is genuinely from Hypay.
- **Implement Signature Verification on Client-Side Redirects:** While the webhook is the source of truth, also verify the signature on client-side redirect pages (`app/dashboard/payment/success/page.tsx` and `app/dashboard/payment/failure/page.tsx`) for an extra layer of security and to prevent false success messages from URL manipulation.

---

## Comprehensive Error Handling and Mapping

**Reference:** "Error Codes", "Hypay Error codes", "Shva Error codes"

**Description:**
The documentation provides extensive lists of Hypay-specific error codes (201-999) and Shva error codes (0-200). The current `app/api/payments/hypay/failure/route.ts` has a basic switch case, but it could be more robust.

**Enhancements:**
- **Detailed Error Mapping:** Create a comprehensive mapping of all documented Hypay and Shva error codes to user-friendly messages for better user feedback and debugging.
- **Logging of All Error Parameters:** Ensure all relevant error parameters (e.g., `CCode`, `ErrMsg`, `Id`, `Order`) are consistently logged for every failure callback to aid troubleshooting.

---

## Tokenization for Recurring Payments / Stored Cards

**Reference:** "Tokens", "Soft Protocol - Transaction in web server"

**Description:**
Hypay supports tokenization, allowing you to save a token that replaces credit card information for future transactions. This is ideal for recurring payments or "card-on-file" functionality.

**Enhancements:**
- **Implement Token Generation:** After a successful initial payment, implement the "getToken" action to retrieve and securely store the payment token for the user.
- **Implement Soft Protocol for Token Usage:** Use the "Soft Protocol" to process subsequent transactions using stored tokens, improving user experience and PCI compliance.

---

## Postponed Transactions

**Reference:** "Postpone Transaction"

**Description:**
Hypay offers a "Postpone Transaction" mechanism (CCode=800) to divide the execution and implementation stages of a transaction. This can be useful for order verification before final capture.

**Enhancements:**
- **Conditional Capture:** If your business logic requires it (e.g., manual order review, inventory check), implement the "Postpone" feature during the initial payment request.
- **Commit/Cancel Postponed Transactions:** Develop functionality to either "commit" or "cancel" these postponed transactions via API calls within a specified timeframe (e.g., 72 hours).

---

## Refund and Cancellation Functionality

**Reference:** "Cancel/ Refund Transaction"

**Description:**
The API supports canceling transactions (before 23:20 on the same day) and issuing refunds (even after the daily cutoff).

**Enhancements:**
- **Implement Cancellation API:** For immediate cancellations, integrate the `CancelTrans` action.
- **Implement Refund API:** For refunds, integrate the `zikoyAPI` action (refund by transaction ID) or the `soft` protocol with `zPass` (PAYout). This is crucial for customer service and financial operations.

---

## EzCount Invoice Integration (Advanced)

**Reference:** "EzCount Invoice module"

**Description:**
Hypay integrates with EzCount for automatic invoice generation. This includes passing item details and printing invoices via API.

**Enhancements:**
- **Automated Invoice Generation:** If using EzCount, ensure your payment initiation process sends the necessary `SendHesh`, `heshDesc`, and `Pritim` parameters to automatically generate invoices.
- **Invoice Retrieval/Printing:** Implement functionality to retrieve or print invoices using the `PrintHesh` action, potentially allowing users to download their invoices directly from your platform.

---

## Apple Pay and Google Pay Integration (UX Improvement)

**Reference:** "Apple Pay and Google Pay Integration"

**Description:**
Hypay supports Apple Pay and Google Pay, offering a seamless checkout experience.

**Enhancements:**
- **Integrate Digital Wallets:** Follow the documentation for "Redirect Implementation" or "IFRAME Implementation" to enable Apple Pay and Google Pay buttons on your payment page, improving conversion rates and user convenience.

---

## Transaction Information and Reporting

**Reference:** "Parameter - Pay Protocol", "Returned parameters from credit card company"

**Description:**
Various parameters are returned by Hypay that can enrich your internal transaction records and provide better reporting.

**Enhancements:**
- **Store More Data:** Beyond the basic `Id`, `Amount`, and `Order`, consider storing additional returned parameters like `ACode` (confirmation code), `Bank`, `Payments`, `Brand`, `Issuer`, `L4digit`, `street`, `city`, `zip`, `cell`, `Coin`, `Tmonth`, `Tyear`, and `Hesh`. This data can be valuable for analytics, customer support, and reconciliation.
- **Utilize `MoreData=True`:** Ensure you are sending `MoreData=True` in your initial payment request to receive a richer set of returned parameters in the success/failure callbacks.