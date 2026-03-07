import React from 'react';
import { Lock, Unlock, Trophy, Gift as GiftIcon, ArrowRight } from 'lucide-react';
import './GiftProvider.css';

const GiftProvider = ({ userWallet, allAvailableGifts, onRedeem }) => {
  const progress = userWallet?.lifetimePurchasedPoints || 0;
  const maxTarget = 25000;

  return (
    <div className="rewards-page">
      {/* Upper Card: Progress Tracker */}
      <div className="status-card">
        <div className="status-header">
          <div className="points-info">
            <div className="trophy-bg"><Trophy /></div>
            <div>
              <p>Lifetime Progress</p>
              <h2>{progress.toLocaleString()} <span>/ {maxTarget.toLocaleString()} Pts</span></h2>
            </div>
          </div>
          <div className="level-badge">Elite Track</div>
        </div>

        <div className="progress-container">
          <div className="progress-rail">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${Math.min((progress / maxTarget) * 100, 100)}%` }}
            >
              <div className="shimmer" />
            </div>
          </div>
          <div className="milestone-markers">
            <span>0</span>
            <span>5k</span>
            <span>10k</span>
            <span>15k</span>
            <span>20k</span>
            <span>25k</span>
          </div>
        </div>
      </div>

      {/* Lower Section: Gift Unlocking Grid */}
      <div className="gift-grid-header">
        <h3><GiftIcon size={20} /> Milestone Rewards</h3>
        <p>Unlock these gifts by reaching the lifetime points target.</p>
      </div>

      <div className="gifts-grid">
        {allAvailableGifts?.map((gift) => {
          const isEligible = progress >= gift.pointsRequired;
          
          return (
            <div key={gift.id} className={`gift-unlock-card ${isEligible ? 'eligible' : 'locked'}`}>
              <div className="gift-img-container">
                <img src={gift.imageUrl || '/api/placeholder/150/150'} alt={gift.title} />
                {!isEligible && <div className="lock-mask"><Lock size={30} /></div>}
              </div>
              
              <div className="gift-details">
                <span className="points-tag">{gift.pointsRequired} Pts</span>
                <h4>{gift.title}</h4>
                <p>{gift.description}</p>
                
                <button 
                  className="unlock-btn"
                  disabled={!isEligible}
                  onClick={() => onRedeem(gift.id)}
                >
                  {isEligible ? (
                    <>Unlock Gift <ArrowRight size={16} /></>
                  ) : (
                    <><Lock size={14} /> Locked</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GiftProvider;