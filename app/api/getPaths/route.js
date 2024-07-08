// Import mongoose and your model
import connectToDatabase from '@/app/lib/mongodb.mjs';
import JobResult from '@/app/lib/models/resultSchema.mjs';

// Define the revalidate value(to remove the route from ISR in vercels)
export const revalidate = 0;

// Define the GET handler
export async function GET() {
  try {
    // Connect to the MongoDB database
    await connectToDatabase();

    // Query the JobResult collection to fetch jobId and jobDate fields
    const results = await JobResult.find({});

    // Format the results as required
    const formattedResults = results.map(result => ({
      jobId: result._id,
      jobDate: result.jobDate.toLocaleString('en-GB', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
    }));

    // Return the formatted results as JSON response
    return new Response(JSON.stringify(formattedResults), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Handle any errors and return an appropriate response
    console.error('Failed to fetch job results:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
