// Ensure correct import paths based on your project structure
import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';

export const POST = async (req) => {
  // Handle only POST requests
  if (req.method === 'POST') {
    await connectToDatabase(); // Connect to the database

    try {
      const formData = await req.json(); // Parse the request body
      console.log(formData); // Log the form data for debugging
      
        // Check if the channel already exists in the database 
      const existingChannel = await SocialMedia.findOne({ channelName: formData.channelName });
      if (existingChannel) {
        return new Response(JSON.stringify({ error: "Channel already exists" }), { status: 409 });
      }

      // Create a new social media channel document and save it to the database
      const newSocialMedia = new SocialMedia(formData);
      await newSocialMedia.save();
      return new Response(JSON.stringify({ message: "Channel created successfully" }), { status: 201 });
    } catch (error) {
      console.error('Error creating channel:', error); // Log the error for debugging
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  } else {
    // Respond with a 405 Method Not Allowed status for non-POST requests
    return new Response(JSON.stringify({ success: false, error: `Method ${req.method} Not Allowed` }), { status: 405 });
  }
};
