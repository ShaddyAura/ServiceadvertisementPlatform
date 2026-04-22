import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import {
  fetchAllServices,
  fetchProfileById,
  fetchBoostStatus,
  fetchCategories,
  createReview,
  getServiceReviews,
  claimUserDailyReward,
  claimUserWatchTimeReward,
  fetchAllBookings
} from "../../api/AccountApi";

import { FaStar, FaTag } from "react-icons/fa";
import "./UserDashboard.css";

// Helper: Get active promotions from localStorage
const getActivePromotions = () => {
  try {
    const promos = JSON.parse(localStorage.getItem("platform_promotions")) || [];
    const now = new Date();
    return promos.filter(p => {
      if (!p.isActive) return false;
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      end.setHours(23, 59, 59, 999);
      return now >= start && now <= end;
    });
  } catch { return []; }
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  // Data States
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState({ boostingPoints: 0, fullName: "User", walletId: null });
  const [loading, setLoading] = useState(true);

  // Search & UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedService, setSelectedService] = useState(null);
  const [serviceReviews, setServiceReviews] = useState([]);
  const [strikeInfo, setStrikeInfo] = useState({ canClaim: false, currentStrike: 0 });
  const [activePromos, setActivePromos] = useState([]);

  // Reward Timer States
  const [timer, setTimer] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const timerIntervalRef = useRef(null);

  // Review States
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const REWARD_SECONDS = 60;
  const ENGAGEMENT_REWARD = 0.1;
  const LOGIN_REWARD = 2;

  useEffect(() => {
    if (!authLoading && user?.profileId) {
      loadDashboardData();
    }
    return () => stopEngagement();
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setActivePromos(getActivePromotions());
      const [profileRes, serviceRes, catRes] = await Promise.all([
        fetchProfileById(user.profileId),
        fetchAllServices(),
        fetchCategories()
      ]);

      const profData = profileRes.data || {};
      let combinedFullName = profData.fullName;
      if (!combinedFullName || ["User", "Friend"].includes(combinedFullName)) {
        combinedFullName = user?.fullname;
      }
      if (!combinedFullName || ["User", "Friend"].includes(combinedFullName)) {
        if (user?.email) {
          const namePart = user.email.split('@')[0].replace(/[0-9]/g, '');
          combinedFullName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        } else {
          combinedFullName = "Friend";
        }
      }

      setProfile({
        ...profData,
        fullName: combinedFullName,
        boostingPoints: profData.boostingPoints || 0
      });

      setCategories(catRes.data || []);

      // Users don't have wallets — strike status is handled locally
      setStrikeInfo({ canClaim: true });

      const allServices = serviceRes.data || [];
      const servicesWithBoost = await Promise.all(
        allServices.map(async (service) => {
          let isBoosted = false;
          let pointsSpent = 0;
          let avgRate = 0;
          let rCount = 0;

          try {
            const res = await fetchBoostStatus(service.id);
            const expiryStr = res.data?.boostExpiry || res.data?.boostEndDate;
            pointsSpent = res.data?.pointsSpent || 0;
            
            if (expiryStr) {
              const expiry = new Date(expiryStr.endsWith('Z') ? expiryStr : expiryStr + 'Z');
              isBoosted = expiry > new Date();
            }
          } catch { }

          try {
            const revRes = await getServiceReviews(service.id);
            const revs = revRes.data || [];
            rCount = revs.length;
            if (rCount > 0) {
              let total = revs.reduce((acc, current) => acc + (current.rating || current.Rating || 5), 0);
              avgRate = total / rCount;
            }
          } catch { }

          return { ...service, isBoosted, pointsSpent, avgRating: avgRate.toFixed(1), reviewCount: rCount };
        })
      );

      // 🔥 DYNAMIC SORTING: 
      // 1. Boosted first
      // 2. Max Points to Min Points
      setServices(servicesWithBoost.sort((a, b) => {
        if (b.isBoosted !== a.isBoosted) return b.isBoosted - a.isBoosted;
        return (b.pointsSpent || 0) - (a.pointsSpent || 0);
      }));
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };


  const startEngagementTimer = async (service) => {
    setSelectedService(service);
    if (!isProvider) {
      setTimer(0);
      setRewardClaimed(false);
    }
    try {
      const res = await getServiceReviews(service.id);
      setServiceReviews(res.data || []);
    } catch (err) { }

    if (!isProvider) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= REWARD_SECONDS - 1) {
            stopEngagement(true);
            return REWARD_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const stopEngagement = (isComplete = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (isComplete && !rewardClaimed && !isProvider) handleEarnPoints();
  };

  const handleEarnPoints = async () => {
    if (isProvider) return;
    setRewardClaimed(true);
    try {
      const res = await claimUserWatchTimeReward(user.profileId, REWARD_SECONDS);
      // Backend awards 0.1 points for watching ad
      const earned = 0.1;
      setProfile(prev => ({ ...prev, boostingPoints: res.data.boostingPoints }));
      Swal.fire({ title: 'Reward!', text: `+${earned} points!`, icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating || submittingReview) return;
    try {
      setSubmittingReview(true);
      await createReview({ rating, comment: reviewComment, profileId: user.profileId, serviceId: selectedService.id });
      Swal.fire({ title: 'Submitted!', icon: 'success', timer: 1500, showConfirmButton: false });
      const res = await getServiceReviews(selectedService.id);
      setServiceReviews(res.data || []);
      setRating(0); setReviewComment("");
    } catch (err) {
      Swal.fire('Error', 'Failed to save review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="user-loading-screen">
      <div className="user-loading-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 19) return "Good afternoon";
    return "Good evening";
  };

  const isProvider = user?.role === 'ServiceProvider' || user?.roles?.includes('ServiceProvider');

  // --- SERVICE DETAILS VIEW ---
  if (selectedService) {
    return (
      <div className="user-detail-view fade-in">
        <button className="user-back-btn" onClick={() => { stopEngagement(false); setSelectedService(null); }}>
          <i className="bi bi-arrow-left"></i> Back to Services
        </button>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="user-detail-media-card">
              {selectedService.videoUrl ? (
                <video src={`https://localhost:7065${selectedService.videoUrl}`} controls autoPlay muted className="user-detail-media" />
              ) : (
                <img src={`https://localhost:7065${selectedService.imageUrl}`} className="user-detail-media" alt="service" />
              )}
              <div className="user-detail-body">
                <div className="user-detail-title-row">
                  <h2>{selectedService.title}</h2>
                  <div className="user-detail-price">Rs. {selectedService.price}</div>
                </div>

                {/* Dynamically Recalculated Stars */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <FaStar className="text-warning me-2" style={{ fontSize: '1.1rem' }} />
                  <strong style={{ color: '#1e293b' }}>{selectedService.avgRating > 0 ? selectedService.avgRating : 'New'}</strong>
                  <span style={{ color: '#64748b', marginLeft: '5px' }}>({selectedService.reviewCount || 0} reviews)</span>
                </div>

                <span className="user-detail-category">{selectedService.category}</span>
                <p className="user-detail-desc">{selectedService.description}</p>
              </div>
            </div>

            {/* REVIEW FORM */}
            <div className="user-review-form-card">
              <h5>✍️ Leave a Review</h5>
              <div className="user-star-row">
                {[...Array(5)].map((_, i) => (
                  <button key={i} type="button" className="user-star-btn" onClick={() => setRating(i + 1)} onMouseEnter={() => setHover(i + 1)} onMouseLeave={() => setHover(0)}>
                    <FaStar className={i + 1 <= (hover || rating) ? 'text-warning' : 'text-muted'} style={{ fontSize: '1.4rem' }} />
                  </button>
                ))}
              </div>
              <textarea className="user-review-textarea" rows="3" placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
              <button className="user-submit-review-btn" onClick={handleSubmitReview} disabled={!rating || submittingReview}>
                {submittingReview ? "Posting..." : "Submit Review"}
              </button>
            </div>

            {/* REVIEWS LIST */}
            <div className="user-reviews-list-card">
              <h5>💬 Recent Feedbacks</h5>
              {serviceReviews.length > 0 ? serviceReviews.map((r, idx) => {
                const rating = r.rating || r.Rating || 5;
                const comment = r.comment || r.Comment || "Excellent";
                const profile = r.profile || r.Profile || {};
                const fName = profile.firstName || profile.FirstName || "Customer";
                const lName = profile.lastName || profile.LastName || "";
                return (
                  <div key={r.id || r.Id || idx} className="user-review-item">
                    <div className="user-review-avatar">
                      {fName[0]}
                    </div>
                    <div className="user-review-content">
                      <h6>{fName} {lName}</h6>
                      <div className="user-review-stars text-warning">
                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < rating ? 'text-warning' : 'text-muted'} style={{ fontSize: '0.9rem' }} />)}
                        <span className="ms-2 small text-muted">({rating}/5)</span>
                      </div>
                      <p style={{ marginTop: '5px' }}>{comment}</p>
                    </div>
                  </div>
                )
              }) : <p className="user-no-reviews">No reviews yet. Be the first!</p>}
            </div>
          </div>

          <div className="col-lg-4">
            {!isProvider && (
              <div className="user-reward-card sticky-top" style={{ top: '20px' }}>
                <h6>🎁 Reward Progress</h6>
                <div className="user-reward-progress">
                  <div className={`user-reward-bar ${rewardClaimed ? 'bar-complete' : 'bar-active'}`} style={{ width: `${(timer / REWARD_SECONDS) * 100}%` }}></div>
                </div>
                <p className="user-reward-text">
                  {rewardClaimed ? "✅ 0.1 Points Claimed!" : `Watch for ${REWARD_SECONDS - timer}s to earn`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD MAIN VIEW ---
  const filteredServices = services
    .filter(s => (selectedCategory === "All" || s.category === selectedCategory) && s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // Get matching promo for a service
  const getPromoForService = (service) => {
    return activePromos.find(p => p.category === "All Categories" || p.category === service.category);
  };

  return (
    <div className="user-dash-wrapper">

      {/* TOP WELCOME BAR */}
      <div className="user-welcome-bar">
        <div className="user-welcome-left">
          <h2>{getGreeting()}, {profile?.fullName || "Friend"}! 👋</h2>
          <p>Explore premium verified services</p>

          {/* DISCOUNT / PROMO HIGHLIGHT */}
          {activePromos.length > 0 && (
            <div className="user-welcome-promo fade-in">
              <div className="user-promo-pill">
                <FaTag className="me-1" />
                <span>{activePromos[0].discount}% OFF {activePromos[0].category}</span>
              </div>
              <span className="user-promo-mini-msg">{activePromos[0].message}</span>
            </div>
          )}
        </div>

        <div className="user-welcome-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>


          {strikeInfo.canClaim && !isProvider && (
            <button
              onClick={async () => {
                setStrikeInfo(prev => ({ ...prev, canClaim: false }));
                try {
                  const res = await claimUserDailyReward(user.profileId);
                  setProfile(prev => ({ ...prev, boostingPoints: res.data.boostingPoints }));
                  Swal.fire({ title: 'Bonus!', text: `+2 Pts added`, icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                } catch (err) {
                  const serverError = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null) || 'Daily limit reached or reward already claimed.';
                  Swal.fire({ title: 'Login Reward Limit', text: serverError, icon: 'info', toast: true, position: 'top-end', timer: 4000, showConfirmButton: false });
                  setStrikeInfo(prev => ({ ...prev, canClaim: true }));
                }
              }}
              className="user-claim-btn"
            >
              🎯 Claim 2 Pts
            </button>
          )}

          <div className="user-points-pill">
            <i className="bi bi-wallet2"></i>
            <span>{Number(profile?.boostingPoints || 0).toFixed(2)} Pts</span>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="user-filter-row">
        <div className="user-search-wrap">
          <i className="bi bi-search user-search-icon"></i>
          <input
            type="text"
            className="user-search-input"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="user-category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="All">All Categories</option>
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </select>
      </div>


      {/* SERVICE GRID */}
      <div className="user-services-grid">
        {filteredServices.map((s) => {
          const promo = getPromoForService(s);
          const discountedPrice = promo ? (s.price * (1 - promo.discount / 100)).toFixed(0) : null;
          return (
            <div key={s.id} className="user-service-card" onClick={() => startEngagementTimer(s)}>
              {/* Boosted Tag */}
              {s.isBoosted && (
                <div className="user-featured-tag">🔥 FEATURED</div>
              )}

              {/* Discount Tag */}
              {promo && (
                <div className="user-discount-tag">{promo.discount}% OFF</div>
              )}

              <div className="user-card-media">
                {s.videoUrl ? (
                  <video
                    src={`https://localhost:7065${s.videoUrl}`}
                    className="user-card-img"
                    autoPlay muted loop playsInline
                    onMouseEnter={(e) => e.target.play()}
                  />
                ) : (
                  <img
                    src={`https://localhost:7065${s.imageUrl}`}
                    className="user-card-img"
                    alt={s.title}
                  />
                )}
                {s.videoUrl && (
                  <div className="user-video-indicator">
                    <i className="bi bi-play-circle-fill"></i>
                  </div>
                )}
                {promo ? (
                  <div className="user-price-tag user-price-discounted">
                    <span className="user-price-old">Rs. {s.price}</span>
                    <span>Rs. {discountedPrice}</span>
                  </div>
                ) : (
                  <div className="user-price-tag">Rs. {s.price}</div>
                )}
              </div>

              <div className="user-card-body">
                <span className="user-card-category">{s.category}</span>
                <h5 className="user-card-title">{s.title}</h5>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                  <FaStar className="text-warning" style={{ marginRight: '4px' }} />
                  <span className="fw-bold" style={{ color: '#1e293b' }}>{s.avgRating > 0 ? s.avgRating : 'New'}</span>
                  <span style={{ marginLeft: '4px' }}>({s.reviewCount || 0})</span>
                </div>
                {!isProvider && (
                  <div className="user-card-earn">
                    <i className="bi bi-coin"></i> Watch & Earn 0.1 Pts
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredServices.length === 0 && (
          <div className="user-no-services">
            <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#cbd5e1' }}></i>
            <p>No services found</p>
          </div>
        )}
      </div>
    </div>
  );
}