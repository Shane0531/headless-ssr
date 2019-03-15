const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
// performance test
// const devices = require("puppeteer/DeviceDescriptors");
// const iPhonex = devices["iPhone X"];

const url = "http://test-unive.makestar.com";

const map = new Map();

app.get("/", async (req, res) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"]
  });
  const page = await browser.newPage();

  // await page.emulate(iPhonex);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
  );
  await page.tracing.start({ path: "trace.json", screenshots: true });
  const local_url = url + req.originalUrl;
  await page.setRequestInterception(true);
  page.on("request", request => {
    const whitelist = ["document", "script", "xhr", "fetch"];
    if (!whitelist.includes(request.resourceType())) {
      return request.abort();
    }
    request.continue();
  });
  console.time("pagegoto");
  await page.goto(local_url);
  console.timeEnd("pagegoto", { waitUntil: "networkidle0" });
  const html = await page.evaluate(() => {
    return document.documentElement.innerHTML;
  });
  // await page.tracing.stop();
  await browser.close();
  res.send(html);
});

app.get("/*", async (req, res) => {
  res.redirect(url + req.originalUrl);
});

app.listen(8000, () => console.log(`Server is up`));
