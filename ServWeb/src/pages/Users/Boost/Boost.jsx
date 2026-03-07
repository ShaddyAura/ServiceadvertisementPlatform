import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAllServices,
  fetchProfileById,
  fetchServiceById ,
  applyBoost,
  fetchBoostStatus,
  // cancelBoost
} from "../../../api/AccountApi";
import "./Boost.css";

export default function Boost() {
  const { user, authLoading } = useAuth();
  const hasLoaded = useRef(false);

  const [profile, setProfile] = useState({ boostingPoints: 0 });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const boostPlans = [
    { type: "Standard", price: 200, duration: "3 Days" },
    { type: "Premium", price: 500, duration: "7 Days" },
    { type: "Elite", price: 1000, duration: "15 Days" }
  ];

  useEffect(() => {
    if (!authLoading && user?.profileId && !hasLoaded.current) {
      hasLoaded.current = true;
      loadData();
    }
  }, [authLoading, user]);

  // Auto remove expired boost every minute
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

  const loadData = async () => {
    try {
      setLoading(true);

      const profileRes = await fetchProfileById(user.profileId);
      const serviceRes = await fetchAllServices();

      const myServices =
        serviceRes.data?.filter(s => s.profileId === user.profileId) || [];

      const servicesWithBoost = await Promise.all(
        myServices.map(async (service) => {
          try {
            const res = await fetchBoostStatus(service.id);

            // ✅ FIXED HERE — using boostEndDate from database
            const expiryDate = res.data?.boostEndDate
              ? new Date(res.data.boostEndDate)
              : null;

            const now = new Date();
            const isCurrentlyActive = expiryDate && expiryDate > now;

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
      setProfile(profileRes.data);
    } catch (err) {
      console.log("Load error:", err.message);
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

    if (planIndex !== null && planIndex !== undefined) {
      const selectedPlan = boostPlans[planIndex];
      const daysToBoost = parseInt(
        selectedPlan.duration.split(" ")[0]
      );

      if (profile.boostingPoints < selectedPlan.price) {
        return Swal.fire(
          "Insufficient Points",
          `You need ${selectedPlan.price} pts.`,
          "error"
        );
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
            s.id === service.id
              ? { ...s, isBoosted: true, expiryDate }
              : s
          );

          return sortServices(updated);
        });

        setProfile(prev => ({
          ...prev,
          boostingPoints:
            prev.boostingPoints - selectedPlan.price
        }));

        Swal.fire({
          icon: "success",
          title: "Boost Activated!",
          timer: 2500,
          showConfirmButton: false
        });

      } catch {
        Swal.fire("Error", "Could not apply boost.", "error");
      }
    }
  };
// const handleCancelBoost = async (service) => {
//   const confirm = await Swal.fire({
//     title: "Cancel Boost?",
//     text: "Your service will lose priority immediately.",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#dc3545",
//     confirmButtonText: "Yes, Cancel"
//   });

//   if (!confirm.isConfirmed) return;

//   try {
//     // 1. Call the cancel API
//     // Ensure the ID is being passed correctly as a string/guid
//     await cancelBoost(service.id);

//     // 2. Update the local state immediately to toggle the button back to "Add Boost"
//     setServices(prev => {
//       const updated = prev.map(s =>
//         s.id === service.id
//           ? {
//               ...s,
//               isBoosted: false,   // This hides the "Priority Boost Active" msg
//               expiryDate: null    // This ensures the auto-remove logic doesn't trigger
//             }
//           : s
//       );
//       // Re-sort so the unboosted service moves down
//       return sortServices(updated);
//     });

//     Swal.fire({
//       icon: "success",
//       title: "Boost Cancelled",
//       text: "Your service is now back to standard status.",
//       timer: 2000,
//       showConfirmButton: false
//     });

//   } catch (err) {
//     console.error("Cancel error:", err);
//     // If the backend says "not currently boosted", we should still fix the UI
//     if (err.response?.status === 400) {
//         loadData(); // Force refresh from server to sync UI
//     } else {
//         Swal.fire("Error", "Could not cancel boost. Please try again.", "error");
//     }
//   }
// };

  // Pagination
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = services.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm p-4 border-0"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px"
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h3 className="fw-bold mb-1">My Services</h3>
            <p className="text-muted small mb-0">
              Manage and promote your active listings
            </p>
          </div>

          <div className="points-status-card">
            <span className="points-label">
              Total Points
            </span>
            <span className="points-value">
              {profile.boostingPoints || 0}
            </span>
          </div>
        </div>

        <div className="row g-4">
          {currentItems.map(service => (
            <div
              key={service.id}
              className="col-md-6 col-lg-4"
            >
              <div
                className={`service-card h-100 ${
                  service.isBoosted
                    ? "boosted-border"
                    : ""
                }`}
              >
                {service.isBoosted && (
                  <div className="boost-badge">
                    <span className="pulse-dot"></span>
                    Active Boost
                  </div>
                )}

                <div className="img-container">
                  <img
                    src={`https://localhost:7065${service.imageUrl}`}
                    className="card-img-top"
                    alt={service.title}
                  />
                </div>

                <div className="card-body p-4 d-flex flex-column">
                  <h5 className="fw-bold mb-1">
                    {service.title}
                  </h5>

                  <p className="text-muted small mb-3">
                    Category:{" "}
                    <strong>
                      {service.category}
                    </strong>
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
    <>
      <div className="boosted-status-msg py-2 fw-bold text-center rounded-pill mb-2">
        Priority Boost Active
      </div>

      {/* <button
        className="btn btn-outline-danger w-100 fw-bold py-2 rounded-pill"
        onClick={() => handleCancelBoost(service)}
      >
        Cancel Boost
      </button> */}
    </>
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
              onClick={() =>
                setCurrentPage(prev =>
                  Math.max(prev - 1, 1)
                )
              }
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="fw-bold px-2 text-dark">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage(prev =>
                  Math.min(prev + 1, totalPages)
                )
              }
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