/**
 * FlowClip Performance Benchmarks
 *
 * Three measurable optimizations with before/after results.
 * Run: node benchmarks.js
 */

// ─────────────────────────────────────────────────────────────────────────────
// Benchmark 1: getItems — Sequential vs Parallel storage URL generation
// Before: ctx.storage.getUrl() called one-by-one (N serial awaits)
// After:  Promise.all() — all URLs fetched in parallel
// ─────────────────────────────────────────────────────────────────────────────

async function mockGetUrl(id) {
  // Simulates Convex storage.getUrl() latency (~15ms per call)
  return new Promise(resolve => setTimeout(() => resolve(`https://cdn.convex.cloud/${id}`), 15));
}

async function benchmark1_sequential(items) {
  const results = [];
  for (const item of items) {
    if (item.imageStorageID) {
      const imageUrl = await mockGetUrl(item.imageStorageID);
      results.push({ ...item, imageUrl });
    } else {
      results.push(item);
    }
  }
  return results;
}

async function benchmark1_parallel(items) {
  return await Promise.all(items.map(async (item) => {
    if (item.imageStorageID) {
      const imageUrl = await mockGetUrl(item.imageStorageID);
      return { ...item, imageUrl };
    }
    return item;
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Benchmark 2: Screenshot upload — base64 JSON vs raw Blob
// Before: base64 string sent as JSON body (~33% size overhead)
// After:  raw binary blob sent directly
// ─────────────────────────────────────────────────────────────────────────────

function benchmark2_base64Size(imageSizeBytes) {
  // base64 encoding inflates size by ~33%
  const base64Size = Math.ceil(imageSizeBytes * 4 / 3);
  // JSON wrapping adds ~50 bytes for the field name + quotes
  const jsonPayloadSize = base64Size + 50;
  return jsonPayloadSize;
}

function benchmark2_blobSize(imageSizeBytes) {
  // Raw binary blob — no encoding overhead
  return imageSizeBytes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Benchmark 3: useAuth polling — 500ms interval vs event-driven
// Before: polls every 500ms for 5s = up to 10 /auth/me requests on mount
// After:  single check on mount + storage event listener only
// ─────────────────────────────────────────────────────────────────────────────

function benchmark3_pollingRequests(durationMs, intervalMs) {
  return Math.floor(durationMs / intervalMs);
}

function benchmark3_eventDrivenRequests() {
  return 1; // single check on mount
}

// ─────────────────────────────────────────────────────────────────────────────
// Run all benchmarks
// ─────────────────────────────────────────────────────────────────────────────

async function run() {
  console.log("FlowClip Performance Benchmarks\n" + "=".repeat(50));

  // ── Benchmark 1 ──────────────────────────────────────────────────────────
  console.log("\n[1] getItems — Storage URL Generation (20 image clips)");

  const mockItems = Array.from({ length: 20 }, (_, i) => ({
    _id: `item_${i}`,
    type: "image",
    imageStorageID: `storage_${i}`,
    content: "Screenshot captured",
  }));

  const t1_before = performance.now();
  await benchmark1_sequential(mockItems);
  const t1_after_seq = performance.now();
  await benchmark1_parallel(mockItems);
  const t1_after_par = performance.now();

  const seq_time = (t1_after_seq - t1_before).toFixed(1);
  const par_time = (t1_after_par - t1_after_seq).toFixed(1);
  const speedup1 = (seq_time / par_time).toFixed(1);

  console.log(`  Before (sequential): ${seq_time}ms`);
  console.log(`  After  (parallel):   ${par_time}ms`);
  console.log(`  Speedup: ${speedup1}x faster`);
  console.log(`  Improvement: ${((1 - par_time / seq_time) * 100).toFixed(0)}% reduction in query time`);

  // ── Benchmark 2 ──────────────────────────────────────────────────────────
  console.log("\n[2] Screenshot Upload — Transfer Size (200KB screenshot)");

  const imageSizeBytes = 200 * 1024; // 200KB typical JPEG screenshot
  const before_size = benchmark2_base64Size(imageSizeBytes);
  const after_size = benchmark2_blobSize(imageSizeBytes);
  const size_reduction = ((1 - after_size / before_size) * 100).toFixed(1);

  console.log(`  Before (base64 JSON): ${(before_size / 1024).toFixed(1)} KB`);
  console.log(`  After  (raw blob):    ${(after_size / 1024).toFixed(1)} KB`);
  console.log(`  Reduction: ${size_reduction}% smaller payload`);
  console.log(`  Saved: ${((before_size - after_size) / 1024).toFixed(1)} KB per screenshot`);

  // ── Benchmark 3 ──────────────────────────────────────────────────────────
  console.log("\n[3] useAuth — Auth Check Requests on Dashboard Mount");

  const before_requests = benchmark3_pollingRequests(5000, 500);
  const after_requests = benchmark3_eventDrivenRequests();
  const req_reduction = ((1 - after_requests / before_requests) * 100).toFixed(0);

  console.log(`  Before (polling 500ms/5s): ${before_requests} /auth/me requests`);
  console.log(`  After  (event-driven):     ${after_requests} /auth/me request`);
  console.log(`  Reduction: ${req_reduction}% fewer auth requests on mount`);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("Summary");
  console.log("=".repeat(50));
  console.log(`  [1] getItems query:     ${speedup1}x faster with parallel URL generation`);
  console.log(`  [2] Screenshot upload:  ${size_reduction}% smaller payload (base64 → blob)`);
  console.log(`  [3] Auth on mount:      ${req_reduction}% fewer requests (polling → event-driven)`);
}

run().catch(console.error);
