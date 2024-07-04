"use client";
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
  const [imagePaths, setImagePaths] = useState({});
  const [mostRecentJobId, setMostRecentJobId] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchImagePaths(jobId);
    }
  }, [jobId]);

  useEffect(() => {
    fetchMostRecentJobId();
  }, []);

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

  const fetchImagePaths = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/getImagePaths?jobId=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedData = {};
        Object.keys(data).forEach((dateKey) => {
          Object.keys(data[dateKey]).forEach((platform) => {
            if (!formattedData[platform]) {
              formattedData[platform] = {};
            }
            Object.keys(data[dateKey][platform]).forEach((folder) => {
              if (!formattedData[platform][folder]) {
                formattedData[platform][folder] = [];
              }
              formattedData[platform][folder] = data[dateKey][platform][folder];
            });
          });
        });
        setImagePaths(formattedData);
      } else {
        console.error("Failed to fetch image paths:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch image paths:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFixedSuccess = () => {
    if (jobId) {
      fetchImagePaths(jobId);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="head-text">Job Gallery for {jobId}</h1>
      {loading ? (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        <ImageGallery
          imagePaths={imagePaths}
          showFixedButton={mostRecentJobId === jobId}
          onFixedSuccess={handleFixedSuccess}
          jobId = {jobId}
        />
      )}
      {mostRecentJobId === jobId && (
        <Link href="/">
          <Button variant="contained" color="primary" style={{ margin: "10px" }}>
            Back to Home
          </Button>
        </Link>
      )}
    </div>
  );
}
