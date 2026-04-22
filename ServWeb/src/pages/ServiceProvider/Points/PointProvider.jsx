import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWallet, GetHistoryPoints } from '../../../api/AccountApi';
import { useAuth } from '../../../context/AuthContext';
import { 
    FaWallet, FaCoins, FaRocket, 
    FaGem, FaCrown, FaHistory, FaTimes
} from 'react-icons/fa';
import './PointProvider.css';

const PointProvider = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [customPoints, setCustomPoints] = useState(200);
    const [loading, setLoading] = useState(true);
    
    // History States
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Dynamic pricing tiers
    const packages = [
        { id: 1, points: 500, rs: 500, label: "Starter", icon: <FaCoins />, color: "#94a3b8" },
        { id: 2, points: 1000, rs: 950, label: "Popular", icon: <FaRocket />, color: "#6366f1", featured: true, badge: "Best Value" },
        { id: 3, points: 2500, rs: 2200, label: "Value", icon: <FaGem />, color: "#f59e0b", badge: "12% Off" },
        { id: 4, points: 5000, rs: 4000, label: "Ultimate", icon: <FaCrown />, color: "#ef4444", badge: "20% Off" },
    ];

    useEffect(() => {
        if (user?.profileId) {
            getWallet(user.profileId)
                .then(res => setWallet(res.data))
                .catch(err => console.error("Wallet load error", err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleFetchHistory = async () => {
        if (!wallet?.id) return;
        try {
            setLoadingHistory(true);
            setShowHistory(true);
            const res = await GetHistoryPoints(wallet.id);
            // Sort by date descending
            const data = (res.data || []).sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
            setHistory(data);
        } catch (err) {
            console.error("Failed to fetch point history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handlePurchase = (rs, points) => {
        navigate("/payment", {
            state: {
                amount: rs,
                points: points,
                planType: "Point Recharge"
            }
        });
    };

    const getSourceLabel = (source) => {
        const sources = {
            0: "Ad Watch",
            1: "Daily Login",
            2: "Point Purchase",
            3: "Ad Boosting"
        };
        return sources[source] || "Transaction";
    };

    if (loading) return <div className="loader">Updating Wallet...</div>;

    return (
        <div className="points-container">
            {/* --- DASHBOARD HEADER --- */}
            <div className="wallet-header">
                <div className="header-main">
                    <div className="balance-section">
                        <div className="icon-circle">
                            <FaWallet />
                        </div>
                        <div>
                            <p className="label">Available Balance</p>
                            <h2 className="amount">{wallet?.pointsBalance || 0} <span>Pts</span></h2>
                        </div>
                    </div>
                    <div className="stats-section">
                        <div className="stat-item">
                            <p>Lifetime Purchased</p>
                            <strong>{wallet?.lifetimePurchasedPoints || 0} Pts</strong>
                        </div>
                        <button className="history-btn" onClick={handleFetchHistory}>
                            <FaHistory /> History
                        </button>
                    </div>
                </div>
            </div>

            <div className="shop-intro">
                <h1>Recharge Points</h1>
                <p>Use points to boost your listings and reach more customers.</p>
            </div>

            {/* --- PACKAGES GRID --- */}
            <div className="packages-grid">
                {packages.map((pkg) => (
                    <div key={pkg.id} className={`pkg-card ${pkg.featured ? 'featured' : ''}`}>
                        {pkg.badge && <span className="pkg-badge">{pkg.badge}</span>}
                        <div className="pkg-visual" style={{ color: pkg.color }}>
                            {pkg.icon}
                        </div>
                        <div className="pkg-info">
                            <h3>{pkg.points.toLocaleString()}</h3>
                            <p>Points</p>
                        </div>
                        <div className="pkg-price">Rs {pkg.rs.toLocaleString()}</div>
                        <button 
                            className="pkg-btn" 
                            style={{ backgroundColor: pkg.color }}
                            onClick={() => handlePurchase(pkg.rs, pkg.points)}
                        >
                            Select Plan
                        </button>
                    </div>
                ))}

                {/* --- CUSTOM INPUT CARD --- */}
                <div className="pkg-card custom">
                    <div className="pkg-visual" style={{ color: '#475569' }}>
                        <FaCoins />
                    </div>
                    <div className="pkg-info">
                        <div className="custom-input-group">
                            <input 
                                type="number" 
                                value={customPoints} 
                                onChange={(e) => setCustomPoints(Math.max(200, e.target.value))}
                            />
                            <span>Pts</span>
                        </div>
                        <p>Minimum 200</p>
                    </div>
                    <div className="pkg-price">Rs {customPoints}</div>
                    <button className="pkg-btn secondary" onClick={() => handlePurchase(customPoints, customPoints)}>
                        Custom Buy
                    </button>
                </div>
            </div>

            {/* --- HISTORY MODAL --- */}
            {showHistory && (
                <div className="history-modal-overlay">
                    <div className="history-modal">
                        <div className="modal-header">
                            <h3><FaHistory className="me-2" /> Point History</h3>
                            <button className="close-btn" onClick={() => setShowHistory(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingHistory ? (
                                <div className="p-5 text-center">
                                    <div className="spinner-border text-danger"></div>
                                </div>
                            ) : history.length > 0 ? (
                                <div className="history-list">
                                    {history.map((h) => (
                                        <div key={h.transactionId} className="history-item">
                                            <div className="h-left">
                                                <span className={`h-badge source-${h.source}`}>
                                                    {getSourceLabel(h.source)}
                                                </span>
                                                <small className="h-date">
                                                    {new Date(h.transactionDate).toLocaleDateString()} {new Date(h.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </div>
                                            <div className={`h-amount ${h.source === 3 ? 'minus' : 'plus'}`}>
                                                {h.source === 3 ? '-' : '+'}{h.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-5 text-muted">
                                    No transaction history found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PointProvider;