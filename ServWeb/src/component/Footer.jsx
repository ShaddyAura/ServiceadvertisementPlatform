import React from "react";
import { Link } from "react-router-dom";   


function Footer() {
  return (
    <footer className="footer-section py-5">
      <div className="container">

        <div className="row">

          {/* ABOUT SECTION */}
          <div className="col-md-4 mb-4">
            <h5 className="footer-title">About</h5>
            <ul className="list-unstyled footer-list">
              <li>Kalanki, Kathmandu, Nepal</li>
              <li className="mt-2">📞 +1 234 567 890</li>
              <li className="mt-1">✉ info@servAdd.com</li>
            </ul>

            {/* EMAIL SUBSCRIBE */}
            <div className="subscribe-box d-flex mt-3">
              <input
                type="email"
                className="form-control subscribe-input"
                placeholder="Enter email address"
              />
              <button className="subscribe-btn">➤</button>
            </div>
          </div>

          {/* INFORMATION */}
          <div className="col-md-4 mb-4">
            <h5 className="footer-title">Information</h5>
            <ul className="list-unstyled footer-links">
              <li>About</li>
              <li>Products</li>
              <li>Blog</li>
              <li>Help & Support</li>
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div className="col-md-4 mb-4">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/contact" className="footer-link">Contact Us</Link>
              </li>
              <li>Terms & Policies</li>
              <li>Service Guide</li>
              <li>FAQs</li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom text-center mt-4 pt-3">
          © 2025 ServiceHub — All rights reserved.
        </div>
      </div>

      {/* UPDATED INTERNAL CSS */}
      <style>{`
        .footer-section {
          background-color: #f4f4f4 !important; 
          color: #000000 !important;
          border-top: 1px solid #eee;
        }

        .footer-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #000;
        }

        .footer-list li,
        .footer-links li {
          font-size: 15px;
          margin-bottom: 8px;
          color: #333;
          transition: 0.3s;
          cursor: pointer;
        }

        /* Hover Red Logic */
        .footer-links li:hover, 
        .footer-link:hover {
          color: rgb(244, 6, 6) !important;
          opacity: 1;
        }

        .footer-link {
          text-decoration: none;
          color: #333;
          transition: 0.3s;
        }

        /* Subscribe box */
        .subscribe-box {
          background: #f8f9fa;
          border-radius: 30px;
          overflow: hidden;
          border: 1px solid #ddd;
        }

        .subscribe-input {
          border: none;
          background: transparent;
          color: #000;
          padding-left: 15px;
        }

        .subscribe-btn {
          background: rgb(244, 6, 6); /* Red button to match theme */
          border: none;
          padding: 10px 22px;
          color: #fff;
          font-size: 18px;
          border-radius: 0 30px 30px 0;
          cursor: pointer;
          transition: 0.3s;
        }

        .subscribe-btn:hover {
          background: #000; /* Turns black on hover */
        }

        .footer-bottom {
          border-top: 1px solid #eee;
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </footer>
  );
}

export default Footer;