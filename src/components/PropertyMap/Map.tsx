import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import greenIconUrl from "../../assets/greenpin.svg";
import redIconUrl from "../../assets/redpin.svg";
import "leaflet/dist/leaflet.css";

//default location pin icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

//property listing info
export type Property = {
  latitude: number;
  longitude: number;
  title: string;
  price: number;
  lister_url: string;
};

//
type MapProps = {
  listings: Property[]; //property listings
  maxAffordablePrice: number; //max affordable price
};

const Map: React.FC<MapProps> = ({ listings, maxAffordablePrice }) => {
  //location pin colour is based on whether user can afford the property
  const getMarkerIcon = (price: number) => {
    const iconUrl = price <= maxAffordablePrice ? greenIconUrl : redIconUrl;
    return L.icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  };

  //ensuring listings is an array
  if (!Array.isArray(listings)) {
    console.error("Listings is not an array:", listings); // 👈 helpful debug
    return <p style={{ color: "red" }}>No property data available.</p>;
  }

  //default location
  const defaultCenter: [number, number] = listings.length
    ? [listings[0].latitude, listings[0].longitude]
    : [51.509865, -0.118092];

  return (
    <div style={{ height: "500px" }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {listings.map((property, idx) => (
          <Marker
            key={idx}
            position={[property.latitude, property.longitude]}
            icon={getMarkerIcon(property.price)}
          >
            <Popup>
              <strong>{property.title}</strong>
              <br />
              Price: £{property.price.toLocaleString()}
              <br />
              <a
                href={property.lister_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Listing
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
export default Map;
