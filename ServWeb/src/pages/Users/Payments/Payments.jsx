import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaWallet, FaArrowLeft, FaShieldAlt, FaLock, FaUser, FaKey } from "react-icons/fa";
import "./Payments.css";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId, planType, amount } = location.state || { amount: 0, planType: "N/A" };

  const [selectedGateway, setSelectedGateway] = useState(""); // 'eSewa' or 'Khalti'
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Credentials state
  const [credentials, setCredentials] = useState({ identifier: "", pin: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!credentials.identifier || !credentials.pin) {
      return Swal.fire("Input Required", `Please enter your ${selectedGateway} ID and PIN.`, "warning");
    }

    const result = await Swal.fire({
      title: "Authorize Transaction",
      text: `Confirm payment of Rs. ${amount} for ${planType} plan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Authorize",
      confirmButtonColor: selectedGateway === "eSewa" ? "#60bb46" : "#5c2d91",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      setIsProcessing(true);

      // Simulate API verification (Checking credentials & Balance in backend later)
      setTimeout(() => {
        setIsProcessing(false);
        Swal.fire({
          title: "Payment Successful!",
          html: `<div class="text-success"><b>Transaction ID:</b> #TXN-${Math.floor(Math.random()*1000000)}</div>`,
          icon: "success",
          confirmButtonText: "Back to Dashboard",
          confirmButtonColor: "#e35059"
        }).then(() => {
          navigate("/dashboard/manage-services");
        });
      }, 2500);
    }
  };

  if (!location.state) {
    return (
      <div className="text-center p-5">
        <h4>No payment details found.</h4>
        <button className="btn btn-danger mt-3" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="payment-page-container p-4 animate-slide-down">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <button className="btn btn-link text-dark pl-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
            <FaArrowLeft className="mr-2" /> Back to Plans
          </button>

          <div className="card shadow-lg border-0 payment-card overflow-hidden">
            {/* Header */}
            <div className={`payment-header text-center py-4 ${selectedGateway.toLowerCase()}`}>
               <div className="payment-icon-circle shadow-sm">
                  <FaShieldAlt />
               </div>
               <h4 className="font-weight-bold mt-3 mb-0">Secure Payment</h4>
               <p className="small opacity-75">Service Boost Authorization</p>
            </div>

            <div className="card-body px-4">
              {/* Summary Section */}
              <div className="summary-pill d-flex justify-content-between align-items-center mb-4">
                 <div>
                    <span className="d-block x-small text-muted text-uppercase">Total Payable</span>
                    <span className="h4 font-weight-bold mb-0">Rs. {amount}</span>
                 </div>
                 <div className="text-right">
                    <span className="badge badge-danger px-3 py-2">{planType} Plan</span>
                 </div>
              </div>

              <h6 className="font-weight-bold mb-3"><FaLock className="mr-2 text-muted" /> Choose Gateway</h6>
              
              <div className="row no-gutters mb-4">
                <div className="col-6 pr-2">
                  <div 
                    className={`gateway-selector ${selectedGateway === "eSewa" ? "active-esewa" : ""}`}
                    onClick={() => { setSelectedGateway("eSewa"); setCredentials({identifier: "", pin: ""}); }}
                  >
                    <img src="https://itunestime.com/wp-content/uploads/2021/04/esewa_logo-1.png" alt="eSewa" />
                  </div>
                </div>
                <div className="col-6 pl-2">
                  <div 
                    className={`gateway-selector ${selectedGateway === "Khalti" ? "active-khalti" : ""}`}
                    onClick={() => { setSelectedGateway("Khalti"); setCredentials({identifier: "", pin: ""}); }}
                  >
                    <img src="https://khalti.com/static/img/logo1.png" alt="Khalti" />
                  </div>
                </div>
              </div>

              {/* DYNAMIC CREDENTIALS FORM */}
              {selectedGateway && (
                <div className="credentials-section animate-slide-up">
                  <div className="gateway-badge mb-3" style={{ color: selectedGateway === 'eSewa' ? '#60bb46' : '#5c2d91' }}>
                    Logging into <strong>{selectedGateway}</strong>
                  </div>
                  
                  <div className="form-group mb-3 position-relative">
                    <FaUser className="input-icon" />
                    <input 
                      type="text" 
                      className="form-control auth-input" 
                      placeholder={selectedGateway === "eSewa" ? "eSewa ID (Mobile/Email)" : "Khalti ID (Mobile Number)"}
                      name="identifier"
                      value={credentials.identifier}
                      onChange={handleInputChange}
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group mb-4 position-relative">
                    <FaKey className="input-icon" />
                    <input 
                      type="password" 
                      className="form-control auth-input" 
                      placeholder={selectedGateway === "eSewa" ? "eSewa MPIN" : "Khalti PIN"}
                      name="pin"
                      value={credentials.pin}
                      onChange={handleInputChange}
                    />
                  </div>

                  <button 
                    className={`btn btn-block py-3 font-weight-bold payment-submit-btn ${selectedGateway.toLowerCase()}-btn`}
                    disabled={isProcessing}
                    onClick={handlePayment}
                  >
                    {isProcessing ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      `Securely Pay Rs. ${amount}`
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="card-footer bg-light border-0 text-center py-3">
               <span className="text-muted x-small uppercase">
                  Your credentials are never stored. Verified by {selectedGateway || "Merchant"} API.
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}