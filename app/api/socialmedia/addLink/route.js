import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';


const apiCall = async (channelUrls, channel, divSelector, directory)  => {
    try{
        const channelData = await SocialMedia.findOne({ channelName: channel });
        // console.log(channelData.data.length);
        const response = await fetch(`${process.env.API_BASE_URL}/api/screenshot`, {
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

function convertUrlByChannel(url, channelName) {
  try {
    switch (channelName.toLowerCase()) {
      case ('faceboook'||'temp'):
        // Regular expression to match permalink.php and posts URL formats
        const facebookPermalinkRegex = /https?:\/\/(?:www\.)?facebook\.com\/permalink\.php\?story_fbid=([^&]+)&id=([^&]+)/i;
        const facebookPostsRegex = /https?:\/\/(?:www\.)?facebook\.com\/([^/]+)\/posts\/([^/]+)/i;

        // Convert permalink.php URL to posts URL
        if (facebookPermalinkRegex.test(url)) {
          console.log("permalink");
          return url.replace(facebookPermalinkRegex, 'https://www.facebook.com/$2/posts/$1');
        }

        // Check if the URL is already in the correct posts format
        if (facebookPostsRegex.test(url)) {
          return url;  // No conversion needed
        }

        // If URL does not match any of the expected formats, return an error
        throw new Error('Invalid Facebook URL format');
      case 'instagram':
        // Regular expression to match Instagram post URL format
        const instagramRegex = /https?:\/\/(?:www\.)?instagram\.com\/p\/([^/]+)/i;

        // Check if the URL is a valid Instagram post URL
        if (instagramRegex.test(url)) {
          return url;  // No conversion needed
        }

        // If URL does not match the expected format, return an error
        throw new Error('Invalid Instagram URL format');

      case 'twitter':
        // Regular expression to match Twitter status URL format
        const twitterXComRegex = /https?:\/\/x\.com\/(?:\w+)\/status(?:es)?\/(\d+)/i;
        // Check if the URL is a valid Twitter status URL
        if (twitterRegex.test(url)) {
          return url;  // No conversion needed
        }

        // If URL does not match the expected format, return an error
        throw new Error('Invalid Twitter URL format');

      default:
        // No transformation for unknown channels, return the original URL
        return url;
    }
  } catch (error) {
    console.error('Error in convertUrlByChannel:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export const POST = async (req) => {
  try {
    const { url, channel, scenario } = await req.json();
    if (!url || !channel || !scenario) {
      throw new Error('URL, channel, and scenario are required');
    }

    await connectToDatabase();
    const convertedUrl = convertUrlByChannel(url, channel);
    console.log("convertedUrl : ",convertedUrl);
    // Find the social media channel in the database
    const socialMediaChannel = await SocialMedia.findOne({ channelName: channel });
    if (!socialMediaChannel) {
      throw new Error(`Channel ${channel} not found`);
    }

    // Check if the URL already exists
    const urlExists = socialMediaChannel.data.some(entry => entry.url === convertedUrl);
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
    const newObject = { url: convertedUrl, scenario };

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
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};