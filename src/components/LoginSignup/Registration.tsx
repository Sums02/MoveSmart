import React from "react";
import { useState } from "react";
import "./LoginSignup.css";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo2.png";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    try {
      //register a new user
      const response = await fetch("http://localhost:8000/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Parse the JSON response
      console.log("Status:", response.status);
      console.log("Data:", data);

      if (response.ok) {
        //successful
        setSuccess(true);
        setMessage("Registration complete. Please sign in");
      } else if (response.status === 422) {
        //validation error
        setSuccess(false);
        setMessage("Please enter a valid email address");
      } else if (
        response.status === 400 &&
        data.detail === "Email already registered"
      ) {
        //email already exists
        setSuccess(false);
        setMessage("This email is already in use");
      } else {
        // other errors
        setSuccess(false);
        setMessage(data.detail || "Registration failed");
      }
    } catch (error) {
      // network failure
      console.error("Network error:", error);
      setSuccess(false);
      setMessage("Unable to register. Please try again later.");
    }
  };

  return (
    <div>
      <div className="container">
        <div className="header">
          <div className="text">Registration</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          <div className="input">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="inputs">
          <div className="input">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="redirect">
          <div className="forgot-password">
            Already registered?{" "}
            <span onClick={() => navigate("/login")}>Log in </span>
          </div>
        </div>

        <div className="submit-container">
          <button className="submit" onClick={handleRegister}>
            Register
          </button>
        </div>
        {message && (
          <div className={`message-box ${success ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
