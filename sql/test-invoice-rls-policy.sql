-- Test the invoice RLS policy to see if it's working correctly
-- Run this as the authenticated user (not as superuser)

-- 1. First, check what auth.uid() returns
SELECT auth.uid() as current_user_id;

-- 2. Check if the specific payment belongs to the current user
SELECT 
    id,
    user_id,
    status,
    created_at
FROM payments 
WHERE id = 'e5b3674f-3acb-489b-8633-ec6d942eb111';

-- 3. Check if the invoice exists and what the policy evaluation returns
SELECT 
    i.id as invoice_id,
    i.payment_id,
    i.invoice_number,
    i.invoice_url,
    i.status,
    p.user_id as payment_user_id,
    auth.uid() as current_user_id,
    (auth.uid() = p.user_id) as policy_should_allow
FROM invoices i
JOIN payments p ON p.id = i.payment_id
WHERE i.payment_id = 'e5b3674f-3acb-489b-8633-ec6d942eb111';

-- 4. Test the exact JOIN query that the app uses
SELECT 
    p.*,
    i.invoice_number,
    i.invoice_url,
    i.status as invoice_status
FROM payments p
LEFT JOIN invoices i ON p.id = i.payment_id
WHERE p.user_id = auth.uid()
    AND p.id = 'e5b3674f-3acb-489b-8633-ec6d942eb111';

-- 5. Test the full query structure that getUserPayments uses
SELECT 
    p.*,
    cp.name as credit_pack_name,
    cp.credits_amount,
    i.invoice_number,
    i.invoice_url,
    i.status as invoice_status
FROM payments p
LEFT JOIN credit_packs cp ON p.credit_pack_id = cp.id
LEFT JOIN invoices i ON p.id = i.payment_id
WHERE p.user_id = auth.uid()
ORDER BY p.created_at DESC
LIMIT 5;