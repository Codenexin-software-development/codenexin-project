import React, { useState, useEffect } from "react";
import "./CorouselSection.css";
import logo from "../logo.jpg";

const slides = [
  {
    title: "Justice for Every Citizen",
    description:
      "We stand for equal rights, fair opportunities, and dignity for all.",
    image: logo,
  },
  {
    title: "Transparent Governance",
    description:
      "Open decision-making, accountable leadership, and people-first policies.",
    image: logo,
  },
  {
    title: "Inclusive & Progressive India",
    description:
      "Empowering youth, women, and marginalized communities.",
    image: logo,
  },
];

const CarouselSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="carousel-section">
      <div className="carousel-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${
              index === current ? "active" : ""
            }`}
          >
            <div className="carousel-content">
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              <button className="carousel-btn">
                Learn More <i className="fas fa-arrow-right"></i>
              </button>
            </div>

            <div className="carousel-image">
              <img src={slide.image} alt="Slide" />
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={index === current ? "dot active" : "dot"}
              onClick={() => setCurrent(index)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarouselSection;
