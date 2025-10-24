// src/Components/Home.js
import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Container, Button } from "react-bootstrap";
import { withNavigation } from "../utils/withNavigation"; // ✅ add navigation helper

// Import images
import knifeImg from "../Images/knife.jpg";
import notesCoverImg from "../Images/notesCover.jpg";
import bgImg from "../Images/bgimg.jpeg";
import policeBadge from "../Images/policeBadge.png";

class Home extends Component {
  // ✅ Use navigate injected via withNavigation()
  goToLogin = () => {
    this.props.navigate("/login");
  };

  render() {
    return (
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
          height: "100vh",
        }}
      >
        <style>{`
          body {
            overflow: hidden;
          }

          /* Background gradient animation */
          .animated-bg {
            background: linear-gradient(-45deg, #eef2f3, #dfe9f3, #e3f2fd, #f1f8e9);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            height: 100vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* Glass box with glowing border */
          .glass-box {
            background: rgba(255, 255, 255, 0.35);
            backdrop-filter: blur(16px) saturate(180%);
            border-radius: 25px;
            padding: 3rem;
            width: 650px;
            margin: auto;
            border: 2px solid rgba(255, 215, 0, 0.6);
            animation: glowBorder 3s infinite alternate;
          }
          @keyframes glowBorder {
            from { box-shadow: 0 0 12px rgba(255, 215, 0, 0.4); }
            to { box-shadow: 0 0 26px rgba(255, 215, 0, 0.9); }
          }

          /* Title typing animation */
          .typing {
            overflow: hidden;
            white-space: nowrap;
            border-right: 3px solid #004d00;
            width: 0;
            animation: typing 4s steps(30, end) forwards, blink 0.8s infinite;
            font-size: 2rem;
            font-weight: bold;
            color: #004d00;
          }
          @keyframes typing {
            from { width: 0 }
            to { width: 100% }
          }
          @keyframes blink {
            from, to { border-color: transparent }
            50% { border-color: #004d00 }
          }

          /* Bullet points staggered */
          .animated-list li {
            opacity: 0;
            transform: translateX(-20px);
            animation: fadeInList 1s forwards;
          }
          .animated-list li:nth-child(1) { animation-delay: 4.2s; }
          .animated-list li:nth-child(2) { animation-delay: 5.4s; }
          .animated-list li:nth-child(3) { animation-delay: 6.6s; }

          @keyframes fadeInList {
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* Badge beside card */
          .badge-side {
            width: 260px;
            margin-left: 6rem;
            opacity: 1;
            filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.7));
            animation: pulseBadge 4s infinite ease-in-out;
          }
          @keyframes pulseBadge {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(255,215,0,0.6)); }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(255,215,0,1)); }
          }

          /* Evidence cards with captions */
          .hero-cards {
            margin-top: 2rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
            position: relative;
            height: 200px;
          }
          .hero-card {
            position: absolute;
            width: 420px;
            height: 240px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 20px rgba(0,0,0,0.25);
            opacity: 0;
            animation: fadeSlide 9s infinite;
          }
          .hero-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .caption {
            position: absolute;
            bottom: 0;
            width: 100%;
            background: rgba(255,215,0,0.85);
            color: #000;
            font-weight: 600;
            font-size: 0.85rem;
            text-align: center;
            padding: 0.3rem;
          }
          .hero-card:nth-child(1) { animation-delay: 0s; }
          .hero-card:nth-child(2) { animation-delay: 3s; }
          .hero-card:nth-child(3) { animation-delay: 6s; }

          @keyframes fadeSlide {
            0%   { opacity: 0; transform: scale(0.9); }
            10%  { opacity: 1; transform: scale(1); }
            30%  { opacity: 1; }
            40%  { opacity: 0; transform: scale(0.9); }
            100% { opacity: 0; }
          }

          /* Button glow */
          .btn-glow:hover {
            box-shadow: 0 0 12px rgba(255, 215, 0, 0.8);
            transform: translateY(-2px);
            transition: all 0.3s ease;
          }

          /* Responsive layout */
          @media (max-width: 768px) {
            .hero-layout {
              flex-direction: column;
            }
            .badge-side {
              margin: 1rem 0 0 0;
              width: 160px;
            }
          }

          /* Sticky CTA */
          .sticky-cta {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 2000;
          }
        `}</style>

        {/* Navbar - glassmorphism */}
        <Navbar
          expand="lg"
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            margin: "8px 20px",
            padding: "0.8rem 1rem",
          }}
          sticky="top"
        >
          <Container>
            <Navbar.Brand
              href="/"
              style={{
                color: "#FFD700",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              ZRP Thadam
            </Navbar.Brand>
            <Button
              size="sm"
              variant="outline-light"
              className="ms-auto"
              onClick={this.goToLogin}
            >
              Login
            </Button>
          </Container>
        </Navbar>

        {/* Hero Section */}
        <div className="animated-bg">
          <div className="hero-layout d-flex align-items-center justify-content-center text-center">
            {/* Glass Box */}
            <div className="glass-box position-relative" style={{ zIndex: 2 }}>
              <h1 className="typing">Blockchain Crime Records Hub</h1>
              <p className="mb-4" style={{ color: "#333", fontSize: "1.2rem" }}>
                Zimbabwe Republic Police
              </p>
              <ul
                className="animated-list text-start mx-auto mb-4"
                style={{ maxWidth: "400px", listStyle: "none" }}
              >
                <li>✅ Tamper-proof evidence storage</li>
                <li>✅ Transparent case tracking</li>
                <li>✅ Multi-department collaboration</li>
              </ul>
              <Button
                size="lg"
                variant="warning"
                className="mx-2 fw-bold btn-glow"
              >
                + Report Crime
              </Button>
              <Button
                size="lg"
                variant="outline-dark"
                className="mx-2 btn-glow"
                onClick={this.goToLogin}
              >
                Officer Login
              </Button>

              {/* Evidence Image Slider */}
              <div className="hero-cards" style={{ zIndex: 1 }}>
                <div className="hero-card">
                  <img src={knifeImg} alt="Evidence Knife" />
                  <div className="caption">Murder Weapon</div>
                </div>
                <div className="hero-card">
                  <img src={notesCoverImg} alt="Evidence Notes" />
                  <div className="caption">Case Notes</div>
                </div>
                <div className="hero-card">
                  <img src={bgImg} alt="Crime Scene" />
                  <div className="caption">Crime Scene</div>
                </div>
              </div>
            </div>

            {/* Badge beside card */}
            <img src={policeBadge} alt="Police Badge" className="badge-side" />
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="sticky-cta">
          <Button variant="warning" size="lg" className="fw-bold btn-glow">
            + Report Crime
          </Button>
        </div>
      </div>
    );
  }
}

export default withNavigation(Home);
