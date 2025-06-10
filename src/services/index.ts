// Main services export - clean interface for the rest of the app
export { animeService } from './animeService'

// Source-specific services
export * from './mal'
export * from './anilist'
export * from './shared'

// GraphQL utilities
export * from './graphql/fragments'