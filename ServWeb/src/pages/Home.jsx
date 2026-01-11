import React, { useState } from "react";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import "./home.css";

export default function Home() {
  const [selectedService, setSelectedService] = useState("");
  const [modalData, setModalData] = useState(null);

  const services = [
    "Plumbing",
    "Electrical Repair",
    "House Cleaning",
    "Painting Service",
    "Appliance Repair",
    "Gardening & Landscaping",
    "Personal Training",
    "Home Tutoring",
    "Makeup & Beauty Service",
    "Photography Service",
    "Massage Therapy",
    "Event Planning",
  ];

  const images = [
    "/assets/services/service1.jpg",
    "/assets/services/service2.jpg",
    "/assets/services/service3.jpg",
    "/assets/services/service4.jpg",
  ];

  return (
    <div className="bg-dark text-white">
      <Navbar />

      {/* HERO */}
      <section className="container-fluid hero-section py-5">
        <div className="row align-items-center">
          <div className="col-lg-6 px-5">
            <h1 className="hero-title">
              Welcome to Our <br /> Service Booking Platform
            </h1>
            <p className="hero-description">
              Find trusted experts and book services easily.
            </p>

            <div className="d-flex gap-2 mt-4 flex-wrap">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search manually..."
                onChange={(e) => setSelectedService(e.target.value)}
              />

              <select
                className="form-select search-input"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">Select a service...</option>
                {services.map((s, i) => (
                  <option key={i}>{s}</option>
                ))}
              </select>

              <button className="btn search-btn">Search</button>
            </div>
          </div>

          <div className="col-lg-6 text-center mt-4 mt-lg-0">
            <img src="/assets/HomeA.png" className="img-fluid hero-img" alt="Hero" />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <div className="container my-5">
        <h2 className="text-center services-heading mb-4">
          Explore Our Services
        </h2>

        <div className="row g-4">
          {images.map((img, i) => (
            <div className="col-md-3" key={i}>
              <div
                className="card service-card-item h-100"
                data-bs-toggle="modal"
                data-bs-target="#serviceModal"
                onClick={() =>
                  setModalData({
                    title: `Service Category ${i + 1}`,
                    description: "High-quality trusted service providers.",
                    img,
                  })
                }
              >
                <img src={img} className="card-img-top service-img" alt="service" />
                <div className="card-body">
                  <h5 className="card-title">Service Category {i + 1}</h5>
                  <p className="card-text">
                    High-quality trusted service providers.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOOTSTRAP MODAL */}
      <div
        className="modal fade"
        id="serviceModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content bg-dark text-white rounded-4">
            <div className="modal-header border-0">
              <h5 className="modal-title">{modalData?.title}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body text-center">
              <p>{modalData?.description}</p>

              <video className="w-100 rounded-3 mt-3" controls>
                <source src="/assets/videos/sample.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* POPULAR */}
      <div className="container my-5 text-center">
        <h2 className="popular-heading mb-4">Our Popular Services</h2>

        <div className="popular-slider">
          <div className="slider-track">
            {[...Array(2)].flatMap(() =>
              [
                { name: "Plumbing Service", desc: "Fast and reliable repairs." },
                { name: "Electrical Service", desc: "Certified electricians." },
                { name: "House Cleaning", desc: "Professional cleaners." },
                { name: "Painting Service", desc: "Interior & exterior painting." },
                { name: "AC Repair", desc: "Expert cooling repair." },
              ]
            ).map((s, i) => (
              <div className="popular-card" key={i}>
                <p>{s.desc}</p>
                <h5 className="fw-bold">{s.name}</h5>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
