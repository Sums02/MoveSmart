import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./LoginSignup.css";

const ForgotPassword = () => {
  //storing email in state
  const [email, setEmail] = useState("");

  //handler for reset password request
  const handleRequest = async () => {
    //requesting passoword reset link
    const response = await fetch("http://localhost:8000/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    alert(data.message);
    console.log(data.reset_link); //For testing
  };

  return (
    <div>
      <div className="container">
        <div className="header">
          <div className="text">Forgot password?</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          <div className="input">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="submit-container">
          <button className="submit" onClick={handleRequest}>
            Send Reset Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
