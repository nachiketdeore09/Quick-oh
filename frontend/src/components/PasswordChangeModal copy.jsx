import styles from "./PasswordChangeModal.module.css";

function PasswordChangeModal({
  oldPassword,
  newPassword,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Change Password</h3>
        <input
          type="password"
          name="oldPassword"
          placeholder="Old Password"
          value={oldPassword}
          onChange={onChange}
          className={styles.modalInput}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={newPassword}
          onChange={onChange}
          className={styles.modalInput}
        />
        <div className={styles.modalActions}>
          <button onClick={onSubmit} className={styles.saveBtn}>
            Submit
          </button>
          <button onClick={onCancel} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PasswordChangeModal;
