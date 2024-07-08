import JobResult from '@/app/lib/models/resultSchema.mjs'; // Adjust the path to your JobResult model
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.mjs'; // Adjust the path to your ScreenshotReference model

export const POST = async (req) => {
    const { jobId } = await req.json(); // Retrieve jobId from query parameters
    try {
        // Fetch specific JobResult based on jobId
        const jobResult = await JobResult.findById(jobId);

        if (!jobResult) {
            return new Response(JSON.stringify({ error: 'JobResult not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        // Initialize counters
        let totalTests = 0;
        let failedTests = 0;

        // Count total tests from ScreenshotReference collection
        totalTests = await ScreenshotReference.countDocuments({});
        // Calculate success tests based on images in the schema
        jobResult.platforms.forEach(platform => {
            platform.images.forEach(image => {
                // Your success criteria logic here, e.g., checking if the image is valid
                if (image.testUrl && image.diffUrl) {
                    failedTests++;
                }
            });
        });

        const responseBody = JSON.stringify({ 
            totalTests,
            failedTests
        });
        console.log(responseBody);
        return new Response(responseBody, { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error fetching test counts:', error);
        const responseBody = JSON.stringify({ error: 'Internal Server Error' });
        return new Response(responseBody, { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
