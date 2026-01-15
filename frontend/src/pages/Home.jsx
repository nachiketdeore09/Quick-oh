//Home.jsx;
import React from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Categories from "../components/Categories.jsx";
import InfoSection from "../components/InfoSection.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero";
import HowItWorks from "../components/howItWorks.jsx";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* {Hero Section start}  */}
      <Hero />
      {/* <HowItWorks /> */}
      <Categories />
      <InfoSection />
    </>
  );
};

export default Home;
