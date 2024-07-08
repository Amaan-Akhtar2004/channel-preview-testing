import React, { useState, useEffect } from 'react';
import Loader from './loader'; // Import your Loader component
import {
  Snackbar,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const ImageGallery = ({ jobId, showFixedButton }) => {
  const labels = ["Reference", "New", "Difference"]; // Labels for image types
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedPlatform, setSelectedPlatform] = useState(''); // Selected platform state
  const [imagePaths, setImagePaths] = useState({}); // Image paths state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const [errorMessage, setErrorMessage] = useState(''); // Error message state

  // Fetch image paths when jobId changes
  useEffect(() => {
    if (jobId) {
      fetchImagePaths(jobId);
    }
  }, [jobId]);

  // Reset selectedPlatform when imagePaths update
  useEffect(() => {
    if (Object.keys(imagePaths).length > 0 && !selectedPlatform) {
      setSelectedPlatform('');
    }
  }, [imagePaths]);

  // Function to fetch image paths based on jobId
  const fetchImagePaths = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/getImagePaths?jobId=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedData = formatImageData(data); // Format fetched data
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

  // Function to format raw data into structured imagePaths
  const formatImageData = (data) => {
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
    return formattedData;
  };

  // Function to mark an image as fixed for a platform and folder
  const fixed = async (platform, folder, referenceUrl, jobId) => {
    setLoading(true);
    try {
      const response = await fetch("/api/fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: platform,
          referenceUrl,
          jobId
        })
      });
      if (response.ok) {
        setSuccessMessage('Image fixed successfully');
        fetchImagePaths(jobId); // Refresh image paths after fixing
      } else {
        setErrorMessage('Failed to fix image');
      }
    } catch (err) {
      console.log("Failed to fix image:", err);
      setErrorMessage('Failed to fix image');
    } finally {
      setLoading(false);
    }
  };

  // Handle platform selection change
  const handlePlatformChange = (event) => {
    setSelectedPlatform(event.target.value);
  };

  // Handle Snackbar close event
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <div className='m-4'>
      {loading ? ( // Show loader while loading
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        <>
          <FormControl fullWidth>
            <InputLabel id="selectPlatformLabel">Select Channel</InputLabel>
            <Select
              labelId="selectPlatformLabel"
              id="selectPlatform"
              value={selectedPlatform}
              onChange={handlePlatformChange}
              label="Select Channel"
              required
              sx={{
                backgroundColor: 'white',
                color: '#000000',
              }}
            >
              {/* Render platform options */}
              {Object.keys(imagePaths).map((platform) => (
                <MenuItem key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Render images and fixed button for selected platform */}
          {selectedPlatform && (
            <div>
              <br />
              {Object.keys(imagePaths[selectedPlatform]).map((folder, idx) => (
                <div key={idx} style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '10px' }}>
                    {folder}
                    {showFixedButton && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => fixed(selectedPlatform, folder, imagePaths[selectedPlatform][folder][0], jobId)}
                        disabled={loading}
                        style={{ marginLeft: '10px' }}
                      >
                        {loading ? 'Resolving...' : 'Resolve'}
                      </Button>
                    )}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "space-around", gap: '20px' }}>
                    {/* Render images */}
                    {imagePaths[selectedPlatform][folder].map((imagePath, imgIdx) => (
                      <div key={imgIdx} style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img
                          src={imagePath}
                          alt={`${selectedPlatform}/${folder}/${imgIdx}`}
                          style={{ width: '400px', height: 'auto' }}
                        />
                        <div style={{ marginTop: '5px' }}>{labels[imgIdx % labels.length]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Snackbar for success message */}
      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar for error message */}
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ImageGallery;
