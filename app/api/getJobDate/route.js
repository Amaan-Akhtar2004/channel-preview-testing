import JobResult from "@/app/lib/models/resultSchema.mjs"; // Path to your Mongoose JobResult model

export const POST = async (req) => {
    const { jobId } = await req.json();
  try {
    const result = await JobResult.findById(jobId);
    if (result) {
      const responseBody = JSON.stringify({ jobDate: result.jobDate });
      return new Response(responseBody, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      const responseBody = JSON.stringify({ error: 'JobResult not found for jobId' });
      return new Response(responseBody, {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching jobDate:', error);
    const responseBody = JSON.stringify({ error: 'Internal Server Error' });
    return new Response(responseBody, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
