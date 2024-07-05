import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';

export const POST = async (req) => {
  const {channelName} = await req.json();

  await connectToDatabase();
  console.log(channelName);
  
  try {
      const channel = await SocialMedia.findOne({ channelName });

      if (!channel) {
      return new Response(JSON.stringify({ message: 'Channel not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(channel), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error fetching channel data', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};