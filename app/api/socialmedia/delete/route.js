import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.mjs';

export const DELETE = async (req) => {
    const {channelName} = await req.json();
    console.log(channelName);
    if (!channelName) {
        return new Response('Channel name is required', { status: 400,headers: { 'Content-Type': 'application/json' }});
    }
    
    try {
      await connectToDatabase();
      // Find the channel to get associated screenshot references
      const channel = await SocialMedia.findOne({ channelName });
  
      if (!channel) {
        return new Response('Channel not found', { status: 404,headers: { 'Content-Type': 'application/json' }});
      }
  
      // Collect all screenshotReference IDs from the channel data
      const screenshotReferences = channel.data.map(link => link.screenshotReference);
      await SocialMedia.findOneAndDelete({ channelName });

    // Delete associated screenshot references
    await ScreenshotReference.deleteMany({ _id: { $in: screenshotReferences } });

    return new Response('Channel and associated screenshot references deleted successfully', { status: 200, headers: { 'Content-Type': 'application/json' }});
  } catch (error) {
    console.error('Error deleting channel and screenshot references:', error);
    return new Response('An error occurred while deleting the channel and screenshot references', { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
};


      