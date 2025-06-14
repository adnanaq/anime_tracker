// Copy-paste this into browser console to test cache tracking
// 🧪 Cache Testing Script for Dashboard Sections

console.log("🧪 Starting Cache Test...");

// Test 1: Check initial cache state
console.group("📊 Initial Cache State");
try {
  // Try to access cache stats (may not be available without proper imports)
  if (window.animeStore) {
    console.log("✅ AnimeStore available");
  } else {
    console.log("❌ AnimeStore not available in window");
  }

  // Check for cache manager in various possible locations
  const possibleCacheLocations = [
    "window.cacheManager",
    "window.getCacheStats",
    "window.malCache",
    "window.jikanCache",
  ];

  possibleCacheLocations.forEach((location) => {
    try {
      const value = eval(location);
      console.log(`✅ ${location}: Available`);
    } catch (e) {
      console.log(`❌ ${location}: Not available`);
    }
  });
} catch (error) {
  console.error("Cache state check failed:", error);
}
console.groupEnd();

// Test 2: Monitor network requests
console.group("🌐 Network Request Monitoring");
const originalFetch = window.fetch;
let requestCount = 0;
const requestLog = [];

window.fetch = function (...args) {
  requestCount++;
  const url = args[0];
  const timestamp = new Date().toISOString();

  if (typeof url === "string") {
    // Track anime-related requests
    if (
      url.includes("api.jikan.moe") ||
      url.includes("api.myanimelist.net") ||
      url.includes("animeschedule.net") ||
      url.includes("graphql.anilist.co")
    ) {
      const requestInfo = {
        count: requestCount,
        url: url,
        timestamp: timestamp,
        service: url.includes("jikan")
          ? "Jikan"
          : url.includes("myanimelist")
            ? "MAL"
            : url.includes("anilist")
              ? "AniList"
              : url.includes("animeschedule")
                ? "AnimeSchedule"
                : "Unknown",
      };

      requestLog.push(requestInfo);
      console.log(
        `🚀 API Request #${requestCount}:`,
        requestInfo.service,
        "→",
        url,
      );
    }
  }

  return originalFetch.apply(this, args);
};

console.log(
  "✅ Network monitoring active. Try using different dashboard sections!",
);
console.log("📋 To see request log: console.log(requestLog)");
console.groupEnd();

// Test 3: Instructions for manual testing
console.group("📋 Manual Testing Instructions");
console.log(
  '1. 🎲 Click "Get Random Anime" button → Should see Jikan API requests',
);
console.log("2. 🌸 Try SeasonalAnime section → Should see MAL API requests");
console.log(
  "3. 📅 Try AnimeSchedule section → Should see AnimeSchedule.net requests",
);
console.log(
  "4. 🔍 Try searching for anime → Should see MAL/AniList API requests",
);
console.log("");
console.log("After testing, run:");
console.log("   console.log(requestLog)  // See all API requests made");
console.log("   requestLog.length       // Total API requests");
console.log("");
console.log("🎯 Expected Results:");
console.log(
  "   🎲 Random Anime: Uses Jikan API directly (cache intentionally bypassed for randomness)",
);
console.log(
  "   ❌ Seasonal Anime: May use MAL API directly (cache bypassed - needs fixing)",
);
console.log(
  "   ❌ Anime Schedule: May use AnimeSchedule API directly (cache bypassed - needs fixing)",
);
console.groupEnd();

// Make utilities available
window.cacheTestUtils = {
  getRequestLog: () => requestLog,
  getRequestCount: () => requestCount,
  clearLog: () => {
    requestLog.length = 0;
    requestCount = 0;
    console.log("🧹 Request log cleared");
  },
  restoreFetch: () => {
    window.fetch = originalFetch;
    console.log("🔄 Original fetch restored");
  },
};

console.log("✅ Cache testing ready! Use window.cacheTestUtils for utilities");

