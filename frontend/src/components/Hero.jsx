import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styles from "./Hero.module.css";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.heroContainer}>
      {/* Left: Video Section */}
      <motion.div
        className={styles.videoSection}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <video
          className={styles.backgroundVideo}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>

      {/* Right: Content Section */}
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <motion.h1 className={styles.heading}>
          Groceries delivered in{" "}
          <span className={styles.highlight}>10 minutes</span>
        </motion.h1>

        <motion.p className={styles.subheading}>
          Fresh groceries, daily essentials, and more delivered to your
          doorstep. Experience ultra-fast delivery trusted by thousands every
          day.
        </motion.p>

        <motion.div
          className={styles.buttons}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/register")}
            className={styles.primaryBtn}
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/shop")}
            className={styles.secondaryBtn}
          >
            Explore Shop
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
