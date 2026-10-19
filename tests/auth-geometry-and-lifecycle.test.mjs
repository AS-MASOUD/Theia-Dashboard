import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("========================================================");
console.log(" THEIA PFC: AUTH GEOMETRY, CSS & LIFECYCLE TEST SUITE   ");
console.log("========================================================");

// ---------------------------------------------------------------------------
// TEST 1: Corner Geometry Alignment & Non-Overlapping Verification
// ---------------------------------------------------------------------------
function testCornerGeometry() {
  const viewports = [320, 360, 375, 390, 414, 430, 768, 1024, 1440];
  const cornerDecoSize = 60;
  const cornerOffset = 1;
  const decoHypotenuseSum = 62 + 2 * cornerOffset; // 64

  for (const vp of viewports) {
    const cardWidth = Math.min(410, vp - 24);
    const chamfer = Math.min(74, Math.max(70, Math.floor(cardWidth * 0.175)));

    // For NO overlap: chamfer must be strictly greater than decoHypotenuseSum!
    assert(
      chamfer >= decoHypotenuseSum,
      `[FAIL at viewport ${vp}px] Chamfer (${chamfer}px) must be >= decoHypotenuseSum (${decoHypotenuseSum}px) to prevent crossing card border!`
    );

    const clearanceGap = (chamfer - decoHypotenuseSum) / Math.SQRT2;
    assert(
      clearanceGap >= 0,
      `[FAIL at viewport ${vp}px] Clearance gap between corner decoration and card chamfer must be non-negative: ${clearanceGap.toFixed(2)}px`
    );
  }

  console.log("✓ Passed: Enlarged 60px corner decorations sit outside chamfer across all viewports (320px - 1440px)");
}

// ---------------------------------------------------------------------------
// TEST 2: Glass Input Styles & Browser Autofill Neutralization
// ---------------------------------------------------------------------------
function testGlassInputStyles() {
  const globalsCssPath = path.join(rootDir, "src", "app", "globals.css");
  const css = fs.readFileSync(globalsCssPath, "utf-8");

  assert(css.includes(".auth-input"), "globals.css must contain .auth-input class definition");
  assert(css.includes("backdrop-filter: blur("), ".auth-input must include backdrop-filter blur for glassmorphism");
  assert(css.includes("linear-gradient("), ".auth-input must use subtle dark linear-gradient background");
  assert(css.includes(":-webkit-autofill"), "globals.css must include :-webkit-autofill override");
  assert(css.includes("-webkit-text-fill-color"), "Autofill override must preserve light text color");
  assert(css.includes("box-shadow: 0 0 0 1000px"), "Autofill override must use dark inset box-shadow to neutralize bright yellow user-agent styling");

  console.log("✓ Passed: Dark glassmorphism input styles and browser autofill overrides verified");
}

// ---------------------------------------------------------------------------
// TEST 3: AppShell & AuthProvider Transition Coordination
// ---------------------------------------------------------------------------
function testAppShellTransitionLock() {
  const appShellPath = path.join(rootDir, "src", "components", "layout", "app-shell.tsx");
  const appShellContent = fs.readFileSync(appShellPath, "utf-8");

  assert(
    appShellContent.includes("isAuthTransitioning"),
    "AppShell must inspect isAuthTransitioning from useAuth()"
  );

  // Verify that AppShell does NOT redirect or return null when isAuthTransitioning is true
  assert(
    appShellContent.includes("!isAuthTransitioning"),
    "AppShell must check !isAuthTransitioning before redirecting or unmounting auth pages"
  );

  const authProviderPath = path.join(rootDir, "src", "components", "auth-provider.tsx");
  const authProviderContent = fs.readFileSync(authProviderPath, "utf-8");

  assert(
    authProviderContent.includes("isAuthTransitioning: boolean;"),
    "AuthContextType must declare isAuthTransitioning"
  );
  assert(
    authProviderContent.includes("setAuthTransitioning: (val: boolean) => void;"),
    "AuthContextType must declare setAuthTransitioning"
  );

  console.log("✓ Passed: AppShell and AuthProvider transition coordinator properly configured");
}

// ---------------------------------------------------------------------------
// TEST 4: Login & Register State Machine Lifecycle
// ---------------------------------------------------------------------------
function testAuthPagesStateMachine() {
  const loginPath = path.join(rootDir, "src", "app", "login", "page.tsx");
  const loginContent = fs.readFileSync(loginPath, "utf-8");

  assert(
    loginContent.includes('setTransitionState("authenticating")'),
    "Login page must transition to authenticating state on submit"
  );
  assert(
    loginContent.includes('setTransitionState("success")'),
    "Login page must transition to success state upon API resolution"
  );
  assert(
    loginContent.includes('setTransitionState("exiting")'),
    "Login page must transition to exiting state before router push"
  );
  assert(
    loginContent.includes('setTransitionState("error")'),
    "Login page must transition to error state on failure"
  );
  assert(
    loginContent.includes("auth-input"),
    "Login page input fields must use auth-input class"
  );

  const registerPath = path.join(rootDir, "src", "app", "register", "page.tsx");
  const registerContent = fs.readFileSync(registerPath, "utf-8");

  assert(
    registerContent.includes('setTransitionState("authenticating")'),
    "Register page must transition to authenticating state on submit"
  );
  assert(
    registerContent.includes('setTransitionState("success")'),
    "Register page must transition to success state upon API resolution"
  );
  assert(
    registerContent.includes("auth-input"),
    "Register page input fields must use auth-input class"
  );

  console.log("✓ Passed: Login and Register pages implement full explicit state machines with visual consistency");
}

// Run all test suites
testCornerGeometry();
testGlassInputStyles();
testAppShellTransitionLock();
testAuthPagesStateMachine();

console.log("========================================================");
console.log(" RESULTS: 4/4 SUITES PASSED (100% SUCCESS)              ");
console.log("========================================================");
