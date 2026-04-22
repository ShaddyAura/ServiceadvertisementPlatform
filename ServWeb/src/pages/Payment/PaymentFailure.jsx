import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

export default function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type');

  const handleGoBack = () => {
    if (type === 'points') {
      navigate('/point');
    } else if (type === 'booking') {
      navigate('/bookings');
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "50px 40px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          maxWidth: "420px",
          width: "90%",
        }}
      >
        <FaTimesCircle size={60} color="#ef4444" />
        <h3 style={{ marginTop: 20, color: "#991b1b" }}>Payment Failed</h3>
        <p style={{ color: "#6b7280", marginTop: 8 }}>
          Your payment could not be processed or was cancelled. No charges were made.
        </p>
        
        <button
          onClick={handleGoBack}
          style={{
            marginTop: 25,
            padding: "12px 30px",
            background: "#1e293b",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Go Back & Try Again
        </button>
      </div>
    </div>
  );
}
