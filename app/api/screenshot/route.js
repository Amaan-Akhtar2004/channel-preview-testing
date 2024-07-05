import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { PassThrough } from 'stream';
import cloudinary from '@/app/lib/cloudinary.mjs';
import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.mjs';
import ScreenshotTest from '@/app/lib/models/ScreenshotTest.mjs';
// import 'dotenv/config';

const viewports = [
  { width: 1920, height: 1080 }  // Large Desktop
];

async function runLoginByPassCode(page, loginByPassCode) {
  try {
    const runCode = new Function(`
      return (async () => {
        ${loginByPassCode}
      })();
    `);
    await page.evaluate(runCode);
  } catch (error) {
    console.error('Error executing loginByPass code:', error);
  }
}

export const POST = async (req) => {
  const { link, selector, name, directory, channel } = await req.json();

  if (!link || !selector) {
    return new Response('URL and selector are required', { status: 400 });
  }

  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
  );
  await connectToDatabase();
  const url = link.url;
  const scenario = link.scenario;
  console.log(url);
  console.log(scenario);
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      const socialMediaChannel = await SocialMedia.findOne({ channelName: channel });
      const loginByPassCode = socialMediaChannel ? socialMediaChannel.loginByPass : null;

      if (loginByPassCode) {
        await runLoginByPassCode(page, loginByPassCode);
      }

      await page.waitForSelector(selector, { timeout: 60000 });

      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          element.style.zIndex = 1000000;
        }
      }, selector);

      const element = await page.$(selector);

      if (element) {
        const screenshotBuffer = await element.screenshot({ encoding: 'binary' });
        const screenshotName = `unique_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', public_id: screenshotName, overwrite: false },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          const bufferStream = new PassThrough();
          bufferStream.end(screenshotBuffer);
          bufferStream.pipe(stream);
        });

        const screenshotData = {
          viewport: `${viewport.width}x${viewport.height}`,
          scenario,
          url: uploadResult.secure_url,
          channel
        };

        if (directory === 'reference') {
          const newScreenshot = new ScreenshotReference(screenshotData);
          await newScreenshot.save();
          await SocialMedia.findOneAndUpdate(
            { channelName: channel, 'data.url': url },
            { $set: { 'data.$.screenshotReference': newScreenshot._id } },
            { new: true, useFindAndModify: false }
          );
        } else {
          const newScreenshot = new ScreenshotTest(screenshotData);
          await newScreenshot.save();
          await SocialMedia.findOneAndUpdate(
            { channelName: channel, 'data.url': url },
            { $set: { 'data.$.screenshotTest': newScreenshot._id } },
            { new: true, useFindAndModify: false }
          );
        }
      } else {
        return new Response('Selector not found', { status: 404 });
      }
    }

    await page.close();
    await browser.close();
    return new Response(JSON.stringify({ message: "The screenshots have been generated"}), { status: 200 });
  } catch (error) {
    console.error(error);
    await browser.close();
    return new Response('Error capturing screenshot', { status: 500 });
  }
};
