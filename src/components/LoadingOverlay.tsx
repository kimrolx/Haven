import React from "react";
import styles from "./LoadingOverlay.module.css";

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  return (
    isLoading && (
      <div className={styles.overlay}>
        <div className={styles.spinner}></div>
      </div>
    )
  );
};

export default LoadingOverlay;
