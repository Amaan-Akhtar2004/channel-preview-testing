import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  List,
  ListItem,
  Grid,
  ListItemSecondaryAction,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import DeleteConfirmationDialog from './deleteConfirmationDialog'; // Adjust path as needed

export default function EditChannelSetupComponent({ channelNames, onSubmit }) {
  const [selectedChannel, setSelectedChannel] = useState('');
  const [channelData, setChannelData] = useState({
    channelName: '',
    divSelector: '',
    loginByPass: '',
    data: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (selectedChannel) {
        setLoading(true);
        setError('');
        try {
          const response = await fetch(`/api/socialmedia/fetch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ channelName: selectedChannel })
          });
          if (response.ok) {
            const data = await response.json();
            setChannelData({
              channelName: data.channelName,
              divSelector: data.divSelector,
              loginByPass: data.loginByPass || '',
              data: data.data || []
            });
          } else {
            setError('Failed to fetch channel data');
          }
        } catch (error) {
          setError('Error fetching channel data: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchChannelData();
  }, [selectedChannel]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleChangeChannel = (e) => {
    setSelectedChannel(e.target.value);
  };

  const handleLinkChange = (index, field, value) => {
    const newData = [...channelData.data];
    newData[index][field] = value;
    setChannelData({ ...channelData, data: newData });
  };

  const handleDeleteLink = async (index) => {
    const linkToDelete = channelData.data[index];

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/socialmedia/deleteLink`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelName: selectedChannel, url: linkToDelete.url })
      });

      if (response.ok) {
        const newData = [...channelData.data];
        newData.splice(index, 1);
        setChannelData({ ...channelData, data: newData });
        setMessage('Link deleted successfully');
      } else {
        setError('Failed to delete link');
      }
    } catch (error) {
      setError('Error deleting link: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteChannel = async () => {
    if (!selectedChannel) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/socialmedia/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelName: selectedChannel })
      });
      if (response.ok) {
        setMessage('Channel deleted successfully');
        setSelectedChannel('');
        setChannelData({
          channelName: '',
          divSelector: '',
          loginByPass: '',
          data: []
        });
      } else {
        setError('Failed to delete channel');
      }
    } catch (error) {
      setError('Error deleting channel: ' + error.message);
    } finally {
      setLoading(false);
      setOpenDialog(false); // Close dialog after deletion
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      channelName: channelData.channelName,
      divSelector: channelData.divSelector,
      loginByPass: channelData.loginByPass,
      data: channelData.data
    };

    try {
      const response = await fetch(`/api/socialmedia/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setMessage('Changes saved successfully');
        setSelectedChannel('');
        setChannelData({
          channelName: '',
          divSelector: '',
          loginByPass: '',
          data: []
        });
      } else {
        setError('Error updating channel data');
      }
    } catch (error) {
      setError('Error updating channel data: ' + error.message);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setMessage('');
    setError('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 'xl', mx: 'auto', p: 8, bgcolor: 'white', boxShadow: 3, borderRadius: 2 }}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="selectChannelLabel">Select Channel</InputLabel>
        <Select
          labelId="selectChannelLabel"
          id="selectChannel"
          value={selectedChannel}
          onChange={handleChangeChannel}
          label="Select Channel"
          required
        >
          <MenuItem value="">
            <em>Select a Channel</em>
          </MenuItem>
          {channelNames.map((channelName) => (
            <MenuItem key={channelName} value={channelName}>
              {channelName.charAt(0).toUpperCase() + channelName.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedChannel && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth margin="normal">
                <TextField
                  id="editDivSelector"
                  label="Div Selector"
                  value={channelData.divSelector}
                  onChange={(e) => setChannelData({ ...channelData, divSelector: e.target.value })}
                  required
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <Typography variant="h6">Login ByPass</Typography>
                <Box sx={{ border: 1, borderColor: 'grey.400', borderRadius: 1, mt: 1 }}>
                  <Editor
                    height="400px"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={channelData.loginByPass}
                    onChange={(value) => setChannelData({ ...channelData, loginByPass: value })}
                    options={{
                      minimap: { enabled: false },
                      scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: false,
                      lineNumbersMinChars: 3
                    }}
                  />
                </Box>
              </FormControl>
              {channelData.data.length > 0 && (
                <FormControl fullWidth margin="normal">
                  <Typography variant="h6">Links</Typography>
                  <List>
                    {channelData.data.map((link, index) => (
                      <ListItem key={index} sx={{ border: '1px solid #ccc', borderRadius: '5px', p: 1, mb: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={11}>
                            <TextField
                              fullWidth
                              label="Test Description"
                              value={link.scenario}
                              onChange={(e) => handleLinkChange(index, 'scenario', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={1} sx={{ textAlign: 'right' }}>
                            <IconButton aria-label="delete" onClick={() => handleDeleteLink(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="URL"
                              value={link.url}
                              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                        </Grid>
                      </ListItem>
                    ))}
                  </List>
                </FormControl>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleOpenDialog}
                  disabled={loading}
                >
                  Delete Channel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </Box>
            </>
          )}
        </>
      )}
      <DeleteConfirmationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onDelete={handleDeleteChannel}
        channelName={selectedChannel}
      />
      <Snackbar open={!!message} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {message}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
