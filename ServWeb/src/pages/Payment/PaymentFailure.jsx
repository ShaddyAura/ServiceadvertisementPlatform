import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
      <FaTimesCircle color="red" size={50} />
      <h2 style={{marginTop: '20px'}}>Payment Failed or Cancelled</h2>
      <button 
         style={{marginTop: '20px', padding: '10px 20px', background: '#333', color: 'white', borderRadius: '5px', cursor: 'pointer'}} 
         onClick={() => navigate(-1)}>
         Go Back
      </button>
    </div>
  );
}
