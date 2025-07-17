-- Check RLS policies and table relations for invoices table
-- This query will show all relevant information about the invoices table

-- 1. Check if RLS is enabled on invoices table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'invoices';

-- 2. Check all RLS policies on invoices table
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'invoices';

-- 3. Check foreign key constraints on invoices table
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'invoices' AND tc.table_schema = 'public';

-- 4. Check unique constraints on invoices table
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'invoices' 
    AND tc.table_schema = 'public'
    AND tc.constraint_type = 'UNIQUE';

-- 5. Check permissions on invoices table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'invoices' AND table_schema = 'public';

-- 6. Check if payments table has RLS enabled (for comparison)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'payments';

-- 7. Check RLS policies on payments table
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'payments';

-- 8. Test query to see what data is actually returned for your specific payment
SELECT 
    p.id as payment_id,
    p.status as payment_status,
    p.user_id,
    i.id as invoice_id,
    i.invoice_number,
    i.invoice_url,
    i.status as invoice_status
FROM payments p
LEFT JOIN invoices i ON p.id = i.payment_id
WHERE p.id = 'e5b3674f-3acb-489b-8633-ec6d942eb111';

-- 9. Check current user context
SELECT 
    current_user,
    session_user,
    auth.uid() as authenticated_user_id;