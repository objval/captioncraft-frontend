# Component Reorganization Plan

## Overview
This plan outlines the reorganization of the component structure to follow a consistent pattern where all route-specific components are organized under `components/dashboard/[route-name]` instead of being scattered across different locations.

## Current Issues
1. Editor components are in `app/dashboard/editor/[videoId]/components/` 
2. Other dashboard components are properly in `components/dashboard/[route-name]/`
3. This inconsistency makes it harder to locate and maintain components

## Proposed Structure

```
components/
├── dashboard/
│   ├── main/           # Main dashboard page components
│   │   ├── DashboardStats.tsx
│   │   ├── VideoStatusOverview.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── QuickActions.tsx
│   │   └── DashboardSkeleton.tsx
│   │
│   ├── editor/         # Editor page components (TO BE MOVED)
│   │   ├── EditorHeader.tsx
│   │   ├── ErrorState.tsx
│   │   ├── KeyboardShortcuts.tsx
│   │   ├── LoadingState.tsx
│   │   ├── SaveStatusIndicator.tsx
│   │   ├── VideoSourceToggle.tsx
│   │   ├── TranscriptEditor/
│   │   │   ├── index.tsx
│   │   │   ├── SegmentEditForm.tsx
│   │   │   ├── SegmentsList.tsx
│   │   │   ├── WordEditForm.tsx
│   │   │   └── WordsList.tsx
│   │   └── VideoPlayer/
│   │       ├── index.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── VideoControls.tsx
│   │       └── VolumeControl.tsx
│   │
│   ├── gallery/        # Gallery page components (TO BE CREATED)
│   │   ├── GalleryHeader.tsx
│   │   ├── GalleryFilters.tsx
│   │   ├── VideoGrid.tsx
│   │   ├── SelectionControls.tsx
│   │   └── GallerySkeleton.tsx
│   │
│   ├── profile/        # Profile page components
│   │   ├── ProfileCard.tsx
│   │   ├── ProfileForm.tsx
│   │   ├── ActivityStats.tsx
│   │   ├── AccountSettings.tsx
│   │   └── SecuritySettings.tsx
│   │
│   ├── credits/        # Credits page components
│   │   ├── CreditOverview.tsx
│   │   ├── CreditPacksGrid.tsx
│   │   ├── TransactionHistory.tsx
│   │   ├── PaymentHistory.tsx
│   │   ├── InvoiceTable.tsx
│   │   └── HelpSection.tsx
│   │
│   └── admin/          # Admin page components
│       ├── SystemStats.tsx
│       ├── UserManagement.tsx
│       ├── RecentVideos.tsx
│       ├── SystemActivity.tsx
│       ├── UserDialogs.tsx
│       └── AdminFilters.tsx
│
├── shared/             # Shared components across all routes
│   ├── StatusBadge.tsx
│   ├── DateDisplay.tsx
│   ├── LoadingSkeleton.tsx
│   ├── AuthButtons.tsx
│   └── EmptyState.tsx
│
├── video/              # Video-related components (used across multiple routes)
│   ├── VideoCard.tsx
│   ├── upload-modal.tsx
│   └── video-thumbnail.tsx
│
├── layout/             # Layout components
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   └── mobile-menu.tsx
│
├── providers/          # Context providers
│   ├── auth-provider.tsx
│   ├── credits-provider.tsx
│   └── theme-provider.tsx
│
├── payments/           # Payment-related components
│   └── payment-history.tsx
│
└── ui/                 # UI primitives (shadcn/ui)
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    └── ... (other UI components)
```

## Implementation Steps

### Phase 1: Move Editor Components
1. Create `components/dashboard/editor/` directory
2. Move all components from `app/dashboard/editor/[videoId]/components/` to `components/dashboard/editor/`
3. Update all import paths in the editor page
4. Test editor functionality

### Phase 2: Extract Gallery Components
1. Create `components/dashboard/gallery/` directory
2. Extract components from gallery page:
   - GalleryHeader (title, description, view mode toggle)
   - GalleryFilters (search bar, status filter, selection controls)
   - VideoGrid (grid/list view of videos)
   - SelectionControls (select all, delete selected)
   - GallerySkeleton (loading state)
3. Update gallery page to use new components

### Phase 3: Update Import Aliases (Optional)
Consider adding path aliases to tsconfig.json for cleaner imports:
```json
{
  "compilerOptions": {
    "paths": {
      "@/components/dashboard/*": ["components/dashboard/*"]
    }
  }
}
```

## Benefits
1. **Consistency**: All dashboard route components follow the same structure
2. **Discoverability**: Easy to find components for any route
3. **Maintainability**: Clear separation between route-specific and shared components
4. **Scalability**: Easy to add new routes with their own component folders
5. **Import clarity**: Cleaner import paths that reflect the app structure

## Next Steps After Reorganization
1. Update documentation to reflect new structure
2. Add README files in component directories explaining the structure
3. Consider creating barrel exports (index.ts) for cleaner imports
4. Set up ESLint rules to enforce import patterns