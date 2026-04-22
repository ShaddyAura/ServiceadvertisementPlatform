import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, Container, Typography, Button, Grid, Card, CardContent, CardMedia,
  TextField, MenuItem, Stack, Paper, IconButton, Dialog, DialogContent, 
  Avatar, Rating, useTheme, Zoom, Fade, Badge, Tooltip, Divider 
} from "@mui/material";
import { 
  Search as SearchIcon, 
  ArrowForward as ArrowIcon,
  Close as CloseIcon,
  TrendingUp as TrendingIcon,
  Verified as VerifiedIcon,
  EmojiEvents as AwardIcon,
  Star as StarIcon,
  Campaign as PromoIcon
} from "@mui/icons-material";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import "./Home.css";

export default function Home() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [activePromo, setActivePromo] = useState(null);

  const provinces = [
    "Koshi Province", "Madhesh Province", "Bagmati Province", 
    "Gandaki Province", "Lumbini Province", "Karnali Province", "Sudurpashchim Province"
  ];

  useEffect(() => {
    try {
      let promos = JSON.parse(localStorage.getItem("platform_promotions")) || [];
      const now = new Date();
      
      let currentPromo = promos.find(p => {
        if (!p.isActive) return false;
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        end.setHours(23, 59, 59, 999);
        return start <= now && end >= now;
      });

      // FALLBACK: If no promotion is found in localStorage, show a default one for demo
      if (!currentPromo) {
        currentPromo = {
          id: "default-welcome-promo",
          discount: 25,
          category: "All Categories",
          endDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
          message: "Welcome Sale! Enjoy special discounts on all household services this week.",
          isActive: true
        };
      }

      if (currentPromo) {
        setTimeout(() => {
          setActivePromo(currentPromo);
          setShowPromo(true);
        }, 500);
      }
    } catch (err) { console.error(err); }
  }, []);

  return (
    <div className="home-page-restore">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="hero-section-new">
        <Container maxWidth="lg" sx={{ textAlign: 'center', py: { xs: 10, md: 15 } }}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 1.5, 
              px: 3, 
              py: 1, 
              borderRadius: 10, 
              bgcolor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 700,
              mb: 4
            }}>
              <span>🇳🇵 Now Serving All Over Nepal</span>
            </Box>
            <Typography variant="h1" sx={{ 
              color: 'white', 
              fontSize: { xs: '2.5rem', md: '5rem' }, 
              fontWeight: 900, 
              lineHeight: 1.1,
              mb: 3
            }}>
              Find the Best <br />
              <span style={{ color: '#ef4444' }}>Home Services</span> in Nepal
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '1.2rem', 
              maxWidth: 700, 
              mx: 'auto',
              mb: 8
            }}>
              Verified professionals for your everyday needs across all seven provinces. 
              From the Himalayas to the Terai, we've got you covered.
            </Typography>

            {/* UNIFIED SEARCH BAR */}
            <div className="search-bar-unified">
               <Stack direction="row" alignItems="center" sx={{ flex: 1, px: 2 }}>
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', mr: 1.5 }} />
                  <TextField 
                    fullWidth 
                    variant="standard" 
                    placeholder="Search for plumbing, cleaning..." 
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    InputProps={{ 
                      disableUnderline: true, 
                      sx: { color: 'white', fontSize: '0.95rem' } 
                    }}
                  />
               </Stack>
               <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 1, display: { xs: 'none', md: 'block' } }} />
               <Box sx={{ display: 'flex', alignItems: 'center', px: 2, minWidth: { md: 220 } }}>
                  <TrendingIcon sx={{ color: '#ef4444', mr: 1.5 }} />
                  <TextField
                    select
                    fullWidth
                    variant="standard"
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    SelectProps={{ displayEmpty: true }}
                    InputProps={{ disableUnderline: true, sx: { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' } }}
                  >
                    <MenuItem value="" disabled>Select Province</MenuItem>
                    {provinces.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </TextField>
               </Box>
               <Button 
                variant="contained" 
                onClick={() => navigate('/login')}
                sx={{ 
                  bgcolor: '#ef4444', 
                  '&:hover': { bgcolor: '#dc2626' },
                  px: 5, 
                  py: 1.8, 
                  borderRadius: 3, 
                  fontWeight: 900,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)'
               }}>
                 Search
               </Button>
            </div>
          </Box>

          {/* FLOATING ILLUSTRATION */}
          <Box className="floating-svg" sx={{ mt: 10 }}>
             <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" fill="#ef4444" fillOpacity="0.1"/>
                <path d="M140 100L80 140V60L140 100Z" fill="#ef4444"/>
                <rect x="50" y="50" width="20" height="20" rx="4" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 10px #fbbf24)' }} />
                <rect x="150" y="40" width="15" height="15" rx="3" fill="#6366f1" />
             </svg>
          </Box>
        </Container>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="stats-section-grid">
         <Container maxWidth="lg">
            <Grid container spacing={15} justifyContent="center">
               {[
                 { label: "Districts Covered", val: "77", sub: "Nationwide presence" },
                 { label: "Happy Nepalese Homes", val: "25k+", sub: "Trusted by thousands" },
                 { label: "Local Services", val: "50+", sub: "Specialized solutions" }
               ].map((stat, i) => (
                 <Grid item xs={12} md={4} key={i} className="stats-item-box">
                    <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', mb: 3 }}>{stat.val}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2 }}>{stat.label}</Typography>
                 </Grid>
               ))}
            </Grid>
         </Container>
      </section>

      {/* --- SERVICES GRID --- */}
      <Container sx={{ py: 15 }}>
         <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-end" sx={{ mb: 10, textAlign: { xs: 'center', md: 'left' } }}>
            <Box>
               <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: 'white !important' }}>Popular Services in Nepal</Typography>
               <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>Hand-picked local professionals for your everyday needs.</Typography>
            </Box>
            <Button 
              onClick={() => navigate('/login')}
              endIcon={<ArrowIcon />} 
              sx={{ color: '#ef4444', fontWeight: 700, mt: { xs: 3, md: 0 } }}
            >
              View All Services
            </Button>
         </Stack>

         <Grid container spacing={4}>
            {[
               { title: "Plumbing", desc: "Tank cleaning, pipe leakage repair, and bathroom fitting installation.", icon: <VerifiedIcon /> },
               { title: "Electrician", desc: "Inverter setup, wiring repairs, and solar panel maintenance.", icon: <TrendingIcon /> },
               { title: "House Cleaning", desc: "Kitchen deep cleaning, carpet washing, and full house sanitization.", icon: <AwardIcon /> },
               { title: "Painting", desc: "Wall putty, emulsion painting, and exterior weather coating.", icon: <SearchIcon /> },
               { title: "AC & Fridge", desc: "Air conditioner servicing and refrigerator gas refilling expert repair.", icon: <TrendingIcon /> },
               { title: "Renovation", desc: "Structural repairs, tiling work, and modern kitchen remodeling.", icon: <AwardIcon /> }
            ].map((s, i) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                 <Box className="glass-card" sx={{ p: 5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box className="service-icon-wrap">
                       {s.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'white' }}>{s.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 5, flex: 1 }}>{s.desc}</Typography>
                    <Button variant="outlined" fullWidth sx={{ 
                       borderRadius: 3, 
                       py: 1.5, 
                       color: 'white', 
                       borderColor: 'rgba(255,255,255,0.1)',
                       '&:hover': { bgcolor: '#ef4444', borderColor: '#ef4444', color: 'white' },
                       fontWeight: 800
                    }}>
                      Book Now
                    </Button>
                 </Box>
              </Grid>
            ))}
         </Grid>
      </Container>


      {/* --- PROMOTION POPUP (COMPACT WIDE CARD DESIGN) --- */}
      <Dialog 
        open={showPromo} 
        onClose={() => setShowPromo(false)}
        TransitionComponent={Zoom}
        maxWidth={false} // Disable standard MUI widths for custom sizing
        fullWidth
        PaperProps={{
          sx: {
            width: '560px', // Slightly increased width
            borderRadius: 5,
            overflow: 'hidden',
            border: '2px solid #ef4444',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
            bgcolor: '#0a0a0c',
            color: 'white',
            position: 'relative'
          }
        }}
      >
        {activePromo && (
          <DialogContent sx={{ p: 0 }}>
             {/* Scrolling Offer Ticker */}
             <Box sx={{ 
               bgcolor: '#ef4444', 
               py: 0.6, 
               display: 'flex', 
               overflow: 'hidden',
               whiteSpace: 'nowrap'
             }}>
               <div className="promo-ticker">
                 <span>LIMITED OFFER • DISCOUNT OFFER • HURRY UP • SPECIAL OFFER • </span>
                 <span>LIMITED OFFER • DISCOUNT OFFER • HURRY UP • SPECIAL OFFER • </span>
               </div>
             </Box>

             <IconButton 
               onClick={() => setShowPromo(false)}
               sx={{ position: 'absolute', right: 10, top: 35, color: 'white', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
             >
               <CloseIcon />
             </IconButton>
             
             <Box sx={{ p: 0, textAlign: 'center' }}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', 
                  py: 3, // Reduced vertical padding
                  px: 2,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4 // Horizontal layout for icons vs text
                }}>
                   <Box sx={{ 
                     width: 70, 
                     height: 70, 
                     borderRadius: '50%', 
                     bgcolor: 'rgba(255,255,255,0.1)', 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center', 
                     border: '2px dashed white',
                     animation: 'spin 10s linear infinite'
                   }}>
                      <PromoIcon sx={{ fontSize: 35 }} />
                   </Box>
                   <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="h2" sx={{ fontWeight: 900, fontSize: '3.2rem !important', mb: -0.5, lineHeight: 1 }}>{activePromo.discount}% OFF</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8 }}>Limited Time Offer</Typography>
                   </Box>
                </Box>
                
                <Box sx={{ p: 3 }}> {/* Reduced padding */}
                   <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', mb: 1 }}>
                      <span style={{ color: '#ef4444' }}>Special Save!</span> {activePromo.message}
                   </Typography>
                   
                   <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                      Valid on: <strong style={{ color: 'white' }}>{activePromo.category}</strong> • 
                      Expires: <strong style={{ color: 'white' }}>{new Date(activePromo.endDate).toLocaleDateString()}</strong>
                   </Typography>

                   <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    onClick={() => setShowPromo(false)}
                    sx={{ 
                      bgcolor: '#ef4444', 
                      '&:hover': { bgcolor: '#dc2626', transform: 'scale(1.01)' }, 
                      borderRadius: 3, 
                      py: 1.8, 
                      fontWeight: 900, 
                      fontSize: '1rem',
                      boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)',
                      transition: '0.2s'
                    }}
                   >
                     Claim Discount Now
                   </Button>
                </Box>
             </Box>
          </DialogContent>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}
