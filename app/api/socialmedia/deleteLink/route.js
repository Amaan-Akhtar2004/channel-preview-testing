import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.mjs';

export const DELETE = async (req) => {
  const { channelName, url } = await req.json(); // Parse the request body to get the channel name and URL
  console.log(channelName, url); // Log the channel name and URL for debugging

  // Check if the channel name and URL are provided
  if (!channelName || !url) {
    return new Response('Channel name and URL are required', { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await connectToDatabase(); // Connect to the database

    // Find the channel to get associated screenshot references
    const channel = await SocialMedia.findOne({ channelName });

    // If the channel is not found, return a 404 response
    if (!channel) {
      return new Response('Channel not found', { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find the index of the link in the channel data
    const linkIndex = channel.data.findIndex((link) => link.url === url);

    // If the link is not found, return a 404 response
    if (linkIndex === -1) {
      return new Response('Link not found', { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the screenshot reference ID from the link
    const screenshotReferenceId = channel.data[linkIndex].screenshotReference;

    // Remove the link from the channel data
    channel.data.splice(linkIndex, 1);
    await channel.save(); // Save the updated channel

    // Delete the corresponding screenshot reference
    await ScreenshotReference.findByIdAndDelete(screenshotReferenceId);

    return new Response('Link and corresponding screenshot reference deleted successfully', { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting link and screenshot reference:', error); // Log the error for debugging
    
    // Return a 500 response if there is an error
    return new Response('An error occurred while deleting the link and screenshot reference', { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
