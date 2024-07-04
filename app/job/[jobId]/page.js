"use client"
import ImageGallery from "@/app/components/ImageGallery";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/app/components/loader";
import Link from "next/link";
import { Button } from "@mui/material";

export default function JobGallery() {
  const pathname = usePathname();
  const jobId = pathname.split("/").pop();
  const [loading, setLoading] = useState(false);
  const [mostRecentJobId, setMostRecentJobId] = useState(null);
  const [jobDate, setJobDate] = useState(null);

  useEffect(() => {
    fetchMostRecentJobId();
  }, []);

  useEffect(() => {
    if (jobId) {
      fetchJobDate(jobId);
    }
  }, [jobId]);

  const fetchMostRecentJobId = async () => {
    try {
      const response = await fetch("/api/getMostRecentJobId", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setMostRecentJobId(data.jobId);
      } else {
        console.error("Failed to fetch most recent job ID:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch most recent job ID:", error);
    }
  };

  const fetchJobDate = async (jobId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/getJobDate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
        })
      });

      if (response.ok) {
        const data = await response.json();
        setJobDate(formatDate(data.jobDate));
      } else {
        console.error("Failed to fetch job date:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch job date:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const istOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const istDateFormatted = date.toLocaleString('en-IN', istOptions);
    return istDateFormatted;
  };

  return (
    <div style={{ textAlign: "center", margin: "20px", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
      <h1 className="head-text" style={{ color: "#333", marginBottom: "20px" }}>Image Gallery For Job Dated {jobDate}</h1>
      {loading ? (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        <ImageGallery
          showFixedButton={mostRecentJobId === jobId}
          jobId={jobId}
        />
      )}
      <Link href="/">
        <Button variant="contained" color="primary" style={{ margin: "10px" }}>
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
