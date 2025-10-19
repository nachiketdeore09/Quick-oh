import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Slide,
} from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const LogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <Dialog
      open={true}
      onClose={onCancel}
      TransitionComponent={Transition}
      keepMounted
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      sx={{
        backgroundColor: "linear-gradient(135deg, #f9fafb, #d2ecef)",
      }}
    >
      <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>

      <DialogContent dividers>
        <Typography id="logout-dialog-description">
          Are you sure you want to logout?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onConfirm} variant="contained" color="error">
          Yes
        </Button>
        <Button onClick={onCancel} variant="outlined" autoFocus>
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutModal;
