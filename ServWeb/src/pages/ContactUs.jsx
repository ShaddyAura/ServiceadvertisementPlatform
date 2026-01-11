import React from "react";

export default function ContactUs() {
  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Contact Us</h1>
      
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Your Name"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Your Email"
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="4"
                placeholder="Your Message"
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
