"use client";
import { useEffect, useState } from "react";
import Loader from "./components/loader";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchJobData();
  }, []);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/getPaths", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch job data");
      }
      const data = await response.json();
      // Sort job data by date in descending order (most recent first)
      const sortedData = data.sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate));
      console.log("Sorted Job Data", sortedData);
      setJobData(sortedData);
    } catch (error) {
      console.error("Error fetching job data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runTest = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/runTest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to run test");
      }
      // Refresh job data after test completion
      await fetchJobData();
    } catch (error) {
      console.error("Error running test:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/deleteJob?jobId=${jobId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      // Refresh job data after deletion
      await fetchJobData();
      setSuccessMessage("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      setErrorMessage("Failed to delete job");
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="head-text">Channel Preview Testing</h1>

      {loading ? (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={runTest}
          disabled={loading}
          style={{ margin: "10px" }}
        >
          Run Test
        </Button>
      )}
      <Link href="/admin">
        <Button variant="contained" color="secondary" style={{ margin: "10px" }}>
          Go to Admin Page
        </Button>
      </Link>
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
            <Link href={`/job/${jobId}`}>
              <Button variant="contained" color="primary" style={{ marginRight: "10px" }}>
                View Details
              </Button>
            </Link>
            <IconButton
              aria-label="delete"
              onClick={() => deleteJob(jobId)}
              disabled={loading}
            >
              <DeleteIcon />
            </IconButton>
          </AccordionDetails>
        </Accordion>
      ))}
      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
