import React, { useState, useEffect } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Loader from './loader'; // Import your Loader component

const ImageGallery = ({ jobId, showFixedButton }) => {
  const labels = ["old", "new", "difference"];
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [imagePaths, setImagePaths] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchImagePaths(jobId);
    }
  }, [jobId]);

  useEffect(() => {
    if (Object.keys(imagePaths).length > 0 && !selectedPlatform) {
      setSelectedPlatform(Object.keys(imagePaths)[0]);
    }
  }, [imagePaths]);

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
        fetchImagePaths(jobId);
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

  const handlePlatformChange = (event) => {
    setSelectedPlatform(event.target.value);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <div className='m-4'>
      {loading ? (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        <>
          <FormControl fullWidth>
            <Select
              value={selectedPlatform}
              onChange={handlePlatformChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Select platform' }}
            >
              {Object.keys(imagePaths).map((platform) => (
                <MenuItem key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
};

export default ImageGallery;
