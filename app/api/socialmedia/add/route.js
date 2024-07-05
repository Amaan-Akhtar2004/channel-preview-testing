// pages/api/socialmedia.js

// Ensure correct import paths based on your project structure
import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';

export const POST = async (req) => {
  if (req.method === 'POST') {
    await connectToDatabase();
    
    try {
      const formData = await req.json();
      console.log(formData);

      // Check if the channel already exists
      const existingChannel = await SocialMedia.findOne({ channelName: formData.channelName });
      if (existingChannel) {
        return new Response(JSON.stringify({ error: "Channel already exists" }), { status: 409 });
      }

      const newSocialMedia = new SocialMedia(formData);
      await newSocialMedia.save();
      return new Response(JSON.stringify({ message: "Channel created successfully" }), { status: 201 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  } else {
    return new Response(JSON.stringify({ success: false, error: `Method ${req.method} Not Allowed` }), { status: 405 });
  }
};
