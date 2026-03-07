import React, { useState } from 'react';

import { 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Clock, 
  Ticket, 
  Gift as GiftIcon // This fixes the error
} from 'lucide-react';
import './Reedems.css';


const RedeemsGifts = ({ redeemedVouchers, onMarkAsUsed }) => {
  const [visibleCodes, setVisibleCodes] = useState({});

  const toggleVisibility = (id) => {
    setVisibleCodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

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