import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axios'; // Or use your main api instances if you prefer
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function PaymentSuccess() {
  const [status, setStatus] = useState("Verifying Payment...");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get("type"); 
    const gateway = searchParams.get("gateway") || (searchParams.has("data") ? "esewa" : "khalti");
    const pidx = searchParams.get("pidx"); // khalti
    const data = searchParams.get("data"); // esewa
    const amt = searchParams.get("amt");
    const pts = searchParams.get("pts");
    const id = searchParams.get("id");

    const verify = async () => {
      try {
        let endpoint = type === 'booking' ? `/Payment/verify-booking` : `/Payment/verify-points`;
        endpoint += `?gateway=${gateway}`;
        if (pidx) endpoint += `&pidx=${pidx}`;
        if (data) endpoint += `&data=${encodeURIComponent(data)}`;
        if (pts) endpoint += `&pts=${pts}`;
        if (amt) endpoint += `&amt=${amt}`;

        await axios.get(endpoint, { withCredentials: true });
        
        setStatus("Payment Verified Successfully!");
        setTimeout(() => {
           if (type === 'booking') {
             navigate('/users/bookings');
           } else {
             navigate('/provider/wallet'); // Adjust route if needed
           }
        }, 2000);
      } catch (err) {
        setStatus("Payment Verification Failed!");
        setTimeout(() => navigate(-1), 3000);
      }
    };
    verify();
  }, [location, navigate]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
      {status === "Verifying Payment..." ? <FaSpinner className="fa-spin" size={50} /> : <FaCheckCircle color="green" size={50} />}
      <h2 style={{marginTop: '20px'}}>{status}</h2>
    </div>
  );
}
