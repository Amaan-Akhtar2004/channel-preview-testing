import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';

export const POST = async (req) => {
  try {
    const { channelName } = await req.json();

    if (!channelName) {
      return new Response(
        JSON.stringify({ message: 'Channel name is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectToDatabase();
    console.log(channelName);

    // Fetch the channel document from the database
    const channel = await SocialMedia.findOne({ channelName });

    // If the channel is not found, return a 404 response
    if (!channel) {
      return new Response(
        JSON.stringify({ message: 'Channel not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return the channel data
    return new Response(
      JSON.stringify(channel), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching channel data:', error);

    // Return an error response
    return new Response(
      JSON.stringify({ message: 'Error fetching channel data', error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
