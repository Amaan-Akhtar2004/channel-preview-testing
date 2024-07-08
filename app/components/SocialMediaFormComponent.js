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

// Example code for initial value of loginByPass
const exampleCode = `// Example code:
const closeButton = document.querySelector('div[role=button][aria-label="Close"]');
if (closeButton) {
  closeButton.click();
}
`;

const SocialMediaFormComponent = ({ onSubmit }) => {
  const [channelName, setChannelName] = useState('');
  const [divSelector, setDivSelector] = useState('');
  const [loginByPass, setLoginByPass] = useState(exampleCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handler for changes in the Monaco Editor content
  const handleEditorChange = (value, event) => {
    setLoginByPass(value);
  };

  // Form submission handler
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
      // Call onSubmit function passed as prop
      const response = await onSubmit(formData);
      if (response.status === 'success') {
        // Clear form fields and reset loginByPass on success
        clearForm();
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

  // Function to clear form fields and reset loginByPass to example code
  const clearForm = () => {
    setChannelName('');
    setDivSelector('');
    setLoginByPass(exampleCode);
  };

  // Snackbar close handler
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
      {/* Channel Name TextField */}
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
      {/* Div Selector TextField */}
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
      {/* Login ByPass Editor */}
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
      {/* Submit Button */}
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
      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SocialMediaFormComponent;
