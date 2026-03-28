import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";

export default function Authcallback() {
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/account/me", { withCredentials: true })
      .then((res) => {
        const { email, role } = res.data;

        localStorage.setItem("email", email);
        localStorage.setItem("role", role);
        localStorage.setItem("accessToken", "cookie");

        if (role === "Admin") {
          navigate("/admin-dashboard");
        } else if (role === "ServiceProvider") {
          navigate("/serviceproviderDashboard");
        } else {
          navigate("/user-dashboard");
        }
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Login Cancelled",
          text: "Google sign-in was cancelled or failed.",
          confirmButtonText: "Back to Login",
          allowOutsideClick: false,
        }).then(() => {
          navigate("/login");
        });
      });
  }, [navigate]);

  return <p className="text-center mt-5">Authenticating... Please wait.</p>;

}
