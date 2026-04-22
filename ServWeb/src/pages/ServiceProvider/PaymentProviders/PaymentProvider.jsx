import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { initiatePointsPayment } from "../../../api/AccountApi";
import { useAuth } from "../../../context/AuthContext";
import "./PaymentProvider.css";

export default function PaymentProvider() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { amount, points, planType } = location.state || { amount: 0, points: 0, planType: "N/A" };
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Helper: submit eSewa form (redirect to eSewa test gateway) ──
  const submitEsewaForm = (esewaData, paymentUrl) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    const fieldMapping = {
      amount: "amount",
      taxAmount: "tax_amount",
      totalAmount: "total_amount",
      transactionUuid: "transaction_uuid",
      productCode: "product_code",
      productServiceCharge: "product_service_charge",
      productDeliveryCharge: "product_delivery_charge",
      successUrl: "success_url",
      failureUrl: "failure_url",
      signedFieldNames: "signed_field_names",
      signature: "signature",
    };

    for (const key in esewaData) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = fieldMapping[key] || key;
      input.value = esewaData[key];
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  // ── Pay via gateway ──
  const handlePayment = async (gateway) => {
    const result = await Swal.fire({
      title: "Confirm Payment",
      html: `<div style="text-align:left">
        <p><strong>Plan:</strong> ${planType}</p>
        <p><strong>Points:</strong> ${Number(points).toLocaleString()} Pts</p>
        <p><strong>Amount:</strong> Rs. ${Number(amount).toLocaleString()}</p>
        <p><strong>Gateway:</strong> ${gateway}</p>
      </div>`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: `Pay via ${gateway}`,
      confirmButtonColor: gateway === "eSewa" ? "#60bb46" : "#5c2d91",
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      const res = await initiatePointsPayment({
        gateway: gateway.toLowerCase(),
        pointsToBuy: parseInt(points),
        amount: parseFloat(amount),
      });

      if (gateway === "eSewa") {
        const { esewaData, paymentUrl } = res.data;
        submitEsewaForm(esewaData, paymentUrl);
      } else if (gateway === "Khalti") {
        window.location.href = res.data.paymentUrl;
      }
    } catch (error) {
      Swal.fire("Payment Failed", error.response?.data?.message || "Could not initiate payment.", "error");
      setIsProcessing(false);
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
        <button className="back-link btn btn-link text-dark p-0 fw-bold shadow-none" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" /> Cancel & Go Back
        </button>

        <div className="row mt-4">
          {/* Left: Order Summary */}
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
                <strong>{Number(points).toLocaleString()} Pts</strong>
              </div>
              <div className="summary-total">
                <span>Total Amount:</span>
                <span className="price">Rs. {Number(amount).toLocaleString()}</span>
              </div>
              <div className="security-tag">
                <FaShieldAlt /> Secure SSL Encrypted Transaction
              </div>
            </div>
          </div>

          {/* Right: Payment Gateway Buttons */}
          <div className="col-lg-8">
            <div className="payment-grid">
              {/* ── eSewa ── */}
              <div className="payment-card esewa-theme">
                <div className="card-top">
                  <img src="/assets/esewa.png" alt="eSewa" />
                </div>
                <div className="card-body-custom" style={{ textAlign: "center" }}>
                  <p style={{ color: "#666", marginBottom: 8 }}>
                    You will be redirected to eSewa's secure payment page
                  </p>
                  <button
                    className="pay-btn esewa"
                    onClick={() => handlePayment("eSewa")}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Redirecting..." : `Pay Rs. ${Number(amount).toLocaleString()} via eSewa`}
                  </button>
                </div>
              </div>

              {/* ── Khalti ── */}
              <div className="payment-card khalti-theme">
                <div className="card-top">
                  <img src="/assets/khalti.png" alt="Khalti" />
                </div>
                <div className="card-body-custom" style={{ textAlign: "center" }}>
                  <p style={{ color: "#666", marginBottom: 8 }}>
                    You will be redirected to Khalti's secure payment page
                  </p>
                  <button
                    className="pay-btn khalti"
                    onClick={() => handlePayment("Khalti")}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Redirecting..." : `Pay Rs. ${Number(amount).toLocaleString()} via Khalti`}
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