# Lib Folder Reorganization Plan

## Current Issues
The lib folder currently has 30+ files at the root level with no clear organization, making it difficult to:
- Find related functionality
- Understand dependencies
- Maintain code
- Scale the application

## Proposed Structure

```
lib/
├── api/                    # API-related utilities
│   ├── api.ts             # Main API client
│   ├── query-client.ts    # React Query client
│   └── error-handling.ts  # API error handling
│
├── auth/                   # Authentication utilities
│   ├── server.ts          # Server-side auth
│   ├── client.ts          # Client-side auth
│   └── middleware.ts      # Auth middleware
│
├── database/              # Database utilities
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── service-role.ts
│   │   └── middleware.ts
│   └── supabase-managers.ts
│
├── payments/              # Payment-related utilities
│   ├── hypay/
│   │   ├── crypto.ts
│   │   ├── error-codes.ts
│   │   └── test-utils.ts
│   ├── invoices.ts
│   ├── payment-logger.ts
│   ├── credit-packs.ts
│   └── idempotency.ts
│
├── media/                 # Media processing utilities
│   ├── videos.ts
│   ├── transcripts.ts
│   └── profile-creations.ts
│
├── utils/                 # General utilities
│   ├── formatting/
│   │   ├── date-helpers.ts
│   │   ├── time-formatters.ts
│   │   ├── transaction-helpers.ts
│   │   └── status-helpers.tsx
│   ├── validation/
│   │   ├── registration-utils.ts
│   │   └── types.ts
│   ├── ui/
│   │   ├── animations.ts
│   │   └── rtl-helpers.ts
│   └── video-download.ts
│
└── services/             # Business logic services
    ├── profiles.ts
    └── payments.ts

```

## Migration Steps

### Phase 1: Create Directory Structure
```bash
mkdir -p lib/{api,auth,database/supabase,payments/hypay,media,utils/{formatting,validation,ui},services}
```

### Phase 2: Move Files by Category

#### API Files
- `api.ts` → `api/api.ts`
- `query-client.ts` → `api/query-client.ts`
- `error-handling.ts` → `api/error-handling.ts`

#### Database Files
- `supabase/client.ts` → `database/supabase/client.ts`
- `supabase/server.ts` → `database/supabase/server.ts`
- `supabase/service-role.ts` → `database/supabase/service-role.ts`
- `supabase/middleware.ts` → `database/supabase/middleware.ts`
- `supabase-managers.ts` → `database/supabase-managers.ts`

#### Payment Files
- `hypay-crypto.ts` → `payments/hypay/crypto.ts`
- `hypay-error-codes.ts` → `payments/hypay/error-codes.ts`
- `hypay-test-utils.ts` → `payments/hypay/test-utils.ts`
- `invoices.ts` → `payments/invoices.ts`
- `payment-logger.ts` → `payments/payment-logger.ts`
- `credit-packs.ts` → `payments/credit-packs.ts`
- `idempotency.ts` → `payments/idempotency.ts`

#### Media Files
- `videos.ts` → `media/videos.ts`
- `profile-creations.ts` → `media/profile-creations.ts`

#### Utility Files
- `utils/date-helpers.ts` → `utils/formatting/date-helpers.ts`
- `utils/time-formatters.ts` → `utils/formatting/time-formatters.ts`
- `utils/transaction-helpers.ts` → `utils/formatting/transaction-helpers.ts`
- `utils/status-helpers.tsx` → `utils/formatting/status-helpers.tsx`
- `utils/animations.ts` → `utils/ui/animations.ts`
- `utils/rtl-helpers.ts` → `utils/ui/rtl-helpers.ts`
- `utils/video-download.ts` → `utils/video-download.ts`
- `utils/types.ts` → `utils/validation/types.ts`
- `registration-utils.ts` → `utils/validation/registration-utils.ts`

#### Service Files
- `profiles.ts` → `services/profiles.ts`
- `payments.ts` → `services/payments.ts`

### Phase 3: Update Import Paths
All imports will need to be updated throughout the codebase to reflect the new structure.

### Phase 4: Create Index Files
Add index.ts files in each directory to provide clean exports:

```typescript
// lib/payments/index.ts
export * from './hypay/crypto'
export * from './hypay/error-codes'
export * from './invoices'
// etc...
```

## Benefits

1. **Better Organization**: Related files are grouped together
2. **Clearer Dependencies**: Easy to see what depends on what
3. **Scalability**: Easy to add new features in the right place
4. **Discoverability**: Developers can quickly find what they need
5. **Maintainability**: Clear separation of concerns

## Import Examples

Before:
```typescript
import { createClient } from '@/lib/supabase/server'
import { paymentLogger } from '@/lib/payment-logger'
import { formatDate } from '@/lib/utils/date-helpers'
```

After:
```typescript
import { createClient } from '@/lib/database/supabase/server'
import { paymentLogger } from '@/lib/payments/payment-logger'
import { formatDate } from '@/lib/utils/formatting/date-helpers'
```

## Next Steps After Reorganization

1. **Add README files** in each major directory explaining the purpose
2. **Create barrel exports** for cleaner imports
3. **Document dependencies** between modules
4. **Consider extracting** some utilities to separate packages if they grow