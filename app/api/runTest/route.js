import captureScreenshots from '@/app/server/captureScreenshots.mjs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import cloudinary from "@/app/lib/cloudinary";
import axios from 'axios';
import stream from 'stream'; 
import fs from 'fs';
import path from 'path';
import SocialMedia from "@/app/lib/models/channels.mjs";
import ScreenshotReference from "@/app/lib/models/ScreenshotReference.mjs";
import ScreenshotTest from "@/app/lib/models/ScreenshotTest.mjs";
import connectToDatabase from "@/app/lib/mongodb.mjs";
import JobResult from "@/app/lib/models/resultSchema.mjs";
import mongoose from 'mongoose';
// import { data } from "autoprefixer";

// Function to fetch image from Cloudinary and return as buffer
async function fetchImageBufferFromCloudinary(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

// Function to upload image buffer to Cloudinary
async function uploadImageBufferToCloudinary(buffer, cloudPath, overwrite = false) {
  // If overwrite is false, check if the image already exists
  if (!overwrite) {
    const existingUrl = await imageExistsOnCloudinary(cloudPath);
    if (existingUrl) {
      return existingUrl;
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { public_id: cloudPath, resource_type: 'image', overwrite},
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
}

// Function to check if an image exists on Cloudinary
async function imageExistsOnCloudinary(public_id) {
  try {
    const result = await cloudinary.api.resource(public_id, { resource_type: 'image' });
    return result.secure_url;
  } catch (error) {
    if (error.http_code === 404) {
      return null;
    }
    throw error;
  }
}

// Function to compare two image buffers and generate a diff image, then upload to Cloudinary
async function compareImagesAndUpload(img1Buffer, img2Buffer, diffCloudPath, overwrite = false) {
  try {
    const img1Data = PNG.sync.read(img1Buffer);
    const img2Data = PNG.sync.read(img2Buffer);
    const { width, height } = img1Data;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
      img1Data.data,
      img2Data.data,
      diff.data,
      width,
      height,
      { threshold: 0.3 }
    );

    if (numDiffPixels > 0) {
      const diffBuffer = PNG.sync.write(diff);
      const diffUrl = await uploadImageBufferToCloudinary(diffBuffer, diffCloudPath, overwrite);
      console.log(`Uploaded diff image to Cloudinary: ${diffUrl}`);

      return { numDiffPixels, diffUrl };
    } else {
      console.log(`No difference found between images`);
      return { numDiffPixels: 0, diffUrl: null };
    }
  } catch (error) {
    console.error(`Error comparing or uploading images:`, error);
    return { numDiffPixels: 0, diffUrl: null };
  }
}

// Function to read URLs from JSON file
// function readUrlsFromFile(filePath) {
//   const fileData = fs.readFileSync(filePath, 'utf8');
//   return JSON.parse(fileData);
// }

// Function to compare images in two sets of Cloudinary URLs
async function compareCloudinaryImages(referenceData, newData, channel, overwrite = false) {
  try {
    let totalDiffPixels = 0;
    const results = {};
    for (let i = 0; i < Math.min(referenceData.length, newData.length); i++) {
      console.log(referenceData[i].url);
      const img1Buffer = await fetchImageBufferFromCloudinary(referenceData[i].url);
      const img2Buffer = await fetchImageBufferFromCloudinary(newData[i].url);

      const diffCloudPath = `diffs/${channel}/diff_${i}`;
      const { numDiffPixels, diffUrl } = await compareImagesAndUpload(img1Buffer, img2Buffer, diffCloudPath, overwrite);

      totalDiffPixels += numDiffPixels;

      if (numDiffPixels > 0) {
        results[referenceData[i].scenario] = [
          referenceData[i].url,
          newData[i].url,
          diffUrl,
          referenceData[i].id,
        ];
      }
    }
    // console.log(results);
    console.log(`Total difference pixels: ${totalDiffPixels}`);
    return results;
  } catch (error) {
    console.error('Error comparing Cloudinary images:', error);
    return {};
  }
}

export const POST = async () => {
  try {
    // Fetch all unique channel names
    connectToDatabase();
    const channels = await SocialMedia.distinct('channelName');

    const newScreenshots = await captureScreenshots("new");
    console.log("Screenshots generated");

    const outputDir = path.join(process.cwd(), 'public', 'results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const comparisonResults = {};
    // console.log(channels);
    for (let channel of channels) {
      const referenceScreenshots = await ScreenshotReference.find({ channel });
      const testScreenshots = await ScreenshotTest.find({ channel });

      // Prepare data for comparison (assuming you have URLs stored in 'url' field)
      const referenceData = referenceScreenshots.map(screenshot => ({ id: screenshot._id,url: screenshot.url, scenario: screenshot.scenario }));
      const newData = testScreenshots.map(screenshot => ({ url: screenshot.url, scenario: screenshot.scenario }));
      // console.log(referenceData);
      const results = await compareCloudinaryImages(referenceData, newData, channel);
      comparisonResults[channel] = results;
    }

    // Prepare data in the desired format for MongoDB
    const dataToSave = Object.keys(comparisonResults).map(platformName => ({
      platformName,
      images: Object.keys(comparisonResults[platformName]).map(scenario => ({
        imageName: scenario.trim(), // Assuming scenario is the imageName
        referenceUrl: comparisonResults[platformName][scenario][0], // Reference URL
        testUrl: comparisonResults[platformName][scenario][1], // Test URL
        diffUrl: comparisonResults[platformName][scenario][2], // Diff URL
        screenshotReference: comparisonResults[platformName][scenario][3] // Store ObjectId
      }))
    }));
    try {
      let currentdate = new Date();
      let datetime = "Last Sync: " + currentdate.getDay() + "/" + currentdate.getMonth() 
                          + "/" + currentdate.getFullYear() + " @ " 
                          + currentdate.getHours() + ":" 
                          + currentdate.getMinutes() + ":" + currentdate.getSeconds();
      console.log("test run at : ",datetime);
      const result = new JobResult({
        "jobDate": datetime,
        platforms: dataToSave,
      });

      // Save the document to MongoDB
      await result.save();
      console.log("Data saved successfully to MongoDB");
    } catch (error) {
      console.error("Error saving data to MongoDB:", error);
    }

    console.log("Image comparison and upload to Cloudinary complete");

    return new Response(JSON.stringify({ message: "Test complete" }), { status: 201 });
  } catch (err) {
    console.error('Error in POST request:', err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}

