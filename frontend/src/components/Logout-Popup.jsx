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

// import React from "react";
// import styles from "./Logout-Popup.module.css";

// const LogoutModal = ({ onConfirm, onCancel }) => {
//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modal}>
//         <h2>Confirm Logout</h2>
//         <p>Are you sure you want to logout?</p>
//         <div className={styles.buttons}>
//           <button onClick={onConfirm} className={styles.confirm}>
//             Yes
//           </button>
//           <button onClick={onCancel} className={styles.cancel}>
//             No
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LogoutModal;
