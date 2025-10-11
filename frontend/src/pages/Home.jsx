// Home.jsx
import React from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className={styles.heading}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Delivering Everything to Your Doorstep
        </motion.h1>

        <motion.p
          className={styles.subheading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Quick-oh brings groceries, food, and daily essentials to your home
          with lightning-fast delivery. Trusted by thousands every day.
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

export default Home;
