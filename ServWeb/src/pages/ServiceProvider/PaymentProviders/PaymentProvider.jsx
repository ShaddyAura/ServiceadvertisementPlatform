import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft, FaLock, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { purchasePoints } from "../../../api/AccountApi"; 
import { useAuth } from "../../../context/AuthContext";
import "./PaymentProvider.css";

export default function PaymentProvider() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Data passed from Points.jsx
  const { amount, points, planType } = location.state || { amount: 0, points: 0, planType: "N/A" };

  const [isProcessing, setIsProcessing] = useState(false);
  const [credentials, setCredentials] = useState({ esewaId: "", esewaPw: "", khaltiId: "", khaltiPw: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow digits
    if (value !== "" && !/^\d+$/.test(value)) return;

    // Enforce max length
    if ((name === "esewaId" || name === "khaltiId") && value.length > 10) return;
    if ((name === "esewaPw" || name === "khaltiPw") && value.length > 4) return;

    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (gateway) => {
    const isEsewa = gateway === "eSewa";
    const id = isEsewa ? credentials.esewaId : credentials.khaltiId;
    const pw = isEsewa ? credentials.esewaPw : credentials.khaltiPw;

    if (!id || !pw) {
      return Swal.fire("Required", `Please enter your ${gateway} credentials.`, "warning");
    }

    if (!/^\d{10}$/.test(id)) {
      return Swal.fire("Invalid ID", "Mobile number must be exactly 10 digits.", "warning");
    }

    if (!/^\d{4}$/.test(pw)) {
      return Swal.fire("Invalid PIN", "Transaction PIN must be exactly 4 digits.", "warning");
    }

    const result = await Swal.fire({
      title: "Confirm Payment",
      text: `Pay Rs. ${amount} for ${points} Points via ${gateway}?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Pay Now",
      confirmButtonColor: isEsewa ? "#60bb46" : "#5c2d91",
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      try {
        const { initiatePointsPayment } = await import('../../../api/AccountApi');
        const res = await initiatePointsPayment({ gateway: gateway.toLowerCase(), pointsToBuy: parseInt(points), amount: parseFloat(amount) });
        
        if (gateway === 'eSewa') {
           const { esewaData, paymentUrl } = res.data;
           const form = document.createElement('form');
           form.method = 'POST';
           form.action = paymentUrl;
           
           const fieldMapping = {
               Amount: 'amount', TaxAmount: 'tax_amount', TotalAmount: 'total_amount',
               TransactionUuid: 'transaction_uuid', ProductCode: 'product_code',
               ProductServiceCharge: 'product_service_charge', ProductDeliveryCharge: 'product_delivery_charge',
               SuccessUrl: 'success_url', FailureUrl: 'failure_url',
               SignedFieldNames: 'signed_field_names', Signature: 'signature'
           };
           for (const key in esewaData) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = fieldMapping[key] || key;
              input.value = esewaData[key];
              form.appendChild(input);
           }
           document.body.appendChild(form);
           form.submit();
        } else if (gateway === 'Khalti') {
           window.location.href = res.data.paymentUrl;
        }
      } catch (error) {
        Swal.fire("Payment Failed", error.response?.data?.message || "Transaction declined.", "error");
        setIsProcessing(false);
      }
    }
  };

  if (!location.state) {
    return (
      <div className="text-center p-5">
        <h4>No transaction details found.</h4>
        <button className="btn btn-danger" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="payment-page-wrapper">
      <div className="container py-5">
        <button className="back-link" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Shop
        </button>

        <div className="row mt-4">
          {/* Left Side: Summary */}
          <div className="col-lg-4 mb-4">
            <div className="order-summary-card">
              <h4>Order Summary</h4>
              <hr />
              <div className="summary-item">
                <span>Plan:</span>
                <strong>{planType}</strong>
              </div>
              <div className="summary-item">
                <span>Points:</span>
                <strong>{points.toLocaleString()} Pts</strong>
              </div>
              <div className="summary-total">
                <span>Total Amount:</span>
                <span className="price">Rs. {amount.toLocaleString()}</span>
              </div>
              <div className="security-tag">
                <FaShieldAlt /> Secure SSL Encrypted Transaction
              </div>
            </div>
          </div>

          {/* Right Side: Payment Methods */}
          <div className="col-lg-8">
            <div className="payment-grid">
              {/* eSewa Card */}
              <div className="payment-card esewa-theme">
                <div className="card-top">
                  <img src="\assets\esewa.png" alt="eSewa" />
                </div>
                <div className="card-body-custom">
                  <div className="input-box">
                    <label>eSewa ID</label>
                    <input type="text" name="esewaId" value={credentials.esewaId} onChange={handleInputChange} placeholder="98XXXXXXXX" />
                  </div>
                  <div className="input-box">
                    <label>MPIN / Password</label>
                    <input type="password" name="esewaPw" value={credentials.esewaPw} onChange={handleInputChange} placeholder="****" />
                  </div>
                  <button className="pay-btn esewa" onClick={() => handlePayment("eSewa")} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Pay Rs. ${amount}`}
                  </button>
                </div>
              </div>

              {/* Khalti Card */}
              <div className="payment-card khalti-theme">
                <div className="card-top">
                  <img src="\assets\khelti.png" alt="Khalti" />
                </div>
                <div className="card-body-custom">
                  <div className="input-box">
                    <label>Khalti ID</label>
                    <input type="text" name="khaltiId" value={credentials.khaltiId} onChange={handleInputChange} placeholder="98XXXXXXXX" />
                  </div>
                  <div className="input-box">
                    <label>Khalti PIN</label>
                    <input type="password" name="khaltiPw" value={credentials.khaltiPw} onChange={handleInputChange} placeholder="****" />
                  </div>
                  <button className="pay-btn khalti" onClick={() => handlePayment("Khalti")} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Pay Rs. ${amount}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}