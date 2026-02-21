import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const vehicleIcon = (status) => new L.DivIcon({
    html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:${status === 'On Trip' ? '#197fe6' : status === 'Available' ? '#22c55e' : '#f59e0b'};
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;
    font-size:16px;
  ">🚛</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
})

// Indian cities for realistic GPS simulation
const INDIAN_CITIES = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
]

function generatePosition(vehicle, index) {
    const city = INDIAN_CITIES[index % INDIAN_CITIES.length]
    return {
        lat: city.lat + (Math.random() * 0.04 - 0.02),
        lng: city.lng + (Math.random() * 0.04 - 0.02),
        cityName: city.name,
    }
}

function FitBounds({ positions }) {
    const map = useMap()
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]))
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
        }
    }, [positions, map])
    return null
}

export default function FleetMap({ vehicles = [] }) {
    const [positions, setPositions] = useState([])

    useEffect(() => {
        if (vehicles.length > 0) {
            const pts = vehicles.map((v, i) => ({
                ...v,
                ...generatePosition(v, i),
            }))
            setPositions(pts)
        }
    }, [vehicles])

    if (vehicles.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
                <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">map</span>
                <p className="text-sm font-medium">No vehicles to track</p>
                <p className="text-xs mt-1">Add vehicles to see live GPS tracking</p>
            </div>
        )
    }

    return (
        <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="h-full w-full rounded-xl overflow-hidden"
            style={{ minHeight: '350px' }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds positions={positions} />
            {positions.map((v, i) => (
                <Marker key={v.id || i} position={[v.lat, v.lng]} icon={vehicleIcon(v.status)}>
                    <Popup>
                        <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '170px' }}>
                            <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{v.name}</p>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>{v.vehicle_id} • {v.vehicle_type}</p>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>📍 Near {v.cityName}</p>
                            <div style={{ marginTop: '8px', fontSize: '12px' }}>
                                <p>Status: <strong style={{ color: v.status === 'On Trip' ? '#197fe6' : v.status === 'Available' ? '#22c55e' : '#f59e0b' }}>{v.status}</strong></p>
                                <p>Fuel: <strong>{v.fuel_level}%</strong></p>
                                <p>Mileage: <strong>{v.mileage?.toLocaleString('en-IN')} km</strong></p>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
