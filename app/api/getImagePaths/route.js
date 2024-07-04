import connectToDatabase from '@/app/lib/mongodb.mjs';
import JobResult from '@/app/lib/models/resultSchema.mjs';

export const revalidate = 0; // this is the new line added for vercel

export async function GET(request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  try {
    await connectToDatabase();

    let results;
    if (jobId) {
      results = await JobResult.find({ _id: jobId });
    } else {
      results = await JobResult.find({});
    }

    const formattedResults = {};

    results.forEach(result => {
      const formattedJobDate = result.jobDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(/[\s,]/g, '-').replace(/--/g, '-');

      if (!formattedResults[formattedJobDate]) {
        formattedResults[formattedJobDate] = {};
      }

      result.platforms.forEach(platform => {
        const platformName = platform.platformName;
        const images = platform.images.map(image => ({
          imageName: image.imageName,
          referenceUrl: image.referenceUrl,
          testUrl: image.testUrl,
          diffUrl: image.diffUrl
        }));

        if (!formattedResults[formattedJobDate][platformName]) {
          formattedResults[formattedJobDate][platformName] = {};
        }

        images.forEach(image => {
          formattedResults[formattedJobDate][platformName][image.imageName] = [
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
