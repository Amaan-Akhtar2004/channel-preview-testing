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
  const [option1, setOption1] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [inputScenario, setInputScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/socialmedia/addLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: inputUrl,
          channel: option1,
          scenario: inputScenario,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("response : ",data.message);
        setError(data.message || 'Failed to add URL. Please try again.');
        throw new Error(data.message || 'Failed to add URL');
      }

      setSuccess('URL added successfully');
      setInputUrl('');
      setInputScenario('');
      setOption1('');

      console.log('Response:', data);
    } catch (error) {
      console.error('Error adding URL:', error.message);
      setError(error.message || 'Failed to add URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError('');
    setSuccess('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 'xl', mx: 'auto', p: 8, bgcolor: 'white', boxShadow: 3, borderRadius: 2 }}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="selectChannelLabel">Select Channel</InputLabel>
        <Select
          labelId="selectChannelLabel"
          id="selectChannel"
          value={option1}
          onChange={(e) => setOption1(e.target.value)}
          label="Select Channel"
          required
          sx={{
            backgroundColor: 'white',
            color: '#000000',
          }}
        >
          <MenuItem value="">
            <em>Select a Channel</em>
          </MenuItem>
          {channels.map((channel) => (
            <MenuItem key={channel} value={channel}>
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <TextField
          id="inputUrl"
          label="Enter URL"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          required
        />
      </FormControl>

      <FormControl fullWidth margin="normal">
        <TextField
          id="inputScenario"
          label="Enter Test Description"
          value={inputScenario}
          onChange={(e) => setInputScenario(e.target.value)}
          required
        />
      </FormControl>

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

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddPermalink;
