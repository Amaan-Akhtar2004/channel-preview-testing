import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.mjs';

export const DELETE = async (req) => {
    const {channelName , url} = await req.json();
    console.log(channelName);
    if (!channelName || !url) {
        return new Response('Channel name is required', { status: 400,headers: { 'Content-Type': 'application/json' }});
    }
    
    try {
      await connectToDatabase();
      // Find the channel to get associated screenshot references
      const channel = await SocialMedia.findOne({ channelName });
  
      if (!channel) {
        return new Response('Channel not found', { status: 404,headers: { 'Content-Type': 'application/json' }});
      }
      const linkIndex = channel.data.findIndex((link) => link.url === url);

      if (linkIndex === -1) {
        return res.status(404).json({ error: 'Link not found' });
      }

      channel.data.splice(linkIndex, 1);
      await channel.save();

    return new Response('Link deleted successfully', { status: 200, headers: { 'Content-Type': 'application/json' }});
  } catch (error) {
    console.error('Error deleting channel and screenshot references:', error);
    return new Response('An error occurred while deleting the link', { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
};


      