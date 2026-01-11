import React, { useState } from "react";
import "./css/Payments.css";

export default function Payments() {
  const [method, setMethod] = useState("esewa");

  return (
    <div className="payments-page">

      {/* HEADER */}
      <div className="payments-header">
        <h2>Make Payment</h2>
        <p>Select your preferred payment method</p>
      </div>

      {/* PAYMENT CARD */}
      <div className="payment-card">

        {/* LEFT - METHODS */}
        <div className="payment-methods">

          <div
            className={`method ${method === "esewa" ? "active" : ""}`}
            onClick={() => setMethod("esewa")}
          >
            <img src="/assets/esewa.png" alt="eSewa" />
            <span>eSewa</span>
          </div>

          <div
            className={`method ${method === "khalti" ? "active" : ""}`}
            onClick={() => setMethod("khalti")}
          >
            <img src="/assets/khalti.png" alt="Khalti" />
            <span>Khalti</span>
          </div>

          <div
            className={`method ${method === "stripe" ? "active" : ""}`}
            onClick={() => setMethod("stripe")}
          >
            <img src="/assets/stripe.png" alt="Stripe" />
            <span>Stripe</span>
          </div>

          <div
            className={`method ${method === "cash" ? "active" : ""}`}
            onClick={() => setMethod("cash")}
          >
            <img src="/assets/cash.png" alt="Cash" />
            <span>Cash</span>
          </div>

        </div>

        {/* RIGHT - DETAILS */}
        <div className="payment-details">

          <h3>Payment Details</h3>

          <div className="summary">
            <p>Service</p>
            <span>Home Cleaning</span>

            <p>Total Amount</p>
            <span className="amount">$150</span>
          </div>

          {/* CONDITIONAL UI */}
          {method === "cash" ? (
            <div className="cash-info">
              <p>
                Pay directly to the service provider after the service
                is completed.
              </p>
            </div>
          ) : (
            <div className="online-info">
              <label>Phone / Email</label>
              <input type="text" placeholder="Enter registered details" />

              {method === "stripe" && (
                <>
                  <label>Card Number</label>
                  <input type="text" placeholder="**** **** **** 4242" />

                  <div className="card-row">
                    <input type="text" placeholder="MM/YY" />
                    <input type="text" placeholder="CVC" />
                  </div>
                </>
              )}
            </div>
          )}

          <button className="pay-btn">
            Pay Now
          </button>

        </div>

      </div>

    </div>
  );
}
