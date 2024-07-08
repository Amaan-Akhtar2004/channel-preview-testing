import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
/**
 * DeleteConfirmationDialog component displays a dialog box to confirm deletion of a channel.
 * 
 * Props:
 * - open: Boolean, controls whether the dialog is open or closed.
 * - onClose: Function, callback to handle dialog close event.
 * - onDelete: Function, callback to handle deletion action.
 * - channelName: String, name of the channel to be deleted.
 */
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
