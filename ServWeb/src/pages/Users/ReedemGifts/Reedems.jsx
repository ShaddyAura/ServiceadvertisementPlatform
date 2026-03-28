import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, Clock, Ticket, Gift as GiftIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';
import { GetMyVouchers } from '../../../api/AccountApi';
import api from '../../../api/axios'; // Or wherever your custom action lives if needed
import './Reedems.css';

const RedeemsGifts = () => {
  const { user } = useAuth();
  const [redeemedVouchers, setRedeemedVouchers] = useState([]);
  const [visibleCodes, setVisibleCodes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVouchers();
  }, [user]);

  const fetchVouchers = async () => {
    if (!user?.profileId) return;
    try {
      setLoading(true);
      const res = await GetMyVouchers(user.profileId);
      setRedeemedVouchers(res.data || []);
    } catch (err) {
      console.error("Failed to load vouchers", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (id) => {
    setVisibleCodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMarkAsUsed = async (voucherId) => {
    // If the merchant can mark used, implement API here
    // Example placeholder using Swal for now:
    const confirm = await Swal.fire({
      title: 'Mark as Used?',
      text: 'The merchant has seen this code?',
      icon: 'question',
      showCancelButton: true
    });

    if (confirm.isConfirmed) {
      try {
        // Assume an endpoint exists: PUT /api/ReedemGifts/markused/{id}
        // await api.put(`/ReedemGifts/markused/${voucherId}`);
        Swal.fire('Success', 'Voucher marked as used.', 'success');
        fetchVouchers();
      } catch {
        Swal.fire('Info', 'Mock: Voucher marked used (backend endpoint required)', 'info');
      }
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Vault...</div>;

  return (
    <div className="redeems-page">
      <div className="vault-header">
        <Ticket size={28} className="text-primary" />
        <div>
          <h2>My Voucher Vault</h2>
          <p>Present these codes to the merchant to claim your rewards.</p>
        </div>
      </div>

      <div className="voucher-grid">
        {redeemedVouchers?.length > 0 ? (
          redeemedVouchers.map((voucher) => (
            <div key={voucher.id} className={`voucher-card ${voucher.isUsed ? 'used' : 'active'}`}>
              <div className="voucher-status-strip">
                {voucher.isUsed ? <CheckCircle size={16} /> : <Clock size={16} />}
                {voucher.isUsed ? 'REDEEMED' : 'AVAILABLE'}
              </div>

              <div className="voucher-content">
                <small className="gift-type">{voucher.gift?.type}</small>
                <h3>{voucher.gift?.title}</h3>
                
                <div className="code-box">
                  <span className="label">Merchant Code:</span>
                  <div className="code-wrapper">
                    <code className={visibleCodes[voucher.id] ? 'visible' : 'blurred'}>
                      {visibleCodes[voucher.id] ? voucher.voucherCode : '••••••••••••'}
                    </code>
                    <button className="eye-toggle" onClick={() => toggleVisibility(voucher.id)}>
                      {visibleCodes[voucher.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="voucher-footer">
                  <span>Claimed: {new Date(voucher.redeemedAt).toLocaleDateString()}</span>
                  {!voucher.isUsed && (
                    <button 
                      className="merchant-action-btn"
                      onClick={() => onMarkAsUsed(voucher.id)}
                    >
                      Merchant: Mark Used
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <GiftIcon size={48} />
            <p>You haven't unlocked any gifts yet. Keep earning points!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemsGifts;