import React from "react";
import { Link } from "react-router-dom";   
import Logo from "../component/Logo";  

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

              {/* ContactUs Page Link */}
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

      {/* INTERNAL CSS */}
      <style>{`
        .footer-section {
          background-color: #cbe8ff !important;
          color: #000 !important;
        }

        .footer-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .footer-list li,
        .footer-links li {
          font-size: 15px;
          margin-bottom: 8px;
          opacity: 0.85;
          cursor: pointer;
          color: #000;
        }

        .footer-links li:hover {
          opacity: 1;
          color: #0d6efd;
        }

        /* Link styling */
        .footer-link {
          text-decoration: none;
          color: #000;
        }

        .footer-link:hover {
          color: #0d6efd;
        }

        /* Subscribe box */
        .subscribe-box {
          background: white;
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

        .subscribe-input::placeholder {
          color: #666;
        }

        .subscribe-btn {
          background: #0d6efd;
          border: none;
          padding: 10px 18px;
          color: #fff;
          font-size: 18px;
          border-radius: 0 30px 30px 0;
          cursor: pointer;
        }

        .subscribe-btn:hover {
          background: #0b5ed7;
        }

        .footer-bottom {
          border-top: 1px solid #9bb8d6;
          font-size: 14px;
          opacity: 0.8;
          color: #000;
        }
      `}</style>
    </footer>
  );
}

export default Footer;
