import connectToDatabase from '@/app/lib/mongodb.mjs';
import JobResult from '@/app/lib/models/resultSchema.mjs';
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.mjs';

export const POST = async (req, res) => {
  try {
    const { channel, referenceUrl, jobId } = await req.json();
    // console.log('Received channel:', channel);
    // console.log('Received referenceUrl:', referenceUrl);
    // console.log('Received jobId:', jobId);

    if (!channel || !referenceUrl || !jobId) {
      return new Response(JSON.stringify({ error: 'channel, referenceUrl, and jobId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await connectToDatabase();

    // Find the job with the given jobId
    const result = await JobResult.findById(jobId);

    if (!result) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find the platform matching the channel within the job
    const platform = result.platforms.find(p => p.platformName === channel);
    if (!platform) {
      return new Response(JSON.stringify({ error: 'Platform not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Filter images in the found platform
    let testUrl;
    const updatedImages = platform.images.filter(image => {
      if (image.referenceUrl === referenceUrl) {
        testUrl = image.testUrl;
        return false; // Remove the matched image from the array
      }
      return true; // Keep other images
    });

    // Reassign the images array
    platform.images = updatedImages;

    // Save the updated result document
    await result.save();

    // Update the ScreenshotReference document
    const screenshotRef = await ScreenshotReference.findOneAndUpdate(
      { channel, url: referenceUrl },
      { $set: { url: testUrl } },
      { new: true, useFindAndModify: false }
    );

    return new Response(JSON.stringify({ message: 'Reference URL updated successfully', screenshotRef }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating reference URL:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
