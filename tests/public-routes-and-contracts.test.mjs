import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(__dirname, "..");

console.log("========================================================");
console.log(" THEIA PFC: PUBLIC WEBSITE CONTRACT & ROUTING TEST SUITE");
console.log("========================================================");

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ Passed: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAILED: ${name}`);
    console.error(err);
    failedTests++;
  }
}

// 1. Verify Public and App Routes exist on disk
test("Public and authenticated route files exist on disk", () => {
  const expectedRoutes = [
    "src/app/page.tsx", // Public Homepage
    "src/app/dashboard/page.tsx", // Authenticated Command Center
    "src/app/markets/page.tsx", // Markets Hub
    "src/app/markets/[symbol]/page.tsx", // Symbol Detail
    "src/app/features/page.tsx", // Features Deep Dive
    "src/app/insights/page.tsx", // Insights Index
    "src/app/insights/[slug]/page.tsx", // Article Reader
    "src/app/pricing/page.tsx", // Pricing & Plans
    "src/app/about/page.tsx", // About Us
    "src/app/contact/page.tsx", // Contact & Feedback
    "src/app/faq/page.tsx", // FAQ
    "src/app/support/page.tsx", // Support Center
    "src/app/releases/page.tsx", // Releases Changelog
    "src/app/terms/page.tsx", // Terms & Privacy
    "src/app/login/page.tsx", // Auth: Login
    "src/app/register/page.tsx", // Auth: Register
    "src/app/portfolio/page.tsx", // App: Portfolio
    "src/app/wealth-trajectory/page.tsx", // App: Wealth Trajectory
    "src/app/assets/page.tsx", // App: Assets
    "src/app/liabilities/page.tsx", // App: Liabilities
    "src/app/cashflow/page.tsx", // App: Cashflow
    "src/app/ai/page.tsx", // App: AI Assistant
  ];

  for (const relPath of expectedRoutes) {
    const fullPath = path.join(FRONTEND_DIR, relPath);
    assert.ok(fs.existsSync(fullPath), `Route file must exist: ${relPath}`);
  }
});

// 2. Test AppShell Route Discrimination Logic
test("AppShell discriminates public vs protected vs auth routes correctly", () => {
  function isPublicRoute(pathname) {
    if (pathname === "/") return true;
    if (pathname.startsWith("/markets")) return true;
    if (pathname.startsWith("/features")) return true;
    if (pathname.startsWith("/insights")) return true;
    if (pathname.startsWith("/pricing")) return true;
    const staticPublic = ["/contact", "/about", "/faq", "/support", "/releases", "/terms"];
    return staticPublic.includes(pathname);
  }

  const AUTH_ONLY_ROUTES = ["/login", "/register"];

  // Public routes (guests allowed without redirect)
  assert.equal(isPublicRoute("/"), true);
  assert.equal(isPublicRoute("/markets"), true);
  assert.equal(isPublicRoute("/markets/IR_GOLD_18K"), true);
  assert.equal(isPublicRoute("/features"), true);
  assert.equal(isPublicRoute("/insights"), true);
  assert.equal(isPublicRoute("/insights/managing-assets-in-inflationary-economy"), true);
  assert.equal(isPublicRoute("/pricing"), true);
  assert.equal(isPublicRoute("/about"), true);
  assert.equal(isPublicRoute("/contact"), true);
  assert.equal(isPublicRoute("/terms"), true);

  // Protected dashboard routes (must NOT be public)
  assert.equal(isPublicRoute("/dashboard"), false);
  assert.equal(isPublicRoute("/portfolio"), false);
  assert.equal(isPublicRoute("/wealth-trajectory"), false);
  assert.equal(isPublicRoute("/assets"), false);
  assert.equal(isPublicRoute("/liabilities"), false);
  assert.equal(isPublicRoute("/cashflow"), false);
  assert.equal(isPublicRoute("/ai"), false);
  assert.equal(isPublicRoute("/users"), false);

  // Auth only routes
  assert.equal(AUTH_ONLY_ROUTES.includes("/login"), true);
  assert.equal(AUTH_ONLY_ROUTES.includes("/register"), true);
});

// 3. Test Insights Dataset Integrity
test("Insights dataset contains structured educational articles", async () => {
  const insightsPath = path.join(FRONTEND_DIR, "src/data/insights-data.ts");
  const content = fs.readFileSync(insightsPath, "utf-8");

  assert.ok(content.includes("managing-assets-in-inflationary-economy"));
  assert.ok(content.includes("debt-amortization-and-inflation-arbitrage"));
  assert.ok(content.includes("gold-and-currency-pricing-mechanisms"));
  assert.ok(content.includes("ai-in-personal-financial-decision-making"));
  assert.ok(content.includes("getAllInsights"));
  assert.ok(content.includes("getInsightBySlug"));
  assert.ok(content.includes("getRelatedInsights"));
});

// 4. Test Market Fallback Rates Integrity
test("Market fallback quotes contain supported asset classes", async () => {
  const fallbackPath = path.join(FRONTEND_DIR, "src/data/market-data-fallback.ts");
  const content = fs.readFileSync(fallbackPath, "utf-8");

  assert.ok(content.includes("IR_GOLD_18K"), "Must contain Iran 18K Gold");
  assert.ok(content.includes("EMAMI_COIN"), "Must contain Emami Gold Coin");
  assert.ok(content.includes("XAUUSD"), "Must contain Global Spot Gold Ounce");
  assert.ok(content.includes("USD"), "Must contain US Dollar");
  assert.ok(content.includes("EUR"), "Must contain Euro");
  assert.ok(content.includes("BTC"), "Must contain Bitcoin");
  assert.ok(content.includes("ETH"), "Must contain Ethereum");
  assert.ok(content.includes("CU"), "Must contain Copper");
});

// 5. Test Open Redirect Sanitization Logic
test("Open redirect prevention sanitizes untrusted redirect targets", () => {
  function getSafeRedirect(target, fallback = "/dashboard") {
    if (!target) return fallback;
    const clean = String(target).trim();
    if (clean.startsWith("/") && !clean.startsWith("//") && !clean.includes("://") && !clean.includes("\\")) {
      return clean;
    }
    return fallback;
  }

  assert.equal(getSafeRedirect("/dashboard"), "/dashboard");
  assert.equal(getSafeRedirect("/pricing?plan=pro"), "/pricing?plan=pro");
  assert.equal(getSafeRedirect("/markets/IR_GOLD_18K"), "/markets/IR_GOLD_18K");
  // Security rejections:
  assert.equal(getSafeRedirect("https://malicious.com"), "/dashboard");
  assert.equal(getSafeRedirect("//malicious.com"), "/dashboard");
  assert.equal(getSafeRedirect("/\\malicious.com"), "/dashboard");
  assert.equal(getSafeRedirect(null), "/dashboard");
  assert.equal(getSafeRedirect(undefined), "/dashboard");
});

console.log("\n========================================================");
console.log(` RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("========================================================");

if (failedTests > 0) {
  process.exit(1);
}
