import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft, FaShieldAlt, FaWallet } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { getWallet } from "../../../api/AccountApi"; // Ensure this path is correct
import "./Payments.css";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { amount, planType } = location.state || { amount: 0, planType: "N/A" };

  const [isProcessing, setIsProcessing] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [credentials, setCredentials] = useState({ 
    esewaId: "", esewaPw: "", 
    khaltiId: "", khaltiPw: "" 
  });

  // Fetch Wallet Balance on mount
  useEffect(() => {
    if (user?.profileId) {
      fetchWalletDetails();
    }
  }, [user]);

  const fetchWalletDetails = async () => {
    try {
      const res = await getWallet(user.profileId);
      setWallet(res.data);
    } catch (err) {
      console.error("Error fetching wallet:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (gateway) => {
    const isEsewa = gateway === "eSewa";
    const id = isEsewa ? credentials.esewaId : credentials.khaltiId;
    const pw = isEsewa ? credentials.esewaPw : credentials.khaltiPw;

    if (!id || !pw) {
      return Swal.fire("Required", `Please enter your ${gateway} credentials.`, "warning");
    }

    const result = await Swal.fire({
      title: "Confirm Payment",
      text: `Confirm payment of Rs. ${amount} via ${gateway}?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: isEsewa ? "#60bb46" : "#5c2d91",
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      try {
        // Mock API call for payment
        // await processPayment({ profileId: user.profileId, amount, gateway });

        await Swal.fire({
            title: "Success!",
            text: "Transaction completed successfully.",
            icon: "success",
            timer: 2000
        });
        navigate("/dashboard"); 
      } catch (error) {
        Swal.fire("Error", "Transaction could not be completed.", "error");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="payment-page-wrapper">
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <button className="back-link btn btn-link text-dark p-0" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </button>
            <div className="badge bg-light text-dark p-2 border shadow-sm">
                <FaShieldAlt className="text-success me-1" /> Secure SSL Encrypted
            </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-9">
            {/* Summary Row */}
            <div className="alert alert-secondary border-0 shadow-sm d-flex justify-content-between align-items-center p-3 mb-4">
                <div>
                    <span className="text-muted small d-block">Subscribing to</span>
                    <strong className="h5 mb-0">{planType} Plan</strong>
                </div>
                <div className="text-end">
                    <span className="text-muted small d-block">Total Payable</span>
                    <strong className="h4 mb-0 text-danger">Rs. {amount}</strong>
                </div>
            </div>

            <div className="payment-grid">
              {/* eSewa Card */}
              <div className="payment-card esewa-theme shadow-sm border-0">
                <div className="card-top p-3 text-center border-bottom">
                  <img src="/assets/esewa.png" alt="eSewa" style={{ height: "40px" }} />
                </div>
                <div className="card-body-custom p-4">
                  <div className="input-box mb-3">
                    <label className="small fw-bold">eSewa ID (Mobile Number)</label>
                    <input type="text" name="esewaId" className="form-control" value={credentials.esewaId} onChange={handleInputChange} placeholder="98XXXXXXXX" />
                  </div>
                  <div className="input-box mb-4">
                    <label className="small fw-bold">Password / MPIN</label>
                    <input type="password" name="esewaPw" className="form-control" value={credentials.esewaPw} onChange={handleInputChange} placeholder="****" />
                  </div>
                  <button className="btn w-100 pay-btn esewa text-white fw-bold py-2" onClick={() => handlePayment("eSewa")} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Pay Rs. ${amount}`}
                  </button>
                </div>
              </div>

              {/* Khalti Card */}
              <div className="payment-card khalti-theme shadow-sm border-0">
                <div className="card-top p-3 text-center border-bottom">
                  <img src="/assets/khelti.png" alt="Khalti" style={{ height: "40px" }} />
                </div>
                <div className="card-body-custom p-4">
                  <div className="input-box mb-3">
                    <label className="small fw-bold">Khalti ID (Mobile Number)</label>
                    <input type="text" name="khaltiId" className="form-control" value={credentials.khaltiId} onChange={handleInputChange} placeholder="98XXXXXXXX" />
                  </div>
                  <div className="input-box mb-4">
                    <label className="small fw-bold">Khalti PIN</label>
                    <input type="password" name="khaltiPw" className="form-control" value={credentials.khaltiPw} onChange={handleInputChange} placeholder="****" />
                  </div>
                  <button className="btn w-100 pay-btn khalti text-white fw-bold py-2" onClick={() => handlePayment("Khalti")} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Pay Rs. ${amount}`}
                  </button>
                </div>
              </div>
            </div>

            {/* --- NEW: Wallet Balance Footer Card --- */}
            <div className="wallet-balance-footer mt-5 p-4 bg-white rounded shadow-sm border d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <div className="wallet-icon-circle me-3">
                        <FaWallet className="text-danger h4 m-0" />
                    </div>
                    <div>
                        <h6 className="mb-0 fw-bold">System Wallet</h6>
                        <small className="text-muted">Available balance for boosting</small>
                    </div>
                </div>
                <div className="text-end">
                    <h4 className="mb-0 fw-bold text-dark">
                        {wallet ? `Rs. ${wallet.balance}` : "Loading..."}
                    </h4>
                    <span className="badge bg-success-soft text-success small">Verified Account</span>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}