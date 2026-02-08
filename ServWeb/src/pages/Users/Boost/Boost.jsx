import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaRocket, FaCrown, FaCheckCircle, FaChevronRight, FaArrowLeft, FaSearch } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { fetchAllServices } from "../../../api/AccountApi";
import "./Boost.css";

export default function Boost() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Data States
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  // 1. Fetch Services from API
  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await fetchAllServices();
      // Filter services belonging to the logged-in user's profile
      const userServices = res.data?.filter((s) => s.profileId === user?.profileId) || [];
      setServices(userServices);
    } catch (err) {
      console.error("Failed to load services", err);
      Swal.fire("Error", "Could not load your services.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.profileId) loadServices();
  }, [authLoading, user]);

  // Boosting Plans Configuration
  const boostPlans = [
    {
      type: "Standard",
      price: 500,
      color: "#6c757d",
      features: ["Highlighted Listing", "3 Days Duration", "Better Visibility"],
    },
    {
      type: "Premium",
      price: 1200,
      color: "#007bff",
      features: ["Priority in Search", "7 Days Duration", "High Visibility"],
      recommended: true
    },
    {
      type: "Elite",
      price: 2500,
      color: "#28a745",
      features: ["Top of Search Results", "15 Days Duration", "Maximum ROI"],
    }
  ];

  const handlePlanSelection = (plan) => {
    Swal.fire({
      title: `Confirm ${plan.type} Boost?`,
      text: `You will be redirected to pay Rs. ${plan.price} for "${selectedService.title}"`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Proceed to Payment",
      confirmButtonColor: plan.color,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/payments", { 
          state: { 
            serviceId: selectedService.id, 
            planType: plan.type, 
            amount: plan.price 
          } 
        });
      }
    });
  };

  // Filter logic for search
  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || authLoading) return <div className="text-center p-5"><div className="spinner-border text-danger" /></div>;

  return (
    <div className="boost-container p-4 animate-slide-down">
      
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="main-heading mb-1">
            {selectedService ? (
              <span className="clickable" onClick={() => setSelectedService(null)}>
                <FaArrowLeft className="mr-2 small" /> Select Plan
              </span>
            ) : (
              <><FaRocket className="text-danger mr-2" /> Boost Your Reach</>
            )}
          </h2>
          <p className="text-muted small">Choose a service and upgrade its visibility status.</p>
        </div>
      </div>

      {!selectedService ? (
        /* STEP 1: SERVICE SELECTION GRID */
        <div className="animate-slide-down">
          <div className="search-box-container mb-4 shadow-sm">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="form-control border-0" 
              placeholder="Search your services..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="row">
            {filteredServices.length > 0 ? filteredServices.map((service) => (
              <div className="col-md-6 col-lg-4 mb-3" key={service.id}>
                <div className="card service-pick-card h-100 border-0 shadow-sm" onClick={() => setSelectedService(service)}>
                  <div className="card-body d-flex align-items-center">
                    <div className="service-icon-box mr-3">
                        {service.imageUrl ? (
                             <img src={`https://localhost:7065${service.imageUrl}`} alt="" className="rounded shadow-sm" />
                        ) : <FaRocket className="text-muted" />}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="font-weight-bold mb-0 text-dark">{service.title}</h6>
                      <span className="badge badge-light text-muted small">{service.category || 'Service'}</span>
                    </div>
                    <FaChevronRight className="text-light-gray" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12 text-center py-5">
                <p className="text-muted">No services found. Add a service first!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STEP 2: TIERED PRICING PLANS */
        <div className="animate-slide-down">
          <div className="selected-banner mb-4 d-flex align-items-center justify-content-between">
            <span>Currently Boosting: <strong>{selectedService.title}</strong></span>
            <span className="badge badge-danger">ID: {selectedService.id.substring(0,8)}</span>
          </div>

          <div className="row justify-content-center">
            {boostPlans.map((plan) => (
              <div className="col-md-4 mb-4" key={plan.type}>
                <div className={`card boost-plan-card border-0 shadow-sm ${plan.recommended ? 'recommended' : ''}`}>
                  {plan.recommended && <div className="best-value-tag">Most Popular</div>}
                  <div className="card-body text-center p-4">
                    <h5 className="text-uppercase font-weight-bold text-muted">{plan.type}</h5>
                    <div className="price-tag my-4">
                      <span className="currency">Rs.</span>
                      <span className="amount">{plan.price}</span>
                    </div>
                    <ul className="list-unstyled text-left mb-4">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="mb-2 small">
                          <FaCheckCircle className="text-success mr-2" /> {feat}
                        </li>
                      ))}
                    </ul>
                    <button 
                      className="btn btn-block py-3 font-weight-bold" 
                      style={{ backgroundColor: plan.color, color: '#fff', borderRadius: '10px' }}
                      onClick={() => handlePlanSelection(plan)}
                    >
                      CHOOSE {plan.type.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}