import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Snackbar,
  Alert,
  TextField,
  Box,
  Typography,
  Button,
} from '@mui/material';

const exampleCode = `// Example code:
const closeButton = document.querySelector('div[role=button][aria-label="Close"]');
if (closeButton) {
  closeButton.click();
}
`;

const SocialMediaFormComponent = ({ onSubmit }) => {
  const [channelName, setChannelName] = useState('');
  const [divSelector, setDivSelector] = useState('');
  const [loginByPass, setLoginByPass] = useState(exampleCode); // Set example code as initial value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEditorChange = (value, event) => {
    setLoginByPass(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = {
      channelName,
      divSelector,
      data: [],
      loginByPass,
    };

    try {
      const response = await onSubmit(formData);
      if (response.status === 'success') {
        setChannelName('');
        setDivSelector('');
        setLoginByPass(exampleCode); // Reset to example code after submission
        setSuccess(response.message);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Error submitting form: ' + error.message);
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
      <TextField
        id="channelName"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        label="Enter Channel Name"
        variant="outlined"
        fullWidth
        margin="normal"
        required
      />
      <TextField
        id="divSelector"
        value={divSelector}
        onChange={(e) => setDivSelector(e.target.value)}
        label="Enter Div Selector"
        variant="outlined"
        fullWidth
        margin="normal"
        required
      />
      <Typography variant="h6" mb={2}>
        Login ByPass
      </Typography>
      <Box sx={{ border: 1, borderColor: 'grey.400', borderRadius: 1 }}>
        <Editor
          height="400px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={loginByPass}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
            lineNumbers: 'on',
            glyphMargin: false,
            folding: false,
            lineNumbersMinChars: 3,
          }}
        />
      </Box>
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
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

export default SocialMediaFormComponent;
