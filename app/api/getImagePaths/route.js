import connectToDatabase from '@/app/lib/mongodb.mjs';
import JobResult from '@/app/lib/models/resultSchema.mjs';

// Define revalidate for Vercel
export const revalidate = 0;

// GET function to fetch job results
export async function GET(request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  // Check if jobId is provided in the request
  if (!jobId) {
    return new Response(JSON.stringify({ error: 'jobId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await connectToDatabase();

    // Fetch job results based on jobId
    const results = await JobResult.find({ _id: jobId });

    // If no results found for the given jobId, return 404 Not Found
    if (!results.length) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Format fetched results for response
    const formattedResults = formatResults(results);

    console.log(formattedResults);

    // Return formatted results as JSON response with 200 OK status
    return new Response(JSON.stringify(formattedResults), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching job results:', error);

    // Return 500 Internal Server Error if an error occurs
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper function to format fetched job results
function formatResults(results) {
  const formattedResults = {};

  results.forEach(result => {
    // Format job date to a specified format
    const formattedJobDate = formatJobDate(result.jobDate);

    if (!formattedResults[formattedJobDate]) {
      formattedResults[formattedJobDate] = {};
    }

    // Iterate through platforms in the result
    result.platforms.forEach(platform => {
      const platformName = platform.platformName;
      const images = formatImages(platform.images);

      if (!formattedResults[formattedJobDate][platformName]) {
        formattedResults[formattedJobDate][platformName] = {};
      }

      // Map formatted image data to the platform and job date
      images.forEach(image => {
        formattedResults[formattedJobDate][platformName][image.imageName] = [
          image.referenceUrl,
          image.testUrl,
          image.diffUrl
        ];
      });
    });
  });

  return formattedResults;
}

// Helper function to format job date to a specified format
function formatJobDate(jobDate) {
  return jobDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).replace(/[\s,]/g, '-').replace(/--/g, '-');
}

// Helper function to format image data for response
function formatImages(images) {
  return images.map(image => ({
    imageName: image.imageName,
    referenceUrl: image.referenceUrl,
    testUrl: image.testUrl,
    diffUrl: image.diffUrl
  }));
}
