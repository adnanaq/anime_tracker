import React, { useState } from 'react'
import { animeService } from '../services/animeService'
import { malService } from '../services/mal'
import { jikanService } from '../services/jikan'

export const CacheTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testMALCaching = async () => {
    addResult('🔄 Testing MAL cache...')
    try {
      const start = Date.now()
      const data1 = await malService.getRankingAnime('airing')
      const time1 = Date.now() - start
      addResult(`✅ MAL first call: ${time1}ms, got ${data1.length} anime`)

      const start2 = Date.now()
      const data2 = await malService.getRankingAnime('airing')
      const time2 = Date.now() - start2
      addResult(`🚀 MAL cached call: ${time2}ms, got ${data2.length} anime (should be much faster!)`)
      
      if (time2 < time1 / 2) {
        addResult('✅ MAL Cache working! Second call was significantly faster')
      } else {
        addResult('⚠️ MAL Cache might not be working optimally')
      }
    } catch (error) {
      addResult(`❌ MAL test failed: ${error}`)
    }
  }

  const testJikanCaching = async () => {
    addResult('🔄 Testing Jikan cache...')
    try {
      const start = Date.now()
      const data1 = await jikanService.getTrendingAnime()
      const time1 = Date.now() - start
      addResult(`✅ Jikan first call: ${time1}ms, got ${data1.length} anime`)

      const start2 = Date.now()
      const data2 = await jikanService.getTrendingAnime()
      const time2 = Date.now() - start2
      addResult(`🚀 Jikan cached call: ${time2}ms, got ${data2.length} anime (should be much faster!)`)
      
      if (time2 < time1 / 2) {
        addResult('✅ Jikan Cache working! Second call was significantly faster')
      } else {
        addResult('⚠️ Jikan Cache might not be working optimally')
      }
    } catch (error) {
      addResult(`❌ Jikan test failed: ${error}`)
    }
  }

  const testAnimeServiceSourceSpecific = async () => {
    addResult('🔄 Testing AnimeService source-specific calls...')
    try {
      const currentSource = animeService.getSource()
      addResult(`📊 Current source: ${currentSource}`)
      
      const start = Date.now()
      const data = await animeService.getTrendingAnime()
      const time = Date.now() - start
      addResult(`✅ AnimeService call: ${time}ms, got ${data.length} anime`)
      addResult(`📊 All anime from source: ${data[0]?.source || 'unknown'}`)
      
      // Verify all anime are from the same source
      const sources = [...new Set(data.map(anime => anime.source))]
      if (sources.length === 1) {
        addResult(`✅ Source consistency: All anime from ${sources[0]}`)
      } else {
        addResult(`⚠️ Source inconsistency: Found sources ${sources.join(', ')}`)
      }
    } catch (error) {
      addResult(`❌ AnimeService test failed: ${error}`)
    }
  }

  const testRandomAnime = async () => {
    addResult('🔄 Testing random anime...')
    try {
      const anime = await animeService.getRandomAnime()
      addResult(`🎲 Random anime: ${anime.title} (${anime.source})`)
    } catch (error) {
      addResult(`❌ Random anime test failed: ${error}`)
    }
  }

  const runAllTests = async () => {
    setIsLoading(true)
    setTestResults([])
    
    addResult('🚀 Starting cache performance tests...')
    
    await testMALCaching()
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between tests
    
    await testJikanCaching()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testAnimeServiceSourceSpecific()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testRandomAnime()
    
    addResult('✅ All tests completed!')
    setIsLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        🧪 Cache Performance Tests
      </h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
        >
          {isLoading ? '⏳ Running Tests...' : '🧪 Run All Tests'}
        </button>
        
        <button
          onClick={testMALCaching}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
        >
          Test MAL Cache
        </button>
        
        <button
          onClick={testJikanCaching}
          disabled={isLoading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
        >
          Test Jikan Cache
        </button>
        
        <button
          onClick={clearResults}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
        >
          🗑️ Clear
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-96 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Test Results:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No test results yet. Click "Run All Tests" to start!</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc ml-6 space-y-1">
          <li>First API calls should be slower (fetching from network)</li>
          <li>Cached calls should be significantly faster (&lt; 50ms typically)</li>
          <li>Open browser dev tools to see cache debug logs</li>
          <li>Refresh the page and run tests again to see persistent cache working</li>
        </ul>
      </div>
    </div>
  )
}

export default CacheTest