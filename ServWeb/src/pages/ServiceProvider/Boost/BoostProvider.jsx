import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAllServices,
  fetchProfileById,
  fetchServiceById,
  applyBoost,
  fetchBoostStatus,
  getWallet
} from "../../../api/AccountApi";
import "./BoostProvider.css";

export default function BoostProvider() {
  const { user, authLoading } = useAuth();
  const hasLoaded = useRef(false);

  const [wallet, setWallet] = useState({ pointsBalance: 0, lifetimePurchasedPoints: 0 });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const BASE_URL = "https://localhost:7065"; // Centralized API URL

  const boostPlans = [
    { type: "Standard", price: 200, duration: "3 Days" },
    { type: "Premium", price: 500, duration: "7 Days" },
    { type: "Elite", price: 1000, duration: "15 Days" }
  ];

  // Update current time every minute to refresh countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && user?.profileId && !hasLoaded.current) {
      hasLoaded.current = true;
      loadData();
    }
  }, [authLoading, user]);

  // Auto remove expired boost every minute locally
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => {
        const updated = prev.map(service => {
          if (
            service.expiryDate &&
            new Date(service.expiryDate) <= new Date()
          ) {
            return { ...service, isBoosted: false };
          }
          return service;
        });
        return sortServices(updated);
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const sortServices = (list) => {
    return [...list].sort((a, b) => {
      if (a.isBoosted && b.isBoosted) {
        return new Date(b.expiryDate) - new Date(a.expiryDate);
      }
      if (a.isBoosted) return -1;
      if (b.isBoosted) return 1;
      return 0;
    });
  };

  const getRemainingTime = (expiryDate) => {
    if (!expiryDate) return "";
    const diff = new Date(expiryDate) - currentTime;
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      let walletRes;
      try {
        walletRes = await getWallet(user.profileId);
      } catch (err) {
        console.warn("Wallet fetch error:", err);
      }
      
      const serviceRes = await fetchAllServices();

      const myServices = serviceRes.data?.filter(s => s.profileId === user.profileId) || [];

      const servicesWithBoost = await Promise.all(
        myServices.map(async (service) => {
          try {
            const res = await fetchBoostStatus(service.id);
            const expiryDate = res.data?.boostEndDate ? new Date(res.data.boostEndDate) : null;
            const isCurrentlyActive = expiryDate && expiryDate > new Date();

            return {
              ...service,
              isBoosted: isCurrentlyActive,
              expiryDate
            };
          } catch {
            return { ...service, isBoosted: false };
          }
        })
      );

      setServices(sortServices(servicesWithBoost));
      if (walletRes && walletRes.data) {
        setWallet(walletRes.data);
      }
    } catch (err) {
      console.error("Load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBoostClick = async (service) => {
    const { value: planIndex } = await Swal.fire({
      title: "Boost Your Service",
      text: "Select a promotion plan to increase your visibility",
      icon: "info",
      input: "select",
      inputOptions: boostPlans.reduce((acc, plan, index) => {
        acc[index] = `${plan.type} (${plan.price} Pts - ${plan.duration})`;
        return acc;
      }, {}),
      inputPlaceholder: "Choose a plan",
      showCancelButton: true,
      confirmButtonColor: "#dc3545"
    });

    if (planIndex !== null && planIndex !== undefined && planIndex !== "") {
      const selectedPlan = boostPlans[planIndex];
      const daysToBoost = parseInt(selectedPlan.duration.split(" ")[0]);

      if (wallet.pointsBalance < selectedPlan.price) {
        return Swal.fire("Insufficient Points", `You need ${selectedPlan.price} pts.`, "error");
      }

      try {
        await applyBoost({
          serviceId: service.id,
          pointsToSpend: selectedPlan.price,
          days: daysToBoost
        });

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysToBoost);

        setServices(prev => {
          const updated = prev.map(s =>
            s.id === service.id ? { ...s, isBoosted: true, expiryDate } : s
          );
          return sortServices(updated);
        });

        setWallet(prev => ({
          ...prev,
          pointsBalance: prev.pointsBalance - selectedPlan.price
        }));

        Swal.fire({ icon: "success", title: "Boost Activated!", timer: 2000, showConfirmButton: false });
      } catch {
        Swal.fire("Error", "Could not apply boost.", "error");
      }
    }
  };

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const currentItems = services.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );

  return (
    <div className="container py-5">
      <div className="card shadow-sm p-4 border-0" style={{ backgroundColor: "#ffffff", borderRadius: "20px" }}>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h3 className="fw-bold mb-1">My Services</h3>
            <p className="text-muted small mb-0">Manage and promote your active listings</p>
          </div>
          <div className="d-flex gap-3">
            <div className="points-status-card">
              <span className="points-label" style={{ color: '#6c757d' }}>Lifetime Purchased</span>
              <span className="points-value" style={{ color: '#000' }}>{Math.floor(wallet.lifetimePurchasedPoints || 0)}</span>
            </div>
            <div className="points-status-card">
              <span className="points-label" style={{ color: '#6c757d' }}>Total Available Points</span>
              <span className="points-value" style={{ color: '#000' }}>{Math.floor(wallet.pointsBalance || 0)}</span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {currentItems.map(service => (
            <div key={service.id} className="col-md-6 col-lg-4">
              <div className={`service-card h-100 ${service.isBoosted ? "boosted-border" : ""}`}>
                {service.isBoosted && (
                  <div className="boost-badge">
                    <span className="pulse-dot"></span> Active Boost
                  </div>
                )}

                <div className="media-container">
                  {/* Fixed the variable name error: changed 's.videoUrl' to 'service.videoUrl' */}
                  {service.videoUrl ? (
                    <video
                      src={`${BASE_URL}${service.videoUrl}`}
                      className="card-video-top"
                      muted
                      onMouseOver={e => e.target.play()}
                      onMouseOut={e => e.target.pause()}
                    />
                  ) : (
                    <img
                      src={`${BASE_URL}${service.imageUrl}`}
                      className="card-img-top"
                      alt={service.title}
                    />
                  )}
                </div>

                <div className="card-body p-4 d-flex flex-column">
                  <h5 className="fw-bold mb-1">{service.title}</h5>
                  <p className="text-muted small mb-3">
                    Category: <strong>{service.category}</strong>
                  </p>

                  <div className="mt-auto">
                    {!service.isBoosted ? (
                      <button
                        className="btn btn-danger w-100 fw-bold py-2 rounded-pill shadow-sm"
                        onClick={() => handleBoostClick(service)}
                      >
                        Boost Service
                      </button>
                    ) : (
                      <div className="boosted-status-msg py-2 fw-bold text-center rounded-pill mb-2">
                        Priority Boosted: {getRemainingTime(service.expiryDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-end align-items-center mt-5 gap-3">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="fw-bold px-2 text-dark">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}