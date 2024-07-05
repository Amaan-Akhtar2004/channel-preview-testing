import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';


const apiCall = async (channelUrls, channel, divSelector, directory)  => {
    try{
        const channelData = await SocialMedia.findOne({ channelName: channel });
        // console.log(channelData.data.length);
        const response = await fetch(" http://localhost:4001/screenshot", {
            method: "POST",
            headers: { "Content-Type" : "application/json"},
            body: JSON.stringify({
                link : channelUrls,
                selector : divSelector,
                name: `url_${channelData.data.length}`,
                directory,
                channel
            })
        });
        if (!response.ok) {
            throw new Error('Failed to call screenshot API');
        }
        return await response.json();
    } catch (error) {
        console.error('Error in apiCall:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

// API route that accepts a URL, channel, and scenario
export const POST = async (req) => {
    try {
      const { url, channel, scenario } = await req.json();
      if (!url || !channel || !scenario) {
        throw new Error('URL, channel, and scenario are required');
      }
      // Ensure the URL contains the channel name (case-insensitive check)
      if (!url.toLowerCase().includes(channel.toLowerCase())) {
        throw new Error(`URL does not belong to channel ${channel}`);
      }
      await connectToDatabase();
  
      // Find the social media channel in the database
      const socialMediaChannel = await SocialMedia.findOne({ channelName: channel });
      if (!socialMediaChannel) {
        throw new Error(`Channel ${channel} not found`);
      }
      // Check if the URL already exists
      const urlExists = socialMediaChannel.data.some(entry => entry.url === url);
      if (urlExists) {
        return new Response(JSON.stringify({ message: 'URL already exists' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
  
      // Ensure divSelector is present
      const { divSelector } = socialMediaChannel;
      if (!divSelector) {
        throw new Error('divSelector not found for the selected channel');
      }
  
      // Create the new object
      const newObject = { url, scenario };
      
      const startTime = Date.now();
      // Call the external API with the appropriate parameters
      await apiCall(newObject, channel, divSelector, "reference");
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(duration);
  
      // Add the new object to the channel array
      socialMediaChannel.data.push(newObject);
      // Save the updated channel document
      await socialMediaChannel.save();
  
      return new Response(JSON.stringify({ message: 'URL added successfully', newObject }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error processing URL:', error);
      return new Response(JSON.stringify({ message: 'Error processing URL', error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
};