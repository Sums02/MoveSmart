import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import navigate

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const token = new URLSearchParams(window.location.search).get("token");
  const navigate = useNavigate(); // <-- initialize navigate

  const handleReset = async () => {
    try {
      // Send password reset request to the backend
      const res = await fetch("http://localhost:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Notify user and redirect to login on success
        alert(data.message);
        navigate("/login");
      } else {
        // Handle expected server-side errors
        alert(data.detail || "Password reset failed.");
      }
    } catch (error) {
      // Catch unexpected network or fetch failures
      console.error("Error during password reset:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div>
      <div className="container">
        <div className="header">
          <div className="text">Reset Your Password</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          <div className="input">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="New Password"
            />
          </div>
        </div>

        <div className="submit-container">
          <button className="submit" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
