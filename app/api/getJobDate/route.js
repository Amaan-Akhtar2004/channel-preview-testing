import JobResult from "@/app/lib/models/resultSchema.mjs"; // Import Mongoose JobResult model

export const POST = async (req) => {
  try {
    // Parse JSON body from request
    const { jobId } = await req.json();

    // Find JobResult by jobId
    const result = await JobResult.findById(jobId);
    // Simulate a delay of 5 seconds
    // await new Promise(resolve => setTimeout(resolve, 5000));
    // Respond with jobDate if JobResult found
    if (result) {
      const responseBody = JSON.stringify({ jobDate: result.jobDate });
      return new Response(responseBody, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Return 404 error if JobResult not found
      const responseBody = JSON.stringify({ error: 'JobResult not found for jobId' });
      return new Response(responseBody, {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    // Handle server errors and log details
    console.error('Error fetching jobDate:', error);
    const responseBody = JSON.stringify({ error: 'Internal Server Error' });
    return new Response(responseBody, {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
