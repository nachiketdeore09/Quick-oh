//Home.jsx;
import React from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Categories from "../components/Categories.jsx";
import InfoSection from "../components/InfoSection.jsx";
import Footer from "../components/Footer.jsx";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* {Hero Section start}  */}
      <div className={styles.homeContainer}>
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
      <Categories />
      <InfoSection />
      <Footer />
    </>
  );
};

export default Home;
