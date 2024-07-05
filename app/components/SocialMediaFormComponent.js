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
    const response = await onSubmit(formData);
    console.log(response.status);
    if (response.status === 'success') {
      setChannelName('');
      setDivSelector('');
      setLoginByPass(exampleCode); // Reset to example code after submission
      setSuccess(response.message);
    } else {
      setError(response.message);
    }
    setLoading(false);
    };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError('');
    setSuccess('');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg">
      <div className="mb-6">
        <label htmlFor="channelName" className="block text-lg font-semibold text-gray-900 mb-2">
          Channel Name
        </label>
        <TextField
          id="channelName"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="Enter Channel Name"
          variant="outlined"
          fullWidth
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="divSelector" className="block text-lg font-semibold text-gray-900 mb-2">
          Div Selector
        </label>
        <TextField
          id="divSelector"
          value={divSelector}
          onChange={(e) => setDivSelector(e.target.value)}
          placeholder="Enter Div Selector"
          variant="outlined"
          fullWidth
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="loginByPass" className="block text-lg font-semibold text-gray-900 mb-2">
          Login ByPass
        </label>
        <Box className="border border-gray-300 rounded-md">
          <Editor
            height="400px" // Initial height
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
      </div>
      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          style={{ margin: '10px' }}
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
    </form>
  );
};

export default SocialMediaFormComponent;
