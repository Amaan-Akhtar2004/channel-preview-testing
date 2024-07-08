import React, { useState } from 'react';
import {
  Snackbar,
  Alert,
  TextField,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const AddPermalink = ({ channels }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(''); // State for selected channel/platform
  const [inputUrl, setInputUrl] = useState(''); // State for input URL
  const [inputScenario, setInputScenario] = useState(''); // State for input scenario/test description
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [error, setError] = useState(''); // Error state for form submission
  const [success, setSuccess] = useState(''); // Success state for form submission

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(''); // Clear previous error messages
    setSuccess(''); // Clear previous success messages
    setLoading(true); // Set loading state to true during form submission

    try {
      // Send POST request to API endpoint
      const response = await fetch('/api/socialmedia/addLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: inputUrl,
          channel: selectedPlatform,
          scenario: inputScenario,
        }),
      });

      const data = await response.json(); // Parse response JSON

      if (!response.ok) {
        // Handle unsuccessful response
        setError(data.message || 'Failed to add URL. Please try again.');
        throw new Error(data.message || 'Failed to add URL');
      }

      // Handle successful response
      setSuccess('URL added successfully'); // Set success message
      setInputUrl(''); // Clear input URL field
      setInputScenario(''); // Clear input scenario field
      setSelectedPlatform(''); // Clear selected platform/channel

      console.log('Response:', data); // Log successful response data
    } catch (error) {
      // Handle fetch errors
      console.error('Error adding URL:', error.message);
      setError(error.message || 'Failed to add URL. Please try again.');
    } finally {
      setLoading(false); // Set loading state to false after submission completes
    }
  };

  // Handle closing of Snackbar
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(''); // Clear error message
    setSuccess(''); // Clear success message
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 'xl',
        mx: 'auto',
        p: 8,
        bgcolor: 'white',
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      {/* Select channel/platform */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="selectChannelLabel">Select Channel</InputLabel>
        <Select
          labelId="selectChannelLabel"
          id="selectChannel"
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          label="Select Channel"
          required
          sx={{
            backgroundColor: 'white',
            color: '#000000',
          }}
        >
          {channels.map((channel) => (
            <MenuItem key={channel} value={channel}>
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Input URL */}
      <FormControl fullWidth margin="normal">
        <TextField
          id="inputUrl"
          label="Enter URL"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          required
        />
      </FormControl>

      {/* Input scenario/test description */}
      <FormControl fullWidth margin="normal">
        <TextField
          id="inputScenario"
          label="Enter Test Description"
          value={inputScenario}
          onChange={(e) => setInputScenario(e.target.value)}
          required
        />
      </FormControl>

      {/* Submit button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </Box>

      {/* Snackbar for displaying error messages */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {error}
        </Alert>
      </Snackbar>

      {/* Snackbar for displaying success messages */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddPermalink;
