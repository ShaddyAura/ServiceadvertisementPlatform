import React, { useEffect, useState, useCallback } from "react";
import { fetchAllWithdrawals, approveWithdrawal, rejectWithdrawal } from "../../../api/AccountApi";
import { FaWallet, FaCheck, FaTimes, FaHistory, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import "./AdminWithdrawals.css";
import "../AdminDashboard.css";

const AdminWithdrawals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadWithdrawals = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchAllWithdrawals();
            setRequests(res.data || []);
        } catch (err) {
            console.error("Failed to load withdrawals:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWithdrawals();
    }, [loadWithdrawals]);

    const handleProcess = async (id, action) => {
        const isApprove = action === "approve";
        const c = await Swal.fire({
            title: isApprove ? "Approve Withdrawal?" : "Reject Withdrawal?",
            text: isApprove ? "Ensure you have manually transferred the funds to their account first!" : "Are you sure you want to reject this request?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: isApprove ? "Yes, Approve" : "Yes, Reject",
            confirmButtonColor: isApprove ? "#10b981" : "#ef4444"
        });

        if (c.isConfirmed) {
            try {
                if (isApprove) await approveWithdrawal(id);
                else await rejectWithdrawal(id);
                
                Swal.fire("Success!", `Request ${action}d successfully.`, "success");
                loadWithdrawals();
            } catch (err) {
                Swal.fire("Error", "Action failed.", "error");
            }
        }
    };

    const filtered = requests.filter(r => 
        (r.profile?.fullName || r.profile?.FirstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.accountDetails || "").includes(searchTerm)
    );

    if (loading) return <div className="admin-loader">Loading Withdrawals...</div>;

    const stats = {
        pending: requests.filter(r => r.status === "Pending").length,
        totalVolume: requests.filter(r => r.status === "Approved").reduce((s, r) => s + r.amount, 0)
    };

    return (
        <div className="admin-payout-wrapper">
            <div className="admin-dash-header">
                <div>
                    <h2 className="admin-dash-title"><FaWallet color="#6366f1" /> Payout Requests</h2>
                    <p className="admin-dash-subtitle">Review and process provider withdrawal requests.</p>
                </div>
                <div className="admin-dash-stats" style={{ display: 'flex', gap: '20px' }}>
                    <div className="admin-stat-card simplified stat-gradient-emerald">
                        <span className="label">Total Paid Out</span>
                        <span className="value">Rs. {stats.totalVolume.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="admin-chart-card mt-4">
                <div className="admin-chart-header d-flex justify-content-between align-items-center">
                    <h5>Pending & Recent Payouts</h5>
                    <div className="search-wrap">
                        <FaSearch />
                        <input 
                            type="text" 
                            placeholder="Search provider or account..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="withdrawal-table-container">
                    <table className="withdrawal-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Provider</th>
                                <th>Method</th>
                                <th>Account/ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map(r => (
                                <tr key={r.id}>
                                    <td className="w-date">{new Date(r.requestedAt).toLocaleDateString()}</td>
                                    <td className="fw-bold">{r.profile?.fullName || r.profile?.FirstName || "Unknown"}</td>
                                    <td>
                                        <span className={`method-badge ${r.paymentMethod.toLowerCase()}`}>
                                            {r.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="code-font">{r.accountDetails}</td>
                                    <td className="payout-amount-text">Rs. {r.amount.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-pill ${r.status.toLowerCase()}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        {r.status === "Pending" ? (
                                            <div className="payout-actions">
                                                <button className="payout-btn approve" title="Approve" onClick={() => handleProcess(r.id, "approve")}>
                                                    <FaCheck /> Approve
                                                </button>
                                                <button className="payout-btn reject" title="Reject" onClick={() => handleProcess(r.id, "reject")}>
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="processed-at">
                                                <FaHistory /> {r.processedAt ? new Date(r.processedAt).toLocaleDateString() : "Processed"}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="text-center p-5 text-muted">No withdrawal requests found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminWithdrawals;
