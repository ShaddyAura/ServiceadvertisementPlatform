import React from "react";
import "./css/Bookings.css";

export default function Bookings() {
  return (
    <div className="bookings-page">

      {/* PAGE HEADER */}
      <div className="bookings-header">
        <h2>My Bookings</h2>
        <p>Manage all your service bookings here</p>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="bookings-card">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Client</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Home Cleaning</td>
              <td>Emily Smith</td>
              <td>Dec 15, 2025</td>
              <td>10:00 AM</td>
              <td>
                <span className="status confirmed">Confirmed</span>
              </td>
              <td>
                <button className="btn view">View</button>
              </td>
            </tr>

            <tr>
              <td>Plumbing Repair</td>
              <td>Alex Brown</td>
              <td>Dec 18, 2025</td>
              <td>02:30 PM</td>
              <td>
                <span className="status pending">Pending</span>
              </td>
              <td>
                <button className="btn accept">Accept</button>
                <button className="btn reject">Reject</button>
              </td>
            </tr>

            <tr>
              <td>Electrician Service</td>
              <td>Michael Lee</td>
              <td>Dec 20, 2025</td>
              <td>09:00 AM</td>
              <td>
                <span className="status completed">Completed</span>
              </td>
              <td>
                <button className="btn view">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
