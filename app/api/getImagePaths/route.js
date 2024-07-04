import connectToDatabase from '@/app/lib/mongodb.mjs';
import JobResult from '@/app/lib/models/resultSchema.mjs';
// Define the GET handler
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();

    const results = await JobResult.find({});
    // Initialize an empty object to store formatted results
    const formattedResults = {};

    // Transform data to get an object of image paths by platform and job date
    results.forEach(result => {
      const jobDate = result.jobDate.toLocaleString(); // Format the job date as YYYY-MM-DD

      if (!formattedResults[jobDate]) {
        formattedResults[jobDate] = {};
      }

      result.platforms.forEach(platform => {
        const platformName = platform.platformName;
        const images = platform.images.map(image => ({
          imageName: image.imageName,
          referenceUrl: image.referenceUrl,
          testUrl: image.testUrl,
          diffUrl: image.diffUrl
        }));

        if (!formattedResults[jobDate][platformName]) {
          formattedResults[jobDate][platformName] = {};
        }

        images.forEach(image => {
          formattedResults[jobDate][platformName][image.imageName] = [
            image.referenceUrl,
            image.testUrl,
            image.diffUrl
          ];
        });
      });
    });

    console.log(formattedResults);

    return new Response(JSON.stringify(formattedResults), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
