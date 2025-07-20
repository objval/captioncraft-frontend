-- Enable real-time for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Enable real-time for credit_transactions table if not already enabled
ALTER PUBLICATION supabase_realtime ADD TABLE credit_transactions;