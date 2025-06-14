// Simple cache performance test
// Run this in the browser console on http://localhost:3001

async function testCachePerformance() {
  console.log("🧪 Starting cache performance tests...");

  // Test 1: MAL Service Caching
  console.log("\n📱 Testing MAL service caching...");

  const { malService } = await import("./src/services/mal/index.js");

  // First call (should hit network)
  console.time("MAL First Call");
  try {
    const data1 = await malService.getRankingAnime("airing");
    console.timeEnd("MAL First Call");
    console.log(`✅ First call got ${data1.length} anime`);

    // Second call (should hit cache)
    console.time("MAL Cached Call");
    const data2 = await malService.getRankingAnime("airing");
    console.timeEnd("MAL Cached Call");
    console.log(`🚀 Cached call got ${data2.length} anime`);

    if (data1.length === data2.length) {
      console.log(
        "✅ Cache consistency: Both calls returned same number of results",
      );
    }
  } catch (error) {
    console.error("❌ MAL test failed:", error);
  }

  // Test 2: Jikan Service Caching
  console.log("\n🌟 Testing Jikan service caching...");

  try {
    const { jikanService } = await import("./src/services/jikan/index.js");

    console.time("Jikan First Call");
    const jikanData1 = await jikanService.getTrendingAnime();
    console.timeEnd("Jikan First Call");
    console.log(`✅ First Jikan call got ${jikanData1.length} anime`);

    console.time("Jikan Cached Call");
    const jikanData2 = await jikanService.getTrendingAnime();
    console.timeEnd("Jikan Cached Call");
    console.log(`🚀 Cached Jikan call got ${jikanData2.length} anime`);
  } catch (error) {
    console.error("❌ Jikan test failed:", error);
  }

  // Test 3: AnimeService with fallbacks
  console.log("\n🎯 Testing AnimeService with intelligent fallbacks...");

  try {
    const { animeService } = await import("./src/services/animeService.js");

    console.time("AnimeService Call");
    const animeData = await animeService.getTrendingAnime();
    console.timeEnd("AnimeService Call");
    console.log(
      `✅ AnimeService got ${animeData.length} anime from source: ${animeData[0]?.source}`,
    );

    // Test random anime
    const randomAnime = await animeService.getRandomAnime();
    console.log(
      `🎲 Random anime: ${randomAnime.title} (${randomAnime.source})`,
    );
  } catch (error) {
    console.error("❌ AnimeService test failed:", error);
  }

  console.log("\n✅ Cache performance tests completed!");
  console.log(
    "💡 Check the Network tab to see which requests hit the cache vs network",
  );
}

// Auto-run the test
testCachePerformance().catch(console.error);

