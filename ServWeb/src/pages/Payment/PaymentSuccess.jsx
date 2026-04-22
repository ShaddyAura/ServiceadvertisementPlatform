import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";

export default function PaymentSuccess() {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const location = useLocation();
  const navigate = useNavigate();

  const hasFired = React.useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Fix malformed eSewa query string. eSewa maliciously appends '?data=' instead of '&data='
    let rawSearch = location.search;
    if (rawSearch.includes("?data=")) {
      rawSearch = rawSearch.replace("?data=", "&data=");
      
      // Also fix any variables that got corrupted (e.g., amt=950?data=... becomes amt=950)
      const corruptedParams = rawSearch.split("&");
      const cleanedParams = corruptedParams.map(p => p.includes("?") && !p.startsWith("?") ? p.split("?")[0] : p);
      rawSearch = cleanedParams.join("&");
    }

    const searchParams = new URLSearchParams(rawSearch);
    const type = searchParams.get("type"); // "booking" or "points"
    const gateway = searchParams.get("gateway") || (searchParams.has("data") ? "esewa" : "khalti");
    const pidx = searchParams.get("pidx"); // Khalti
    const data = searchParams.get("data"); // eSewa base64 response
    const amt = searchParams.get("amt");
    const pts = searchParams.get("pts");
    const id = searchParams.get("id"); // booking ID
    const statusParam = searchParams.get("status");

    if (gateway === "khalti" && statusParam && (statusParam.toLowerCase().includes("cancel") || statusParam.toLowerCase().includes("expired"))) {
      navigate(`/payment/failure?type=${type}`, { replace: true });
      return;
    }

    const verify = async () => {
      try {
        let endpoint = type === "booking" ? "/Payment/verify-booking" : "/Payment/verify-points";
        endpoint += `?gateway=${gateway}`;
        if (pidx) endpoint += `&pidx=${pidx}`;
        if (data) endpoint += `&data=${encodeURIComponent(data)}`;
        if (pts) endpoint += `&pts=${pts}`;
        if (amt) endpoint += `&amt=${amt}`;
        if (id) endpoint += `&id=${id}`;
        if (statusParam) endpoint += `&status=${statusParam}`;

        await api.get(endpoint, { withCredentials: true });

        setStatus("success");
        setMessage(
          type === "booking"
            ? "Booking payment verified successfully!"
            : `${pts || ""} Points purchased successfully!`
        );

        setTimeout(() => {
          if (type === "booking") {
            navigate("/bookings");
          } else {
            navigate("/point"); // Provider points page
          }
        }, 2500);
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("failed");
        const srvMessage = err.response?.data?.message;
        const srvError = err.response?.data?.error;
        let finalMessage = "Payment verification failed. Please contact support.";
        if (srvMessage && srvError) finalMessage = `${srvMessage} | ${srvError}`;
        else if (srvMessage) finalMessage = srvMessage;

        setMessage(finalMessage);
      }
    };

    verify();
  }, [location, navigate]);

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
        {status === "verifying" && (
          <>
            <FaSpinner className="fa-spin" size={50} color="#6366f1" />
            <h3 style={{ marginTop: 20, color: "#334155" }}>Verifying Payment</h3>
            <p style={{ color: "#94a3b8", marginTop: 8 }}>Please wait while we confirm your transaction...</p>
          </>
        )}

        {status === "success" && (
          <>
            <FaCheckCircle size={60} color="#10b981" />
            <h3 style={{ marginTop: 20, color: "#065f46" }}>Payment Successful!</h3>
            <p style={{ color: "#6b7280", marginTop: 8 }}>{message}</p>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 16 }}>Redirecting you back...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <FaTimesCircle size={60} color="#ef4444" />
            <h3 style={{ marginTop: 20, color: "#991b1b" }}>Verification Failed</h3>
            <p style={{ color: "#6b7280", marginTop: 8 }}>{message}</p>
            <button
              onClick={() => {
                const searchParams = new URLSearchParams(location.search);
                const type = searchParams.get("type");
                if (type === "points") {
                  navigate("/point");
                } else if (type === "booking") {
                  navigate("/bookings");
                } else {
                  navigate(-1);
                }
              }}
              style={{
                marginTop: 20,
                padding: "12px 30px",
                background: "#1e293b",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
