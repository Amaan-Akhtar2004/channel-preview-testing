import JobResult from "@/app/lib/models/resultSchema.mjs"; // Import your Mongoose model

export async function DELETE(request) {
  // Extract jobId from request URL
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');
  console.log(jobId);

  try {
    // Delete job by ID
    const deletedJob = await JobResult.findByIdAndDelete(jobId);

    if (deletedJob) {
      return new Response(
        JSON.stringify({ success: true, message: `Job ${jobId} deleted successfully` }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: `Job ${jobId} not found` }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Failed to delete job:', error);
    return new Response(
      JSON.stringify({ success: false, message: `Failed to delete job ${jobId}`, error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
