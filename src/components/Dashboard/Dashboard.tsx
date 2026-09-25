import "./Dashboard.css";
import LineChart from "../Dashboard/LineChart";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  //log out handler
  const handleLogout = () => {
    //remove token and navigate to login
    localStorage.removeItem("token");
    navigate("/login"); // or any landing page
  };
  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title"> MoveSmart </h1>
        <p className="dashboard-subtitle">Dashboard</p>
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
          <div className="logout-container">
            <button className="sidebar-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>
        {/* Sidebar */}

        {/* Main */}
        <div className="dashboard-content">
          <section className="chart-section">
            <LineChart />
          </section>
        </div>
        {/* Main */}
      </div>
    </div>
  );
};

export default Dashboard;
