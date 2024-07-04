import JobResult from "@/app/lib/models/resultSchema.mjs";

export async function GET(req, res) {
  try {
    const mostRecentJob = await JobResult.findOne({}, {}, { sort: { 'jobDate' : -1 } }); // Find the most recent job by jobDate descending
    // console.log(mostRecentJob);
    if (mostRecentJob) {
      // Respond with the most recent job ID
      return new Response(JSON.stringify({ jobId: mostRecentJob._id.toString() }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Handle case where no job is found
      return new Response(JSON.stringify({ error: 'No job found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    // Handle server error
    return new Response(JSON.stringify({ error: 'Failed to fetch most recent job ID', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
