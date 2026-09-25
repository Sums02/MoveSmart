import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./components/LoginSignup/Registration";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/LoginSignup/LogIn";
import PropertyMap from "./components/PropertyMap/PropertyMap";
import AffordCalc from "./components/AffordCalc/AffordCalc";
import ForgotPassword from "./components/LoginSignup/ForgotPassword";
import ResetPassword from "./components/LoginSignup/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/propertymap" element={<PropertyMap />} />
        <Route path="/affordcalc" element={<AffordCalc />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword/" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
