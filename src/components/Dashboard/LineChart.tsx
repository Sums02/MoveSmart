import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  Brush,
} from "recharts";

//Type for the data
interface ForecastPoint {
  Date: string;
  median: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

//Custom tooltip for the chart
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const formattedDate = new Date(label ?? "").toLocaleDateString("en-GB");
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <p>
          <strong>{formattedDate}</strong>
        </p>
        <p>
          <strong>Median Price:</strong> £
          {Number(payload[0].value).toLocaleString("en-UK")}
        </p>
      </div>
    );
  }
  return null;
};

//creating the line chart component
const LineChartComponent: React.FC = () => {
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [laName, setLaName] = useState("England");

  //visualising the data for spefic area
  const fetchForecast = async (area: string) => {
    try {
      //retrieving the LA code based on area name
      const laCodeRes = await fetch(
        `http://localhost:8000/forecast/get-lacode?la_name=${area}`
      );
      const { LAcode } = await laCodeRes.json();

      //retrieving price data
      const forecastRes = await fetch(
        `http://localhost:8000/forecast/get-forecast?lacode=${LAcode}`
      );
      const forecastJson = await forecastRes.json();
      setData(forecastJson);
    } catch (err) {
      console.error("Failed to fetch forecast:", err);
    }
  };

  //default area is set to England
  useEffect(() => {
    fetchForecast("England");
  }, []);

  //query for the area upon clicking the button
  //if not null
  const handleSearch = () => {
    if (laName.trim() !== "") {
      fetchForecast(laName);
    }
  };

  //visuals
  return (
    <div style={{ width: "100%", height: 500 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "5px",
        }}
      >
        <input
          type="text"
          value={laName}
          onChange={(e) => setLaName(e.target.value)}
          style={{
            padding: "8px 10px",
            marginRight: "6px",
            height: "25px",
            borderRadius: "6px",
            borderColor: "#143A78",
            borderStyle: "solid",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "0 16px",
            backgroundColor: "#143A78",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            height: "25px",
          }}
        >
          Search
        </button>
      </div>

      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 30, right: 120, left: 30, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <ReferenceArea
            x1="2024-04-01"
            x2="2024-07-01"
            strokeOpacity={0.1}
            fill="#d1e4f7"
            label={{
              value: "Forecast",
              position: "top",
              fill: "#000",
              fontSize: 12,
            }}
          />
          <XAxis
            dataKey="Date"
            tickFormatter={(dateStr) =>
              new Date(dateStr).toLocaleDateString("en-GB")
            }
            angle={-45}
            textAnchor="end"
            interval="preserveStartEnd"
            tick={{ fontSize: 15 }}
          />
          <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={30} />
          <Line
            type="monotone"
            dataKey="median"
            name="Median House Price (£)"
            stroke="#143A78"
            strokeWidth={2}
            dot={false}
          />

          <Brush //scroller to zoom in on the chart
            dataKey="Date"
            height={10}
            y={460}
            stroke="#6B7280"
            fill="#F0F2F5"
            travellerWidth={10}
            fontSize={10}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
