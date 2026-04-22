import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft, FaShieldAlt, FaTicketAlt, FaHistory, FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { initiateBookingPayment, getUserPaymentHistory } from "../../../api/AccountApi";
import "./Payments.css";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Selected Booking state for checkout
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Payment History State
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Discount Calculation State
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountMessage, setDiscountMessage] = useState("");

  useEffect(() => {
    // If navigating directly with checkout data
    if (location.state && location.state.bookingId && location.state.amount) {
      setSelectedBooking({
        bookingId: location.state.bookingId,
        amount: location.state.amount,
        planType: location.state.planType,
        categoryName: location.state.categoryName || "All Categories"
      });
      calculateDiscount(location.state.categoryName || "All Categories");
    } else {
      // Load history
      loadPaymentHistory();
    }
  }, [location.state]);

  const loadPaymentHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await getUserPaymentHistory();
      // Only keep the recent elements, ordered by most recent
      const sortedHistory = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPaymentHistory(sortedHistory);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not load your history ledger.", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  const calculateDiscount = (categoryName) => {
    try {
      const promos = JSON.parse(localStorage.getItem("platform_promotions")) || [];
      const now = new Date();
      now.setHours(0,0,0,0);
      
      const activePromo = promos.find(p => {
        if (!p.isActive) return false;
        if (p.category !== categoryName && p.category !== "All Categories") return false;
        
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        end.setHours(23, 59, 59, 999);
        
        return now >= start && now <= end;
      });

      if (activePromo) {
        setDiscountPercent(activePromo.discount);
        setDiscountMessage(activePromo.message || `Promo Applied on ${activePromo.category}`);
      } else {
        setDiscountPercent(0);
      }
    } catch {
      setDiscountPercent(0);
    }
  };

  // ── Helper: submit eSewa form (redirect to eSewa gateway) ──
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
    if (!selectedBooking || !selectedBooking.bookingId) {
      return Swal.fire("Error", "Missing booking information.", "error");
    }

    const originalAmount = parseFloat(selectedBooking.amount);
    const discountValue = (originalAmount * discountPercent) / 100;
    const finalAmount = originalAmount - discountValue;

    const result = await Swal.fire({
      title: "Confirm Payment",
      html: `<div style="text-align:left">
        <p><strong>Service:</strong> ${selectedBooking.planType}</p>
        <p><strong>Original Price:</strong> Rs. ${originalAmount.toLocaleString()}</p>
        ${discountPercent > 0 ? `<p class="text-success"><strong>Discount (${discountPercent}%):</strong> - Rs. ${discountValue.toLocaleString()}</p>` : ''}
        <h5 class="mt-2 text-danger">Total Payable: Rs. ${finalAmount.toLocaleString()}</h5>
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
      const res = await initiateBookingPayment({
        bookingId: selectedBooking.bookingId,
        gateway: gateway.toLowerCase(),
        finalAmount: finalAmount // Sent to backend!
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


  // 1. RENDER PAYMENT HISTORY / LEDGER (Default view when not checking out)
  if (!selectedBooking) {
    if (historyLoading) return <div className="text-center p-5">Loading payment history...</div>;
    
    return (
      <div className="payment-page-wrapper">
        <div className="container py-5">
          <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
             <FaHistory className="text-primary me-3 fs-3" />
             <h3 style={{ fontWeight: 800, margin: 0 }}>Payment History</h3>
          </div>
          
          {paymentHistory.length > 0 ? (
            <div className="bg-white rounded-3 shadow-sm border p-0 overflow-hidden">
               <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: '0.95rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-center">Type</th>
                        <th className="px-4 py-3 text-end">Amount / Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((b) => {
                        const isBooking = b.rewardType === 'BookingPayment';
                        const dateStr = new Date(b.createdAt).toLocaleString();
                        
                        let amountText = isBooking ? `Rs. ${b.amount.toLocaleString()}` : `+${b.pointsEarned} Pts`;
                        let descText = isBooking 
                            ? (b.booking?.service?.title || 'Service Booking') 
                            : (b.rewardType === 'DailyLogin' ? 'Daily Login Bonus' : 'Engagement Bonus');
                        
                        return (
                          <tr key={b.id}>
                            <td className="px-4 py-3 text-muted">{dateStr}</td>
                            <td className="px-4 py-3 fw-bold">{descText}</td>
                            <td className="px-4 py-3 text-center">
                               {isBooking ? (
                                  <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">
                                    <FaCheckCircle className="me-1"/> Online Paid
                                  </span>
                               ) : (
                                  <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 px-2 py-1 rounded-pill">
                                    <FaTicketAlt className="me-1"/> Reward
                                  </span>
                               )}
                            </td>
                            <td className={`px-4 py-3 text-end fw-bold ${isBooking ? 'text-danger' : 'text-primary'}`}>
                               {isBooking ? '-' : ''}{amountText}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               </div>
            </div>
          ) : (
            <div className="text-center p-5 bg-white rounded-3 shadow-sm border mt-3">
              <FaMinusCircle className="text-muted fs-1 mb-3 opacity-50" />
              <h4 className="text-muted fw-bold">No Payment History found.</h4>
              <p className="mb-0 text-secondary">Your completed payments and earned rewards will appear here.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. RENDER CHECKOUT GATEWAY VIEW (When passed via router state)
  const originalAmount = parseFloat(selectedBooking.amount);
  const discountValue = (originalAmount * discountPercent) / 100;
  const finalAmount = originalAmount - discountValue;

  return (
    <div className="payment-page-wrapper">
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button className="back-link btn btn-link text-dark p-0 fw-bold shadow-none" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Cancel & Go Back
          </button>
          <div className="badge bg-white text-dark p-2 border shadow-sm rounded-pill px-3">
            <FaShieldAlt className="text-success me-2" /> Secure SSL Encrypted
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-7">
            {/* Payment Summary */}
            <div className="checkout-summary-card shadow-sm border-0 rounded-4 overflow-hidden mb-4 bg-white">
               <div className="bg-light p-3 border-bottom text-center">
                 <h5 className="mb-0 fw-bold text-dark">Checkout Summary</h5>
               </div>
               <div className="p-4">
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Paying for</span>
                    <strong className="fs-5">{selectedBooking.planType}</strong>
                 </div>
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Original Amount</span>
                    <strong className="fs-5">Rs. {originalAmount.toLocaleString()}</strong>
                 </div>
                 
                 {discountPercent > 0 && (
                   <div className="d-flex justify-content-between align-items-center mb-3 py-2 px-3 bg-success-subtle rounded text-success border border-success border-opacity-25">
                      <div className="d-flex align-items-center gap-2">
                        <FaTicketAlt /> 
                        <span className="fw-bold">{discountMessage} ({discountPercent}%)</span>
                      </div>
                      <strong className="fs-5">- Rs. {discountValue.toLocaleString()}</strong>
                   </div>
                 )}

                 <hr className="my-3"/>
                 <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted fw-bold">Total Payable</span>
                    <strong className="fs-3 text-danger fw-black">Rs. {finalAmount.toLocaleString()}</strong>
                 </div>
               </div>
            </div>

            {/* Payment Gateway Selectors */}
            <h6 className="text-muted mb-3 fw-bold text-center">Choose Payment Gateway</h6>
            <div className="row g-3">
              {/* ── eSewa ── */}
              <div className="col-sm-6">
                <div className="payment-gateway-btn h-100 p-4 rounded-4 text-center cursor-pointer esewa-hover shadow-sm border bg-white position-relative"
                     onClick={() => handlePayment("eSewa")}
                     style={{ cursor: 'pointer', transition: 'all 0.2s', ...(isProcessing ? {opacity: 0.7, pointerEvents: 'none'} : {}) }}>
                  <img src="/assets/esewa.png" alt="eSewa" style={{ height: "45px", objectFit: "contain" }} className="mb-3" />
                  <div className="fw-bold text-dark">Pay with eSewa</div>
                </div>
              </div>

              {/* ── Khalti ── */}
              <div className="col-sm-6">
                <div className="payment-gateway-btn h-100 p-4 rounded-4 text-center cursor-pointer khalti-hover shadow-sm border bg-white position-relative"
                     onClick={() => handlePayment("Khalti")}
                     style={{ cursor: 'pointer', transition: 'all 0.2s', ...(isProcessing ? {opacity: 0.7, pointerEvents: 'none'} : {}) }}>
                  <img src="/assets/khalti.png" alt="Khalti" style={{ height: "45px", objectFit: "contain" }} className="mb-3" />
                  <div className="fw-bold text-dark">Pay with Khalti</div>
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="text-center mt-4">
                 <div className="spinner-border text-primary" role="status"></div>
                 <p className="mt-2 text-muted fw-bold">Initiating secure gateway...</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}