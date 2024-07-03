import React, { useState, useEffect } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';

const ImageGallery = ({ imagePaths, onFixedSuccess }) => {
  const labels = ["old", "new", "difference"];
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [selectedPlatform, setSelectedPlatform] = useState('');

  useEffect(() => {
    console.log('Image paths updated:', imagePaths);
    // Set default selected platform if imagePaths has platforms
    if (Object.keys(imagePaths).length > 0) {
      setSelectedPlatform(Object.keys(imagePaths)[0]);
    }
  }, [imagePaths]);

  const fixed = async (platform, folder, referenceUrl, onFixedSuccess) => {
    setLoading(true); // Set loading to true when fixing starts

    try {
      const response = await fetch("/api/fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: platform,
          referenceUrl,
        })
      });
      console.log(response);

      // Call the callback to refresh image paths
      if (response.ok) {
        onFixedSuccess();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false); // Set loading to false when fixing ends (success or error)
    }
  }

  const handlePlatformChange = (event) => {
    setSelectedPlatform(event.target.value);
  };

  return (
    <div className='m-4'>
      <FormControl fullWidth>
        <Select
          value={selectedPlatform}
          onChange={handlePlatformChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Select platform' }}
        >
          {Object.keys(imagePaths).map((platform, index) => (
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => fixed(selectedPlatform, folder, imagePaths[selectedPlatform][folder][0], onFixedSuccess)}
                  disabled={loading} // Disable button when loading
                  style={{ marginLeft: '10px' }}
                >
                  {loading ? 'Fixing...' : 'Fixed'}
                </Button>
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
    </div>
  );
};

export default ImageGallery;
