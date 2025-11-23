# Store Setup - Scalable Architecture

## Overview

The store setup has been refactored into a **scalable, component-based architecture** that makes it easy to add, remove, or modify setup stages without bloating a single file.

## Architecture

```
store-setup/
├── components/
│   ├── StoreForm.tsx              # Main orchestrator (slim controller)
│   ├── StageProgressBar.tsx       # Progress indicator component
│   ├── StageProgressBar.module.css
│   ├── StageContainer.tsx         # Reusable stage wrapper
│   ├── StageContainer.module.css
│   ├── ServiceAgreement.tsx       # Shared components
│   ├── PricingConfirmation.tsx
│   ├── AddressFields.tsx
│   └── stages/                    # Individual stage components
│       ├── index.ts               # Central export
│       ├── BasicInfoStage.tsx
│       ├── AddressStage.tsx
│       ├── ContactInfoStage.tsx
│       ├── AboutSectionsStage.tsx
│       ├── ServiceAgreementStage.tsx
│       └── PricingConfirmationStage.tsx
├── config/
│   └── stageConfig.ts             # Centralized stage definitions
└── hooks/
    ├── useAddressGeocoding.ts
    └── useStoreSetup.ts           # Business logic (optional)

```

## Key Components

### 1. `stageConfig.ts` - Central Configuration

Defines all stages in one place. Makes adding/removing stages trivial.

```typescript
export const STAGES: StageDefinition[] = [
  {
    id: 1,
    key: 'basicInfo',
    titleKey: 'store.basicInfo',
    subtitleKey: 'store.basicInfoSubtitle',
    icon: Store,
    gradient: { from: 'primary-400/5', to: 'primary-500/5' },
    iconGradient: { from: 'primary-400', to: 'primary-500' },
  },
  // ... more stages
];
```

### 2. `StageContainer.tsx` - Reusable Wrapper

Provides consistent styling for all stages. Each stage gets wrapped automatically.

```typescript
<StageContainer stage={stageDefinition}>
  {/* Stage content */}
</StageContainer>
```

### 3. `StageProgressBar.tsx` - Progress Indicator

Shows current progress through all stages. Automatically updates based on `stageConfig`.

```typescript
<StageProgressBar
  currentStage={currentStage}
  completedStages={completedStages}
/>
```

### 4. Individual Stage Components

Each stage is its own component with its own logic and styling.

**Example: `ServiceAgreementStage.tsx`**
```typescript
export const ServiceAgreementStage: React.FC<Props> = ({ storeName, agreed, onAgreeChange }) => {
  return (
    <ServiceAgreement
      storeName={storeName}
      agreed={agreed}
      onAgreeChange={onAgreeChange}
    />
  );
};
```

## How to Add a New Stage

### Step 1: Add to `stageConfig.ts`

```typescript
{
  id: 7,
  key: 'newStage',
  titleKey: 'store.newStage.title',
  subtitleKey: 'store.newStage.subtitle',
  icon: YourIcon,
  gradient: { from: 'blue-50', to: 'indigo-50' },
  iconGradient: { from: 'blue-500', to: 'indigo-500' },
}
```

### Step 2: Create Stage Component

`components/stages/NewStage.tsx`:
```typescript
export const NewStage: React.FC<NewStageProps> = ({ /* props */ }) => {
  return (
    <div>
      {/* Your stage content */}
    </div>
  );
};
```

### Step 3: Export from Index

`components/stages/index.ts`:
```typescript
export { NewStage } from './NewStage';
```

### Step 4: Add to StoreForm

In `StoreForm.tsx`:
```typescript
import { NewStage } from './stages';

// In render:
{currentStage === 7 && (
  <StageContainer stage={getStageById(7)!}>
    <NewStage {...props} />
  </StageContainer>
)}
```

### Step 5: Add Validation

```typescript
const isStageComplete = (stage: number) => {
  switch (stage) {
    // ... existing cases
    case 7:
      return /* your validation logic */;
    default:
      return false;
  }
};
```

### Step 6: Add Translations

```typescript
'store.newStage.title': 'New Stage Title',
'store.newStage.subtitle': 'Subtitle text',
```

That's it! The progress bar, navigation, and styling are all handled automatically.

## Benefits

✅ **Scalable** - Easy to add/remove stages
✅ **Maintainable** - Each stage is self-contained
✅ **Consistent** - StageContainer ensures uniform styling
✅ **Flexible** - Easy to reorder or modify stages
✅ **Type-Safe** - TypeScript definitions for all configs
✅ **DRY** - No duplicate code for wrappers/styling

## Migration Notes

The old `StoreForm.tsx` was ~1000+ lines. The new architecture splits this into:
- `StoreForm.tsx`: ~200 lines (orchestrator only)
- `StageContainer.tsx`: ~50 lines (reusable wrapper)
- `StageProgressBar.tsx`: ~100 lines (progress indicator)
- Individual stages: ~50-150 lines each (focused components)

## Stage Component Template

Use this template when creating new stages:

```typescript
/**
 * [StageName]Stage Component
 *
 * Stage X: [Description]
 * [What this stage does]
 */

import type * as React from 'react';
// Import your dependencies

interface [StageName]StageProps {
  // Your props
}

export const [StageName]Stage: React.FC<[StageName]StageProps> = ({
  // props
}) => {
  return (
    <div>
      {/* Your stage content */}
    </div>
  );
};
```

## Best Practices

1. **Keep stages focused** - Each stage should handle one aspect of setup
2. **Use shared components** - Reuse components like ServiceAgreement, AddressFields
3. **Separate concerns** - UI in component, logic in hooks, config in stageConfig
4. **Add CSS modules** - Each complex stage should have its own .module.css
5. **Document props** - Use TypeScript interfaces with clear prop descriptions

## Future Enhancements

- Add `useStoreSetup()` hook for centralized business logic
- Create `StageNavigation.tsx` component for prev/next buttons
- Add stage-specific validation schemas (Zod/Yup)
- Implement conditional stages (show stage based on previous answers)
- Add auto-save functionality per stage
