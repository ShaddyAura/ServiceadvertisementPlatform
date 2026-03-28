import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Trophy, Gift as GiftIcon, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';
import { getWallet, GetGifts, ClaimVoucher } from '../../../api/AccountApi';
import './GiftProvider.css';

const GiftProvider = () => {
  const { user } = useAuth();
  const [userWallet, setUserWallet] = useState(null);
  const [allAvailableGifts, setAllAvailableGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.profileId) return;
      try {
        setLoading(true);
        const [walletRes, giftsRes] = await Promise.all([
          getWallet(user.profileId),
          GetGifts()
        ]);
        
        setUserWallet(walletRes.data);
        setAllAvailableGifts(giftsRes.data || []);
      } catch (err) {
        console.error("Failed to load gifts data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleRedeem = async (giftId) => {
    try {
      const res = await Swal.fire({
        title: 'Claim Reward?',
        text: "You are about to unlock this milestone reward. Continue?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6'
      });

      if (res.isConfirmed) {
        await ClaimVoucher({ profileId: user.profileId, giftId });
        Swal.fire('Unlocked!', 'Reward added to your Voucher Vault!', 'success');
        
        const walletRes = await getWallet(user.profileId);
        setUserWallet(walletRes.data);
      }
    } catch (err) {
      Swal.fire('Oops', err.response?.data?.message || 'Failed to unlock reward.', 'warning');
    }
  };

  const progress = userWallet?.lifetimePurchasedPoints || 0;
  const maxTarget = 25000;

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Rewards...</div>;

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
                  onClick={() => handleRedeem(gift.id)}
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