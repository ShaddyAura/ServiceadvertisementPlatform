import React, { useEffect, useState, useCallback } from "react";
import { fetchAllServices, getServiceReviews, fetchAllProfiles } from "../../../api/AccountApi";
import { 
  FaStar, 
  FaRegStar, 
  FaExclamationTriangle, 
  FaUserTie, 
  FaQuoteLeft, 
  FaSearch 
} from "react-icons/fa";
import "./Report.css";

export default function ReportReview() {
  const [reviewData, setReviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ avgPlatform: 0, totalReviews: 0, flagged: 0 });

  const loadReviewReport = useCallback(async () => {
    try {
      setLoading(true);
      const [srvRes, profRes] = await Promise.all([
          fetchAllServices(),
          fetchAllProfiles()
      ]);
      const allServices = srvRes.data || [];
      const allProfiles = profRes.data || [];
      
      const profileMap = {};
      allProfiles.forEach(p => {
        profileMap[p.id || p.Id] = p.fullName || `${p.firstName} ${p.lastName}` || "Unknown Provider";
      });

      let totalRatingSum = 0;
      let totalReviewCount = 0;
      let flaggedCount = 0;

      // Map through services and fetch their specific reviews
      const detailedReports = await Promise.all(
        allServices.map(async (service) => {
          try {
            const revRes = await getServiceReviews(service.id || service.Id);
            const reviews = revRes.data || [];
            
            const serviceAvg = reviews.length > 0 
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
              : 0;

            totalRatingSum += reviews.reduce((sum, r) => sum + r.rating, 0);
            totalReviewCount += reviews.length;
            if (serviceAvg > 0 && serviceAvg < 3) flaggedCount++;

            let providerName = service.profile?.fullName;
            if (!providerName && service.profileId) {
                providerName = profileMap[service.profileId];
            }

            return {
              id: service.id || service.Id,
              title: service.title,
              provider: providerName || "N/A",
              avgRating: serviceAvg.toFixed(1),
              reviewCount: reviews.length,
              latestComment: reviews.length > 0 ? reviews[0].comment : "No reviews yet"
            };
          } catch (err) {
            return { title: service.title, provider: "N/A", avgRating: 0, reviewCount: 0, latestComment: "Error loading" };
          }
        })
      );

      setStats({
        avgPlatform: totalReviewCount > 0 ? (totalRatingSum / totalReviewCount).toFixed(1) : 0,
        totalReviews: totalReviewCount,
        flagged: flaggedCount
      });
      setReviewData(detailedReports);
    } catch (error) {
      console.error("Review Report Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviewReport();
  }, [loadReviewReport]);

  const filteredData = reviewData.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-loader">Calculating Ratings & Feedback...</div>;

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Reviews & Reputation Report</h2>
        <div className="search-bar">
          <FaSearch />
          <input 
            type="text" 
            placeholder="Search Service or Provider..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 🟢 TOP ROW: RATING SUMMARY */}
      <div className="stats-row">
        <div className="report-card">
          <FaStar className="icon-gold" />
          <div className="card-data">
            <h4>{stats.avgPlatform} / 5.0</h4>
            <p>Platform Avg Rating</p>
          </div>
        </div>
        <div className="report-card">
          <FaQuoteLeft className="icon-blue" />
          <div className="card-data">
            <h4>{stats.totalReviews}</h4>
            <p>Total Feedback</p>
          </div>
        </div>
        <div className="report-card">
          <FaExclamationTriangle className="icon-red" />
          <div className="card-data">
            <h4>{stats.flagged}</h4>
            <p>Low-Rated Services</p>
          </div>
        </div>
      </div>

      {/* 🟢 REVIEWS GRID VIEW */}
      <div className="table-card shadow-sm">
        <div className="card-header d-flex justify-content-between">
          <span>Service Quality Ranking</span>
          <span className="small text-muted">Averages below 3.0 are flagged red</span>
        </div>
        <table className="admin-report-table">
          <thead>
            <tr>
              <th>Service & Provider</th>
              <th>Rating Score</th>
              <th>Total Reviews</th>
              <th>Latest Feedback</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, i) => (
              <tr key={i} className={item.avgRating > 0 && item.avgRating < 3 ? "row-flagged" : ""}>
                <td>
                  <div className="service-info">
                    <strong>{item.title}</strong>
                    <span><FaUserTie size={10} /> {item.provider}</span>
                  </div>
                </td>
                <td>
                  <div className="rating-pill">
                    <FaStar className={item.avgRating >= 3 ? "text-warning" : "text-danger"} />
                    <span className="ml-1">{item.avgRating}</span>
                  </div>
                </td>
                <td className="text-center font-weight-bold">{item.reviewCount}</td>
                <td>
                  <div className="comment-preview" title={item.latestComment}>
                    "{item.latestComment.substring(0, 40)}{item.latestComment.length > 40 ? "..." : ""}"
                  </div>
                </td>
                <td className="text-right">
                  <button className="view-btn">Inspect</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}