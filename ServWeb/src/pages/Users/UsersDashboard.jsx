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
  GetStrikeStatus,
} from "../../api/AccountApi";

import "./UserDashboard.css";

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

  // Reward Timer States
  const [timer, setTimer] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const timerIntervalRef = useRef(null);

  // Review States
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const REWARD_SECONDS = 15;
  const ENGAGEMENT_REWARD = 0.10;
  const LOGIN_REWARD = 0.15;

  useEffect(() => {
    if (!authLoading && user?.profileId) {
      loadDashboardData();
    }
    return () => stopEngagement();
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, serviceRes, catRes] = await Promise.all([
        fetchProfileById(user.profileId),
        fetchAllServices(),
        fetchCategories()
      ]);

      // Combine API data with Auth context data for safety
      const profData = profileRes.data || {};
      const combinedFullName = profData.fullName || (user.firstName ? `${user.firstName} ${user.lastName}` : "User");
      
      setProfile({
        ...profData,
        fullName: combinedFullName,
        boostingPoints: profData.boostingPoints || 0
      });

      setCategories(catRes.data || []);
      
      if (profData.walletId) {
        const strikeRes = await GetStrikeStatus(profData.walletId);
        setStrikeInfo(strikeRes.data);
      }

      const allServices = serviceRes.data || [];
      const servicesWithBoost = await Promise.all(
        allServices.map(async (service) => {
          try {
            const res = await fetchBoostStatus(service.id);
            const expiry = res.data?.boostExpiry ? new Date(res.data.boostExpiry) : null;
            return { ...service, isBoosted: expiry && expiry > new Date() };
          } catch {
            return { ...service, isBoosted: false };
          }
        })
      );

      setServices(servicesWithBoost.sort((a, b) => Number(b.isBoosted) - Number(a.isBoosted)));
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const showPaymentHistory = async () => {
    const mockHistory = [
      { date: new Date(), amount: 500, status: "Success", gateway: "eSewa" },
    ];

    const htmlRows = mockHistory.map(h => `
      <tr>
        <td>${new Date(h.date).toLocaleDateString()}</td>
        <td>Rs. ${h.amount}</td>
        <td><span class="badge bg-success">${h.status}</span></td>
        <td class="text-uppercase">${h.gateway}</td>
      </tr>
    `).join('');

    Swal.fire({
      title: 'Payment History',
      html: `<div class="table-responsive"><table class="table table-sm mt-3" style="font-size: 0.85rem">
            <thead><tr><th>Date</th><th>Amt</th><th>Status</th><th>Via</th></tr></thead>
            <tbody>${htmlRows}</tbody></table></div>`,
      confirmButtonColor: '#dc3545'
    });
  };

  const startEngagementTimer = async (service) => {
    setSelectedService(service);
    setTimer(0);
    setRewardClaimed(false);
    try {
      const res = await getServiceReviews(service.id);
      setServiceReviews(res.data || []);
    } catch (err) {}

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
  };

  const stopEngagement = (isComplete = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (isComplete && !rewardClaimed) handleEarnPoints();
  };

  const handleEarnPoints = () => {
    setRewardClaimed(true);
    setProfile(prev => ({ ...prev, boostingPoints: (prev.boostingPoints || 0) + ENGAGEMENT_REWARD }));
    Swal.fire({ title: 'Reward!', text: `+${ENGAGEMENT_REWARD} points!`, icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
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

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-danger" /></div>;

  // --- SERVICE DETAILS VIEW ---
  if (selectedService) {
    return (
      <div className="container py-4 fade-in">
        <button className="btn btn-outline-dark mb-4" onClick={() => { stopEngagement(false); setSelectedService(null); }}>
          &larr; Back to Services
        </button>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 mb-4 overflow-hidden">
              {selectedService.videoUrl ? (
                <video src={`https://localhost:7065${selectedService.videoUrl}`} controls autoPlay muted className="w-100" style={{maxHeight: '450px', background: '#000'}} />
              ) : (
                <img src={`https://localhost:7065${selectedService.imageUrl}`} className="img-fluid w-100" alt="service" style={{maxHeight: '400px', objectFit: 'cover'}} />
              )}
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                   <h2 className="fw-bold m-0">{selectedService.title}</h2>
                   <div className="h4 text-danger fw-bold m-0">Rs. {selectedService.price}</div>
                </div>
                <span className="badge bg-light text-dark border my-2">{selectedService.category}</span>
                <p className="text-muted mt-2">{selectedService.description}</p>
              </div>
            </div>

            {/* REVIEW FORM */}
            <div className="card shadow-sm p-4 border-0 mb-4">
              <h5 className="fw-bold">Leave a Review</h5>
              <div className="mb-3">
                {[...Array(5)].map((_, i) => (
                  <button key={i} className="btn-star border-0 bg-transparent" onClick={() => setRating(i + 1)} onMouseEnter={() => setHover(i + 1)} onMouseLeave={() => setHover(0)}>
                    <i className={`fa-star ${i + 1 <= (hover || rating) ? 'fas text-warning' : 'far text-muted'}`} style={{fontSize: '1.5rem'}} />
                  </button>
                ))}
              </div>
              <textarea className="form-control mb-3" rows="3" placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
              <button className="btn btn-danger w-100 fw-bold py-2" onClick={handleSubmitReview} disabled={!rating || submittingReview}>
                {submittingReview ? "Posting..." : "Submit Review"}
              </button>
            </div>

            {/* REVIEWS LIST */}
            <div className="card shadow-sm p-4 border-0">
              <h5 className="mb-4 fw-bold">Recent Feedbacks</h5>
              {serviceReviews.length > 0 ? serviceReviews.map((r) => (
                <div key={r.id} className="border-bottom mb-3 pb-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style={{width: '35px', height: '35px', fontSize: '0.8rem'}}>
                      {(r.profile?.firstName || 'A')[0]}
                    </div>
                    <div>
                      <h6 className="m-0 fw-bold small">{r.profile?.firstName} {r.profile?.lastName}</h6>
                      <div className="star-display">
                        {[...Array(5)].map((_, i) => <i key={i} className={`fa-star ${i < r.rating ? 'fas text-warning' : 'far text-muted'}`} style={{fontSize: '0.7rem'}} />)}
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 mb-0 text-secondary small ps-4">{r.comment}</p>
                </div>
              )) : <p className="text-muted text-center py-3">No reviews yet.</p>}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm p-4 border-0 sticky-top" style={{ top: '20px' }}>
              <h6 className="fw-bold text-center">Reward Progress</h6>
              <div className="progress my-3" style={{ height: '10px' }}>
                <div className={`progress-bar ${rewardClaimed ? 'bg-success' : 'bg-danger progress-bar-animated progress-bar-striped'}`} style={{ width: `${(timer / REWARD_SECONDS) * 100}%` }}></div>
              </div>
              <p className="text-center small">{rewardClaimed ? "✅ 0.10 Points Claimed" : `Watch for ${REWARD_SECONDS - timer}s to earn`}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD MAIN VIEW ---
  return (
    <div className="dashboard-wrapper">
      <div className="container py-4">
        
        {/* TOP BAR */}
        <div className="top-dashboard-bar d-flex justify-content-between align-items-center mb-5 p-4 bg-white rounded-4 shadow-sm">
            <div>
                <h2 className="m-0 fw-bold">Hello, {profile?.fullName?.split(' ')[0] || "User"}!</h2>
                <p className="m-0 text-muted small">Explore premium verified services</p>
            </div>
            
            <div className="d-flex align-items-center gap-3">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={showPaymentHistory}>
                    <i className="fas fa-history me-1"></i> History
                </button>

                {strikeInfo.canClaim && (
                    <div className="daily-claim-card animate__animated animate__bounceIn p-2 bg-light rounded border text-center">
                        <button onClick={() => {
                            setProfile(prev => ({ ...prev, boostingPoints: (prev.boostingPoints || 0) + LOGIN_REWARD }));
                            setStrikeInfo(prev => ({ ...prev, canClaim: false }));
                            Swal.fire({ title: 'Bonus!', text: `+${LOGIN_REWARD} Pts added`, icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                        }} className="btn btn-success btn-sm fw-bold">Claim {LOGIN_REWARD}</button>
                    </div>
                )}
                
                <div className="points-display-pill bg-danger text-white px-3 py-2 rounded-pill fw-bold">
                    <i className="fas fa-wallet me-2"></i>
                    <span>{Number(profile?.boostingPoints || 0).toFixed(2)} Pts</span>
                </div>
            </div>
        </div>

        {/* FILTERS */}
        <div className="row mb-4 g-3">
          <div className="col-md-8">
            <input type="text" className="form-control form-control-lg shadow-sm" placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="col-md-4">
            <select className="form-select form-select-lg shadow-sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        {/* SERVICE GRID */}
       <div className="row g-4">
  {services
    .filter(s => (selectedCategory === "All" || s.category === selectedCategory) && s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((s) => (
    <div key={s.id} className="col-md-6 col-lg-4">
      <div 
        className={`service-card-main card h-100 border-0 shadow-sm position-relative overflow-hidden`} 
        onClick={() => startEngagementTimer(s)} 
        style={{cursor: 'pointer'}}
      >
        {/* Featured Tag */}
        {s.isBoosted && (
          <div className="bg-warning text-dark fw-bold px-3 py-1 position-absolute top-0 start-0 z-3 small shadow-sm">
            🔥 FEATURED
          </div>
        )}

       <div className="position-relative card-media-container">
  {/* If video exists, show video; otherwise show image */}
  {s.videoUrl ? (
    <div className="video-wrapper shadow-inner">
      <video
        src={`https://localhost:7065${s.videoUrl}`}
        className="card-img-top"
        autoPlay
        muted
        loop
        playsInline
        style={{
          height: '200px',
          width: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        onMouseEnter={(e) => e.target.play()}
      />
      {/* Optional: A small video icon to distinguish from static GIFs */}
      <div className="position-absolute top-0 end-0 m-2">
        <i className="fas fa-video text-white opacity-50 small"></i>
      </div>
    </div>
  ) : (
    <img
      src={`https://localhost:7065${s.imageUrl}`}
      className="card-img-top"
      alt={s.title}
      style={{ height: '200px', objectFit: 'cover' }}
    />
  )}

  {/* Price Badge - Always visible on top of media */}
  <div className="position-absolute bottom-0 end-0 bg-dark text-white px-3 py-1 m-2 rounded-pill small z-2">
    Rs. {s.price}
  </div>
</div>

        <div className="card-body text-center">
          <span className="text-uppercase x-small text-muted fw-bold">{s.category}</span>
          <h5 className="fw-bold mt-1 mb-2 text-dark">{s.title}</h5>
          <div className="text-danger small fw-bold">
            <i className="fas fa-coins me-1"></i> Watch & Earn 0.10 Pts
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
      </div>
    </div>
  );
}