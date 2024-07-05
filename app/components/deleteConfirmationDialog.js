import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const DeleteConfirmationDialog = ({ open, onClose, onDelete, channelName }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Confirm Delete Channel</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Are you sure you want to delete the channel "{channelName}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onDelete} color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
