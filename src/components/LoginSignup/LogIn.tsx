import { useState } from "react";
import "./LoginSignup.css";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo2.png";

const Login = () => {
  //variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  //handler for user login
  const handleLogin = async () => {
    try {
      //Create form data
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      //send login request to backend
      const response = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      //Parse response
      const data = await response.json();

      //successful login
      if (response.ok) {
        localStorage.setItem("token", data.access_token); // Store token in localStorage
        navigate("/dashboard"); // Redirect to dashboard
      }
      //invalid credentials
      else if (response.status === 401) {
        setSuccess(false);
        setMessage("Incorrect email or password.");
      }
      //other errors
      else {
        setSuccess(false);
        setMessage(data.detail || "Login failed.");
      }
    } catch (error) {
      //unexpected errors
      console.error("Login error:", error);
      setSuccess(false);
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div>
      <div className="container">
        <div className="header">
          <div className="text">Log In</div>
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
            Forgot Password?{" "}
            <span onClick={() => navigate("/forgotpassword")}>
              Click Here!{" "}
            </span>
          </div>
          <div className="forgot-password">
            No account? <span onClick={() => navigate("/")}>Register </span>
          </div>
        </div>
        <div className="submit-container">
          <button className="submit" onClick={handleLogin}>
            Log In
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

export default Login;
