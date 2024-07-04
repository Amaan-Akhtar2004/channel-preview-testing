"use client"

import ImageGallery from "./components/ImageGallery";
import { useEffect, useState } from "react";
import Loader from "./components/loader";
import Link from "next/link";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [imagePaths, setImagePaths] = useState({});

  useEffect(() => {
    fetchImagePaths();
  }, []);

  const fetchImagePaths = async () => {
    try {
      const response = await fetch("/api/getImagePaths", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log("Image Paths", data);
      setImagePaths(data);
    } catch (error) {
      console.error("Failed to fetch image paths:", error);
    }
  };

  const runTest = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/runTest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      // After test completes, fetch image paths again to update the gallery
      await fetchImagePaths();
    } catch (err) {
      console.log("Error running test:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get job dates and sort them in descending order
  const jobDates = Object.keys(imagePaths).sort((a, b) => new Date(b) - new Date(a));
  const mostRecentJobDate = jobDates.length ? jobDates[0] : '';

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 className="head-text">Channel Preview Testing</h1>

      {loading ? (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={runTest}
          disabled={loading}
          style={{ margin: '10px' }}
        >
          Run Test
        </Button>
      )}
      <Link href="./admin">
        <Button variant="contained" color="secondary" style={{ margin: '10px' }}>
          Go to Admin Page
        </Button>
      </Link>
      {jobDates.map(jobDate => (
        <Accordion key={jobDate}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${jobDate}-content`}
            id={`${jobDate}-header`}
          >
            <Typography variant="h6">{jobDate}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ImageGallery
              imagePaths={imagePaths[jobDate]}
              onFixedSuccess={fetchImagePaths}
              showFixedButton={jobDate === mostRecentJobDate}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
