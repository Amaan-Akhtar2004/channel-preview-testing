import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.mjs';

export const DELETE = async (req) => {
  const { channelName } = await req.json(); // Parse the request body to get the channel name
  console.log(channelName); // Log the channel name for debugging
  
  // Check if the channel name is provided
  if (!channelName) {
    return new Response('Channel name is required', { 
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

    // Collect all screenshotReference IDs from the channel data
    const screenshotReferences = channel.data.map(link => link.screenshotReference);

    // Delete the channel
    await SocialMedia.findOneAndDelete({ channelName });

    // Delete associated screenshot references
    await ScreenshotReference.deleteMany({ _id: { $in: screenshotReferences } });

    return new Response('Channel and associated screenshot references deleted successfully', { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error deleting channel and screenshot references:', error); // Log the error for debugging
    
    // Return a 500 response if there is an error
    return new Response('An error occurred while deleting the channel and screenshot references', { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
