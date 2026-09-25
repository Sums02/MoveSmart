import "./AffordCalc.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AffordCalc = () => {
  const navigate = useNavigate();

  //Log out handler
  const handleLogout = () => {
    //remove token and navigate to login
    localStorage.removeItem("token");
    navigate("/login"); // or any landing page
  };

  // variables
  const [income, setIncome] = useState<string>("");
  const [deposit, setDeposit] = useState<string>("");
  const [multiplier, setMultiplier] = useState<number>(4.5);
  const [firstTimeBuyer, setFirstTimeBuyer] = useState<boolean>(false);
  const [sharedOwnership, setSharedOwnership] = useState<boolean>(false);
  const [sharePercent, setSharePercent] = useState<number>(50);
  const [maxAffordablePrice, setMaxAffordablePrice] = useState<number>(0);

  const parsedIncome = parseFloat(income) || 0;
  const parsedDeposit = parseFloat(deposit) || 0;

  // form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:8000/calc/calculate_affordability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            income: parsedIncome,
            deposit: parsedDeposit,
            multiplier,
            first_time_buyer: firstTimeBuyer,
            shared_ownership: sharedOwnership,
            share_percent: sharePercent,
          }),
        }
      );

      const data = await response.json();

      console.log("Submitting this data:", {
        income,
        deposit,
        multiplier,
        first_time_buyer: firstTimeBuyer,
        shared_ownership: sharedOwnership,
        share_percent: sharePercent,
      });

      if (response.ok) {
        setMaxAffordablePrice(data.max_affordable_price);
      } else {
        // Handles validation or application-level errors
        console.error("Server responded with error:", data);
        alert(data.detail || "Failed to calculate affordability.");
      }
    } catch (err) {
      // Handles network failures or unexpected issues
      console.error("Something went wrong:", err);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title"> MoveSmart </h1>
        <p className="dashboard-subtitle">Affordability Calculator</p>
      </header>

      {/* Sidebar */}
      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <h2 className="sidebar-heading">Navigation</h2>
          <ul className="sidebar-links">
            <li>
              <button
                className="sidebar-button"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className="sidebar-button"
                onClick={() => navigate("/affordcalc")}
              >
                Affordability
              </button>
            </li>
            <li>
              <button
                className="sidebar-button"
                onClick={() => navigate("/propertymap")}
              >
                Property Map
              </button>
            </li>
          </ul>
          <button className="sidebar-button" onClick={handleLogout}>
            Logout
          </button>
        </aside>
        {/* Sidebar */}

        {/* Main */}
        <div className="dashboard-content">
          <section className="chart-section">
            <section className="affordability-section">
              <h2>Affordability Calculator</h2>
              <form onSubmit={handleSubmit} className="affordability-form">
                <label>
                  Annual Income (£):
                  <input
                    type="text"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </label>

                <label>
                  Deposit Amount (£):
                  <input
                    type="text"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                  />
                </label>

                <label>
                  Mortgage Multiplier:
                  <select
                    value={multiplier}
                    onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                  >
                    <option value="3.5">3.5x</option>
                    <option value="4.0">4.0x</option>
                    <option value="4.5">4.5x </option>
                    <option value="5.0">5.0x</option>
                    <option value="5.5">5.5x</option>
                  </select>
                </label>
                <div className="checkbox-group">
                  <span>First Time Buyer</span>
                  <input
                    type="checkbox"
                    checked={firstTimeBuyer}
                    onChange={(e) => setFirstTimeBuyer(e.target.checked)}
                  />
                </div>

                <div className="checkbox-group">
                  <span>Considering Shared Ownership</span>
                  <input
                    type="checkbox"
                    checked={sharedOwnership}
                    onChange={(e) => setSharedOwnership(e.target.checked)}
                  />
                </div>

                {sharedOwnership && (
                  <label>
                    Ownership Share (%):
                    <input
                      type="text"
                      value={sharePercent}
                      onChange={(e) => setSharePercent(Number(e.target.value))}
                    />
                  </label>
                )}

                <div className="form-action">
                  <button type="submit" className="submit">
                    Check Affordability
                  </button>
                </div>
              </form>

              <p className="affordability-result">
                Max Affordable Property Price:{" "}
                <strong>£{maxAffordablePrice.toLocaleString()}</strong>
              </p>
            </section>
          </section>
        </div>

        {/* Main */}
      </div>
    </div>
  );
};

export default AffordCalc;
