import React from 'react';

// Weather code to condition mapping (WMO standard)
const WMO_DESCRIPTIONS = {
  0: { label: 'Clear Sky', icon: '☀️', color: '#f59e0b' },
  1: { label: 'Mainly Clear', icon: '🌤️', color: '#f59e0b' },
  2: { label: 'Partly Cloudy', icon: '⛅', color: '#6b7280' },
  3: { label: 'Overcast', icon: '☁️', color: '#6b7280' },
  45: { label: 'Foggy', icon: '🌫️', color: '#9ca3af' },
  48: { label: 'Icy Fog', icon: '🌫️', color: '#9ca3af' },
  51: { label: 'Light Drizzle', icon: '🌦️', color: '#3b82f6' },
  53: { label: 'Drizzle', icon: '🌦️', color: '#3b82f6' },
  55: { label: 'Heavy Drizzle', icon: '🌧️', color: '#3b82f6' },
  61: { label: 'Light Rain', icon: '🌧️', color: '#2563eb' },
  63: { label: 'Rain', icon: '🌧️', color: '#2563eb' },
  65: { label: 'Heavy Rain', icon: '🌧️', color: '#2563eb' },
  71: { label: 'Light Snow', icon: '🌨️', color: '#7dd3fc' },
  73: { label: 'Snow', icon: '❄️', color: '#7dd3fc' },
  75: { label: 'Heavy Snow', icon: '❄️', color: '#7dd3fc' },
  80: { label: 'Rain Showers', icon: '⛈️', color: '#7c3aed' },
  81: { label: 'Rain Showers', icon: '⛈️', color: '#7c3aed' },
  82: { label: 'Heavy Showers', icon: '⛈️', color: '#7c3aed' },
  95: { label: 'Thunderstorm', icon: '⛈️', color: '#dc2626' },
  96: { label: 'Thunderstorm', icon: '⛈️', color: '#dc2626' },
  99: { label: 'Thunderstorm', icon: '⛈️', color: '#dc2626' },
};

const getWMO = (code) => WMO_DESCRIPTIONS[code] || { label: 'Unknown', icon: '🌡️', color: '#6b7280' };

// Reverse geocode using Open-Meteo nominatim (free, no key)
const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Location';
  } catch {
    return 'Your Location';
  }
};

// Compact inline widget (for dashboard header)
const WeatherWidgetInline = () => {
  const [weather, setWeather] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [city, setCity] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;

    const fetchWeather = async (lat, lon) => {
      try {
        const [weatherRes, cityName] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
          ).then(r => r.json()),
          reverseGeocode(lat, lon),
        ]);
        if (!cancelled) {
          setWeather(weatherRes.current);
          setCity(cityName);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError('Unable to fetch');
          setLoading(false);
        }
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Default to a central India location if denied
          fetchWeather(20.5937, 78.9629);
          setCity('India');
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather(20.5937, 78.9629);
      setCity('India');
    }

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#15803d', borderRadius: 9999, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
        🌡️ Loading weather…
      </span>
    );
  }

  if (error || !weather) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#92400e', borderRadius: 9999, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
        ⚠️ Weather unavailable
      </span>
    );
  }

  const wmo = getWMO(weather.weather_code);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#15803d', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'default' }}
      title={`Humidity: ${weather.relative_humidity_2m}% | Wind: ${weather.wind_speed_10m} km/h`}>
      <span style={{ fontSize: 16 }}>{wmo.icon}</span>
      <span style={{ color: wmo.color, fontWeight: 700 }}>{Math.round(weather.temperature_2m)}°C</span>
      <span>{wmo.label}</span>
      {city && <span style={{ color: '#9ca3af' }}>· {city}</span>}
    </span>
  );
};

// Full weather card (for a dedicated section/dashboard card)
const WeatherWidgetCard = () => {
  const [weather, setWeather] = React.useState(null);
  const [forecast, setForecast] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [city, setCity] = React.useState('');
  const [coords, setCoords] = React.useState(null);

  const fetchWeather = React.useCallback(async (lat, lon) => {
    try {
      setLoading(true);
      const [weatherRes, cityName] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=5`
        ).then(r => r.json()),
        reverseGeocode(lat, lon),
      ]);
      setWeather(weatherRes.current);
      setCity(cityName);
      // Build 5-day forecast
      const days = [];
      const daily = weatherRes.daily;
      for (let i = 1; i < Math.min(5, daily.time.length); i++) {
        days.push({
          date: daily.time[i],
          code: daily.weather_code[i],
          max: daily.temperature_2m_max[i],
          min: daily.temperature_2m_min[i],
          rain: daily.precipitation_sum[i],
          wind: daily.wind_speed_10m_max[i],
        });
      }
      setForecast(days);
      setLoading(false);
    } catch (e) {
      setError('Unable to fetch weather data');
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
          fetchWeather(latitude, longitude);
        },
        () => {
          setCoords({ lat: 20.5937, lon: 78.9629 });
          setCity('India (Default)');
          fetchWeather(20.5937, 78.9629);
        },
        { timeout: 8000 }
      );
    } else {
      setCoords({ lat: 20.5937, lon: 78.9629 });
      fetchWeather(20.5937, 78.9629);
    }
  }, [fetchWeather]);

  const handleRefresh = () => {
    if (coords) fetchWeather(coords.lat, coords.lon);
  };

  if (loading) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🌡️</div>
        Fetching real-time weather…
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
        {error || 'Weather data unavailable'}
        <br /><button onClick={handleRefresh} style={{ marginTop: 8, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 7, padding: '5px 14px', cursor: 'pointer', fontSize: 12 }}>Retry</button>
      </div>
    );
  }

  const wmo = getWMO(weather.weather_code);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {/* Current Weather */}
      <div style={{ padding: '20px 24px', background: `linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%)`, borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🌍 {city} · Live Weather
          </div>
          <button onClick={handleRefresh} title="Refresh"
            style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: '#6b7280' }}>
            ↻ Refresh
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 52, lineHeight: 1 }}>{wmo.icon}</span>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#111827' }}>{Math.round(weather.temperature_2m)}°C</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: wmo.color }}>{wmo.label}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Feels like {Math.round(weather.apparent_temperature)}°C
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#374151' }}>
            <div>💧 Humidity: <strong>{weather.relative_humidity_2m}%</strong></div>
            <div>💨 Wind: <strong>{weather.wind_speed_10m} km/h</strong></div>
            <div>🌧️ Rain: <strong>{(weather.precipitation || 0).toFixed(1)} mm</strong></div>
          </div>
        </div>

        {/* Agricultural Advisory */}
        <div style={{ marginTop: 12, background: 'rgba(22,163,74,0.08)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#15803d', fontWeight: 500 }}>
          {weather.temperature_2m > 38
            ? '🔥 Very hot — ensure crops are irrigated. Avoid fieldwork during peak hours (12–4 PM).'
            : weather.weather_code >= 61 && weather.weather_code <= 67
            ? '🌧️ Rainy conditions — postpone spraying pesticides/fertilizers. Check drainage.'
            : weather.weather_code >= 71 && weather.weather_code <= 77
            ? '❄️ Cold/foggy — protect sensitive seedlings. Delay sowing if needed.'
            : weather.relative_humidity_2m > 85
            ? '🍄 High humidity — risk of fungal disease. Monitor crops and consider fungicide.'
            : weather.wind_speed_10m > 30
            ? '💨 Strong winds — avoid spraying. Secure loose structures on the farm.'
            : '✅ Good conditions — suitable for regular farm activities today.'}
        </div>
      </div>

      {/* 4-Day Forecast */}
      {forecast.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${forecast.length}, 1fr)`, borderTop: '1px solid #f3f4f6' }}>
          {forecast.map((day, i) => {
            const d = new Date(day.date);
            const dayWmo = getWMO(day.code);
            return (
              <div key={i} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < forecast.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>{dayNames[d.getDay()]}</div>
                <div style={{ fontSize: 22 }}>{dayWmo.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginTop: 4 }}>{Math.round(day.max)}°</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{Math.round(day.min)}°</div>
                {day.rain > 0 && <div style={{ fontSize: 10, color: '#2563eb', marginTop: 2 }}>💧 {day.rain.toFixed(1)}mm</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { WeatherWidgetInline, WeatherWidgetCard };
export default WeatherWidgetCard;
