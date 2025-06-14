# Testing Strategy

## Philosophy

Our testing approach focuses on **business logic** and **critical functionality** while using the right tools for the right purposes:

### Unit Tests (Vitest + RTL)
- ✅ **Business Logic**: Store state management, data transformations
- ✅ **Core Utilities**: Status conversion, validation functions  
- ✅ **Critical Paths**: Authentication, user data merging
- ❌ **Visual/Styling**: Colors, CSS classes, animations

### Storybook 
- ✅ **Component Variants**: All AnimeCard types, states, edge cases
- ✅ **Visual Testing**: Colors, styling, responsive behavior
- ✅ **Interaction Testing**: Hover states, animations
- ✅ **Design System**: Consistent component library

### E2E Tests (Playwright)
- ✅ **User Workflows**: Search, authentication, list management
- ✅ **API Integration**: Real data flows, error scenarios
- ✅ **Cross-browser**: Critical paths in different environments

## Current Test Coverage

### Store Tests (19 tests)
- `setSource()` - Source switching with data clearing
- `getAuthToken()` - Authentication token retrieval
- `mergeUserScores()` / `mergeUserStatus()` - Data merging logic
- `updateAnimeStatus()` - Complex status updates across multiple lists
- `withLoading()` - Loading state management with error handling
- `getCurrentlyWatching()` - Computed property filtering

### Utility Tests (26 tests)
- **Status Utils**: Cross-source conversion, validation, label mapping
- **Class Utils**: Tailwind CSS conflict resolution and merging

### Hook Tests (50 tests)
- **Authentication Hooks**: `useAuth`, `useAnimeAuth`, `useMultiSourceAuth`
- **Anime Data Hooks**: `useAnimeRecommendations`, `useAnimeReviewsAndStats`

### API Service Tests (31 tests)
- **API Normalization**: AniList, Jikan, and MAL data transformation
- **Data Integrity**: Cross-source compatibility and error handling
- **User Data Integration**: Status, scores, and progress merging

### Extracted Utility Tests (166 tests)
- **Theme Management**: System detection, localStorage, media queries
- **Scoring Logic**: Validation, conversion, categorization, distributions
- **Search & Filter**: Parameter building, validation, filtering, pagination
- **Debounce & Throttle**: Timing control, cleanup, edge cases

## Test Structure

```
src/
├── test/
│   ├── setup.ts           # Global test configuration
│   ├── utils/             # Test helpers and utilities
│   │   └── testHelpers.ts # Custom render with providers
│   └── fixtures/          # Mock data and test fixtures
│       └── mockData.ts    # Reusable test data
├── store/__tests__/       # Store business logic tests
├── utils/__tests__/       # Utility function tests
├── components/stories/    # Storybook component stories
└── e2e/                   # Playwright end-to-end tests
```

## Running Tests

```bash
# Unit tests
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:ui           # Interactive UI

# Component development
npm run storybook         # Visual component testing

# E2E tests
npm run test:e2e          # End-to-end tests
npm run test:e2e:ui       # Interactive E2E UI

# Full suite
npm run test:all          # Unit + E2E tests
```

## Guidelines

### What to Unit Test
- ✅ Data transformations and business logic
- ✅ State management and side effects
- ✅ Error handling and edge cases
- ✅ Cross-source data compatibility
- ✅ User interaction flows (state changes)

### What NOT to Unit Test
- ❌ CSS classes and styling (use Storybook)
- ❌ Animation timing and visual effects
- ❌ API implementation details (mock at service boundary)
- ❌ Component rendering (use Storybook + E2E)

### Test Naming Convention
- **Describe blocks**: Component/Function name
- **Test names**: "should [expected behavior] when [condition]"
- **File naming**: `*.test.ts` for unit tests, `*.stories.tsx` for Storybook

This focused approach ensures tests are maintainable, fast, and catch real issues without duplicating visual testing that's better suited for Storybook.