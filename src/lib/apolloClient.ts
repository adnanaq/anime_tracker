import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV
const ANILIST_GRAPHQL_URL = isDevelopment
  ? 'http://localhost:3002/anilist/graphql'
  : 'https://graphql.anilist.co'

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    })
  }

  if (networkError) {
    console.error('Network error:', networkError)
    
    // Retry on network errors
    if (networkError.statusCode === 429) {
      console.log('Rate limited, retrying in 1 second...')
      return new Promise((resolve) => {
        setTimeout(() => resolve(forward(operation)), 1000)
      })
    }
  }
})

// HTTP link
const httpLink = createHttpLink({
  uri: ANILIST_GRAPHQL_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Apollo Client with sophisticated caching
export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Handle paginated results
          Page: {
            keyArgs: ['type', 'format', 'status', 'season', 'year', 'search'],
            merge: (existing, incoming, { args }) => {
              // For pagination, we usually want to replace rather than merge
              // unless we're implementing infinite scroll
              return incoming
            }
          }
        }
      },
      
      // AniList Media type (anime/manga)
      Media: {
        keyFields: ['id'],
        fields: {
          // Relations shouldn't be merged, replace instead
          relations: {
            merge: false
          },
          // Recommendations shouldn't be merged
          recommendations: {
            merge: false
          },
          // Reviews shouldn't be merged
          reviews: {
            merge: false
          }
        }
      },
      
      // User data
      User: {
        keyFields: ['id'],
        fields: {
          // Merge user preferences/options
          mediaListOptions: {
            merge: true
          }
        }
      },
      
      // Media List (user's anime list entries)
      MediaList: {
        keyFields: ['id'],
        fields: {
          // These fields change frequently, don't merge arrays
          notes: {
            merge: false
          }
        }
      },
      
      // Media List Collection (user's entire list)
      MediaListCollection: {
        keyFields: ['user', ['id']],
        fields: {
          lists: {
            merge: false // Replace the entire list structure
          }
        }
      }
    }
  }),
  
  // Default fetch policies for different operation types
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Show cached data first, then update with network
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true
    },
    query: {
      fetchPolicy: 'cache-first', // Use cache if available
      errorPolicy: 'all'
    },
    mutate: {
      fetchPolicy: 'no-cache', // Always execute mutations
      errorPolicy: 'all'
    }
  },
  
  // Enable devtools in development
  connectToDevTools: isDevelopment,
  
  // Default context
  defaultContext: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }
})

// Helper function to clear cache (useful for logout, etc.)
export const clearApolloCache = () => {
  return apolloClient.clearStore()
}

// Helper function to reset cache (clears cache and refetches active queries)
export const resetApolloCache = () => {
  return apolloClient.resetStore()
}

// Export for easy access in components
export default apolloClient