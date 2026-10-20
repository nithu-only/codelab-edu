/**
 * End-to-end verification of the in-browser Java (CheerpJ) engine through the
 * real dispatcher (`execute()`), driven in headless Chrome against the Vite dev
 * server. Serves `java-dev-check.html`.
 *
 * Usage (dev server must be running on port 5174):
 *   npm run dev            # in one terminal
 *   npm run verify:java    # in another
 *
 * Set JAVA_CHECK_URL to point elsewhere; set CHROME to a Chrome/Edge binary.
 */
import puppeteer from "puppeteer-core";

const CHROME =
  process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL =
  process.env.JAVA_CHECK_URL || "http://localhost:5174/java-dev-check.html";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
});

try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  page.on("requestfailed", (r) =>
    console.log("[reqfail]", r.url().slice(0, 120), r.failure()?.errorText),
  );
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction("window.__labDone === true", {
    timeout: 600000,
    polling: 1000,
  });
  const result = await page.evaluate(() => window.__labResult);
  console.log("===== JAVA ENGINE RESULT =====");
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result?.ok ? 0 : 1;
} finally {
  await browser.close();
}
