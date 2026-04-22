import React, { useEffect, useState, useCallback } from "react";
import { getWallet, createWithdrawalRequest, getUserWithdrawals } from "../../../api/AccountApi";
import { useAuth } from "../../../context/AuthContext";
import { FaMoneyCheckAlt, FaHistory, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import Swal from "sweetalert2";
import "./ProviderPayouts.css";

const ProviderPayouts = () => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        amount: "",
        method: "eSewa",
        details: ""
    });

    const loadData = useCallback(async () => {
        if (!user?.profileId) return;
        try {
            setLoading(true);
            const [wRes, hRes] = await Promise.all([
                getWallet(user.profileId),
                getUserWithdrawals(user.profileId)
            ]);
            setWallet(wRes.data);
            setHistory(hRes.data || []);
        } catch (err) {
            console.error("Payout data load error:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRequest = async (e) => {
        e.preventDefault();
        const amt = parseFloat(form.amount);
        if (isNaN(amt) || amt <= 0) return Swal.fire("Invalid Amount", "Enter a positive number.", "error");

        const balance = form.method === "eSewa" ? wallet.eSewaBalance : wallet.khaltiBalance;
        if (amt > balance) return Swal.fire("Insufficient Funds", `You only have Rs. ${balance} in your ${form.method} balance.`, "error");

        try {
            setSubmitting(true);
            await createWithdrawalRequest({
                profileId: user.profileId,
                amount: amt,
                paymentMethod: form.method,
                accountDetails: form.details
            });
            Swal.fire("Success", "Withdrawal request submitted for review.", "success");
            setForm({ amount: "", method: "eSewa", details: "" });
            loadData();
        } catch (err) {
            Swal.fire("Error", "Request failed. Try again later.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-5 text-center">Loading Payouts...</div>;

    return (
        <div className="payouts-page container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold"><FaMoneyCheckAlt color="#6366f1" /> My Earnings & Payouts</h3>
                    <p className="text-muted">Withdraw your service earnings to your digital wallet.</p>
                </div>
            </div>

            <div className="row">
                {/* Withdrawal Form */}
                <div className="col-lg-5 mb-4">
                    <div className="card shadow-sm border-0 p-4">
                        <h5 className="mb-4 fw-bold">Request New Payout</h5>
                        
                        <div className="balance-info mb-4 d-flex gap-3">
                            <div className="bal-card esewa">
                                <span className="small">eSewa Earnings</span>
                                <h6>Rs. {wallet?.eSewaBalance?.toLocaleString()}</h6>
                            </div>
                            <div className="bal-card khalti">
                                <span className="small">Khalti Earnings</span>
                                <h6>Rs. {wallet?.khaltiBalance?.toLocaleString()}</h6>
                            </div>
                        </div>

                        <form onSubmit={handleRequest}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Select Wallet Method</label>
                                <select 
                                    className="form-select" 
                                    value={form.method}
                                    onChange={e => setForm({...form, method: e.target.value})}
                                >
                                    <option value="eSewa">eSewa Wallet</option>
                                    <option value="Khalti">Khalti Wallet</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Withdrawal Amount (NPR)</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="e.g. 5000"
                                    value={form.amount}
                                    onChange={e => setForm({...form, amount: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold">Account Phone Number / ID</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Enter associated phone number"
                                    value={form.details}
                                    onChange={e => setForm({...form, details: e.target.value})}
                                    required
                                />
                            </div>
                            <button 
                                className="btn btn-primary w-100 py-2 fw-bold"
                                disabled={submitting}
                            >
                                {submitting ? "Processing..." : "Submit Withdrawal Request"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History */}
                <div className="col-lg-7">
                    <div className="card shadow-sm border-0 p-4">
                        <h5 className="mb-4 fw-bold"><FaHistory className="me-2" /> Payout History</h5>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="bg-light">
                                    <tr className="small text-muted">
                                        <th>Date</th>
                                        <th>Method</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? history.map(h => (
                                        <tr key={h.id}>
                                            <td className="small">{new Date(h.requestedAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge-method ${h.paymentMethod.toLowerCase()}`}>
                                                    {h.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="fw-bold">Rs. {h.amount.toLocaleString()}</td>
                                            <td>
                                                <span className={`status-tag ${h.status.toLowerCase()}`}>
                                                    {h.status === "Pending" && <FaClock className="me-1" />}
                                                    {h.status === "Approved" && <FaCheckCircle className="me-1" />}
                                                    {h.status === "Rejected" && <FaTimesCircle className="me-1" />}
                                                    {h.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted">No withdrawal history found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderPayouts;
