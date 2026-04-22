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
      const promos = JSON.parse(localStorage.getItem("platform_promotions")) || [];
      const now = new Date();
      const currentPromo = promos.find(p => 
        p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now
      );
      if (currentPromo) {
        setTimeout(() => {
          setActivePromo(currentPromo);
          setShowPromo(true);
        }, 1500);
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


      {/* --- PROMOTION POPUP (DIALOG) --- */}
      <Dialog 
        open={showPromo} 
        onClose={() => setShowPromo(false)}
        TransitionComponent={Zoom}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 6,
            overflow: 'hidden',
            border: '2px solid #ef4444',
            boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
            bgcolor: '#0a0a0c',
            color: 'white'
          }
        }}
      >
        {activePromo && (
          <DialogContent sx={{ p: 0, position: 'relative' }}>
             <IconButton 
               onClick={() => setShowPromo(false)}
               sx={{ position: 'absolute', right: 15, top: 15, color: 'white', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
             >
               <CloseIcon />
             </IconButton>
             
             <Grid container>
                <Grid item xs={12} md={5} sx={{ bgcolor: '#ef4444', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4, color: 'white', textAlign: 'center' }}>
                   <PromoIcon sx={{ fontSize: 60, mb: 1, animation: 'tada 2s infinite' }} />
                   <Typography variant="h3" sx={{ fontWeight: 900 }}>{activePromo.discount}%</Typography>
                   <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>OFF</Typography>
                </Grid>
                <Grid item xs={12} md={7} sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: 'white' }}>Limited Time Offer!</Typography>
                   <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                      {activePromo.message} Valid on all <strong>{activePromo.category}</strong>.
                   </Typography>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', p: 1.5, borderRadius: 3, border: '1px dashed #ef4444' }}>
                      <TrendingIcon sx={{ color: '#ef4444' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ef4444' }}>
                        Ends {new Date(activePromo.endDate).toLocaleDateString()}
                      </Typography>
                   </Box>
                   <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    onClick={() => setShowPromo(false)}
                    sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, borderRadius: 3, py: 1.5, fontWeight: 900, boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)' }}
                   >
                     Claim Discount Now
                   </Button>
                </Grid>
             </Grid>
          </DialogContent>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}
