"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import Loader from "./components/loader";

export default function Home() {
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [jobData, setJobData] = useState([]); // State to store fetched job data
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const [errorMessage, setErrorMessage] = useState(""); // Error message state

  useEffect(() => {
    // Fetch job data on component mount
    fetchJobData();
  }, []);

  // Function to fetch job data from API
  const fetchJobData = async () => {
    try {
      setLoading(true); // Set loading state to true
      const response = await fetch("/api/getPaths"); // Fetch job data from API endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch job data");
      }
      const data = await response.json(); // Parse response JSON
      // Sort job data by date in descending order (most recent first)
      const sortedData = data.sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate));
      setJobData(sortedData); // Update jobData state with sorted data
    } catch (error) {
      console.error("Error fetching job data:", error); // Log error if fetch fails
      setErrorMessage("Failed to fetch job data"); // Set error message state
    } finally {
      setLoading(false); // Set loading state to false after fetch completes
    }
  };

  // Function to delete a job by jobId
  const deleteJob = async (jobId) => {
    try {
      setLoading(true); // Set loading state to true
      const response = await fetch(`/api/deleteJob?jobId=${jobId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      // Refresh job data after deletion
      await fetchJobData();
      setSuccessMessage("Job deleted successfully"); // Set success message state
    } catch (error) {
      console.error("Error deleting job:", error); // Log error if delete fails
      setErrorMessage("Failed to delete job"); // Set error message state
    } finally {
      setLoading(false); // Set loading state to false after delete completes
    }
  };

  // Function to handle closing of Snackbar
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessMessage(""); // Clear success message state
    setErrorMessage(""); // Clear error message state
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="head-text">Channel Preview Testing</h1>

      {/* Show loader if loading state is true */}
      {loading && <Loader size={50} color="primary" />}

      {/* Button to navigate to admin page */}
      <Link href="/admin" passHref>
        <Button variant="contained" color="secondary" style={{ margin: "10px" }}>
          Go to Admin Page
        </Button>
      </Link>

      {/* Display job data in accordions */}
      {jobData.map(({ jobId, jobDate }) => (
        <Accordion key={jobId}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${jobDate}-content`}
            id={`${jobDate}-header`}
          >
            <Typography variant="h6">{jobDate}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Button to view job details */}
            <Link href={`/job/${jobId}`} passHref>
              <Button variant="contained" color="primary" style={{ marginRight: "10px" }}>
                View Details
              </Button>
            </Link>
            {/* Button to delete job */}
            <IconButton
              aria-label="delete"
              onClick={() => deleteJob(jobId)}
              disabled={loading} // Disable delete button when loading
            >
              <DeleteIcon />
            </IconButton>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Snackbar for displaying success messages */}
      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar for displaying error messages */}
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
