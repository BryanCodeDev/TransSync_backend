// services/mapService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class MapService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/map`;
  }

  // Método auxiliar para manejar requests
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('Error en MapService:', error);
      throw error;
    }
  }

  // 1. Buscar lugares
  async searchPlaces(query, options = {}) {
    const { limit = 5, countrycodes = '' } = options;
    const params = new URLSearchParams({
      limit: limit.toString(),
      countrycodes
    });

    const url = `${this.baseURL}/search/${encodeURIComponent(query)}?${params}`;
    return await this.makeRequest(url);
  }

  // 2. Geocoding inverso
  async reverseGeocode(lat, lon, zoom = 18) {
    const url = `${this.baseURL}/reverse/${lat}/${lon}?zoom=${zoom}`;
    return await this.makeRequest(url);
  }

  // 3. Buscar lugares cercanos
  async findNearbyPlaces(lat, lon, type, radius = 1000) {
    const url = `${this.baseURL}/nearby/${lat}/${lon}/${type}?radius=${radius}`;
    return await this.makeRequest(url);
  }

  // 4. Calcular ruta
  async calculateRoute(startLat, startLon, endLat, endLon, profile = 'driving') {
    const url = `${this.baseURL}/route/${startLat}/${startLon}/${endLat}/${endLon}?profile=${profile}`;
    return await this.makeRequest(url);
  }

  // 5. Obtener información detallada de un lugar
  async getPlaceDetails(placeId) {
    const url = `${this.baseURL}/place/${placeId}`;
    return await this.makeRequest(url);
  }

  // 6. Métodos de utilidad
  
  // Convertir distancia a formato legible
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  }

  // Convertir duración a formato legible
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Calcular distancia entre dos puntos (Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distancia en km
    
    return distance * 1000; // Convertir a metros
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Validar coordenadas
  isValidCoordinate(lat, lon) {
    return (
      typeof lat === 'number' && 
      typeof lon === 'number' &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  }

  // Obtener ubicación actual del usuario
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Error desconocido';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permiso de ubicación denegado';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Ubicación no disponible';
              break;
            case error.TIMEOUT:
              message = 'Tiempo de espera agotado';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Crear URL de mapa estático (usando OpenStreetMap tiles)
  createStaticMapURL(lat, lon, zoom = 15, width = 400, height = 300) {
    // Esta es una implementación básica - podrías usar servicios como MapBox Static API
    const tileX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    return `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
  }

  // Buscar direcciones con autocompletado
  async searchAddresses(query, options = {}) {
    if (query.length < 3) {
      return { success: true, data: [], count: 0 };
    }

    return await this.searchPlaces(query, {
      limit: options.limit || 5,
      countrycodes: options.countrycodes || 'co' // Colombia por defecto
    });
  }

  // Obtener sugerencias de lugares populares
  async getPopularPlaces(lat, lon) {
    const promises = [
      this.findNearbyPlaces(lat, lon, 'restaurant', 2000),
      this.findNearbyPlaces(lat, lon, 'bank', 1000),
      this.findNearbyPlaces(lat, lon, 'hospital', 5000),
      this.findNearbyPlaces(lat, lon, 'school', 2000)
    ];

    try {
      const results = await Promise.allSettled(promises);
      const places = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const category = ['Restaurantes', 'Bancos', 'Hospitales', 'Escuelas'][index];
          places.push({
            category,
            places: result.value.data.slice(0, 3) // Solo los primeros 3
          });
        }
      });

      return { success: true, data: places };
    } catch (error) {
      console.error('Error obteniendo lugares populares:', error);
      return { success: false, data: [] };
    }
  }
}

// Crear instancia singleton
const mapService = new MapService();

export default mapService;