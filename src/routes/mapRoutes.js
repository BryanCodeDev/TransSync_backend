const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuración base para OpenStreetMap APIs
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const OVERPASS_BASE_URL = 'https://overpass-api.de/api/interpreter';
const OSRM_BASE_URL = 'https://router.project-osrm.org';

// User-Agent requerido por OSM (personaliza con tu email real)
const USER_AGENT = process.env.OSM_USER_AGENT || 'TranssyncApp/1.0 (support@transync.com)';

// Middleware de rate limiting para OSM (más flexible)
const rateLimit = require('express-rate-limit');
const osmLimit = rateLimit({
  windowMs: 1000,
  max: 1,
  message: {
    success: false,
    message: 'Demasiadas solicitudes a OpenStreetMap, intenta de nuevo en un momento',
    retryAfter: 1000
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para validar coordenadas
const validateCoordinates = (req, res, next) => {
  const { lat, lon } = req.params;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      message: 'Coordenadas inválidas: deben ser números válidos'
    });
  }
  
  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({
      success: false,
      message: 'Latitud inválida: debe estar entre -90 y 90'
    });
  }
  
  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: 'Longitud inválida: debe estar entre -180 y 180'
    });
  }
  
  req.coordinates = { lat: latitude, lon: longitude };
  next();
};

// Función helper para hacer requests a OSM
const makeOSMRequest = async (url, params, headers = {}) => {
  try {
    const response = await axios.get(url, {
      params,
      headers: {
        'User-Agent': USER_AGENT,
        ...headers
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout: La solicitud tardó demasiado tiempo');
    }
    if (error.response?.status === 429) {
      throw new Error('Demasiadas solicitudes a OpenStreetMap, intenta más tarde');
    }
    if (error.response?.status >= 500) {
      throw new Error('Servicio de OpenStreetMap temporalmente no disponible');
    }
    throw new Error(error.response?.data?.error || error.message || 'Error en servicio de mapas');
  }
};

// 1. Búsqueda de lugares (Geocoding) - MEJORADO
router.get('/search/:query', osmLimit, async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La consulta debe tener al menos 2 caracteres'
      });
    }

    const { limit = 5, countrycodes = 'co' } = req.query;
    const searchLimit = Math.min(parseInt(limit) || 5, 20); // Máximo 20 resultados

    const data = await makeOSMRequest(`${NOMINATIM_BASE_URL}/search`, {
      q: query.trim(),
      format: 'json',
      limit: searchLimit,
      countrycodes: countrycodes,
      addressdetails: 1,
      extratags: 1,
      namedetails: 1
    });

    const results = data.map(place => ({
      id: place.place_id,
      name: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      type: place.type,
      class: place.class,
      address: place.address || {},
      boundingbox: place.boundingbox?.map(coord => parseFloat(coord)),
      importance: place.importance || 0
    }));

    res.json({
      success: true,
      data: results,
      count: results.length,
      query: query.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en búsqueda OSM:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al buscar en OpenStreetMap',
      timestamp: new Date().toISOString()
    });
  }
});

// 2. Geocoding inverso - MEJORADO
router.get('/reverse/:lat/:lon', [osmLimit, validateCoordinates], async (req, res) => {
  try {
    const { lat, lon } = req.coordinates;
    const { zoom = 18 } = req.query;
    const zoomLevel = Math.min(Math.max(parseInt(zoom) || 18, 3), 18);

    const data = await makeOSMRequest(`${NOMINATIM_BASE_URL}/reverse`, {
      lat: lat,
      lon: lon,
      format: 'json',
      zoom: zoomLevel,
      addressdetails: 1
    });

    if (data.error) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró información para estas coordenadas'
      });
    }

    res.json({
      success: true,
      data: {
        address: data.display_name,
        details: data.address || {},
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        place_id: data.place_id,
        osm_type: data.osm_type,
        osm_id: data.osm_id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en geocoding inverso:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener dirección',
      timestamp: new Date().toISOString()
    });
  }
});

// 3. Buscar lugares cercanos - MEJORADO
router.get('/nearby/:lat/:lon/:type', [osmLimit, validateCoordinates], async (req, res) => {
  try {
    const { lat, lon } = req.coordinates;
    const { type } = req.params;
    const { radius = 1000 } = req.query;
    
    const searchRadius = Math.min(parseInt(radius) || 1000, 10000); // Máximo 10km

    // Lista de tipos válidos de amenidades
    const validTypes = [
      'restaurant', 'bank', 'hospital', 'school', 'pharmacy', 'fuel', 
      'police', 'fire_station', 'post_office', 'library', 'atm',
      'cafe', 'bar', 'fast_food', 'pub', 'supermarket'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de lugar inválido. Tipos válidos: ${validTypes.join(', ')}`,
        validTypes: validTypes
      });
    }

    // Query Overpass optimizada
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="${type}"](around:${searchRadius},${lat},${lon});
        way["amenity"="${type}"](around:${searchRadius},${lat},${lon});
        relation["amenity"="${type}"](around:${searchRadius},${lat},${lon});
      );
      out center meta;
    `;

    const response = await axios.post(OVERPASS_BASE_URL, overpassQuery, {
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': USER_AGENT
      },
      timeout: 30000
    });

    const places = response.data.elements
      .filter(element => element.lat || element.center?.lat)
      .map(element => ({
        id: element.id,
        type: element.type,
        name: element.tags?.name || element.tags?.brand || 'Sin nombre',
        amenity: element.tags?.amenity,
        lat: element.lat || element.center?.lat,
        lon: element.lon || element.center?.lon,
        tags: {
          address: element.tags?.['addr:full'] || element.tags?.['addr:street'],
          phone: element.tags?.phone,
          website: element.tags?.website,
          opening_hours: element.tags?.opening_hours,
          brand: element.tags?.brand
        }
      }))
      .slice(0, 50); // Limitar a 50 resultados

    res.json({
      success: true,
      data: places,
      count: places.length,
      searchParams: {
        type: type,
        radius: searchRadius,
        center: { lat, lon }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error buscando lugares cercanos:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al buscar lugares cercanos',
      timestamp: new Date().toISOString()
    });
  }
});

// 4. Calcular ruta - MEJORADO
router.get('/route/:startLat/:startLon/:endLat/:endLon', osmLimit, async (req, res) => {
  try {
    const { startLat, startLon, endLat, endLon } = req.params;
    
    // Validar todas las coordenadas
    const coords = [
      { name: 'startLat', value: parseFloat(startLat) },
      { name: 'startLon', value: parseFloat(startLon) },
      { name: 'endLat', value: parseFloat(endLat) },
      { name: 'endLon', value: parseFloat(endLon) }
    ];

    for (const coord of coords) {
      if (isNaN(coord.value)) {
        return res.status(400).json({
          success: false,
          message: `Coordenada inválida: ${coord.name} debe ser un número`
        });
      }
    }

    const { profile = 'driving' } = req.query;
    const validProfiles = ['driving', 'walking', 'cycling'];
    
    if (!validProfiles.includes(profile)) {
      return res.status(400).json({
        success: false,
        message: `Perfil inválido. Perfiles válidos: ${validProfiles.join(', ')}`,
        validProfiles: validProfiles
      });
    }

    const response = await axios.get(
      `${OSRM_BASE_URL}/route/v1/${profile}/${startLon},${startLat};${endLon},${endLat}`,
      {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: true,
          alternatives: false
        },
        timeout: 15000
      }
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      
      res.json({
        success: true,
        data: {
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
          steps: route.legs[0]?.steps?.slice(0, 20) || [], // Limitar pasos
          profile: profile,
          coordinates: {
            start: { lat: parseFloat(startLat), lon: parseFloat(startLon) },
            end: { lat: parseFloat(endLat), lon: parseFloat(endLon) }
          }
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No se pudo calcular la ruta entre estos puntos',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error calculando ruta:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        message: 'Timeout calculando la ruta, intenta de nuevo',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al calcular ruta',
      timestamp: new Date().toISOString()
    });
  }
});

// 5. Información detallada de un lugar - MEJORADO
router.get('/place/:id', osmLimit, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de lugar inválido'
      });
    }

    const data = await makeOSMRequest(`${NOMINATIM_BASE_URL}/details`, {
      place_id: id,
      format: 'json',
      addressdetails: 1,
      extratags: 1,
      namedetails: 1
    });

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo detalles del lugar:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener detalles del lugar',
      timestamp: new Date().toISOString()
    });
  }
});

// 6. NUEVA RUTA: Obtener tipos de lugares disponibles
router.get('/place-types', (req, res) => {
  const placeTypes = [
    { value: 'restaurant', label: 'Restaurantes', icon: '🍽️' },
    { value: 'bank', label: 'Bancos', icon: '🏦' },
    { value: 'hospital', label: 'Hospitales', icon: '🏥' },
    { value: 'school', label: 'Escuelas', icon: '🏫' },
    { value: 'pharmacy', label: 'Farmacias', icon: '💊' },
    { value: 'fuel', label: 'Gasolineras', icon: '⛽' },
    { value: 'police', label: 'Policía', icon: '👮' },
    { value: 'fire_station', label: 'Bomberos', icon: '🚒' },
    { value: 'post_office', label: 'Correos', icon: '📮' },
    { value: 'library', label: 'Bibliotecas', icon: '📚' },
    { value: 'atm', label: 'Cajeros', icon: '🏧' },
    { value: 'cafe', label: 'Cafeterías', icon: '☕' },
    { value: 'supermarket', label: 'Supermercados', icon: '🛒' }
  ];

  res.json({
    success: true,
    data: placeTypes,
    count: placeTypes.length
  });
});

// 7. NUEVA RUTA: Status del servicio de mapas
router.get('/status', async (req, res) => {
  const services = {};
  
  try {
    // Test Nominatim
    await axios.get(`${NOMINATIM_BASE_URL}/search?q=test&format=json&limit=1`, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 5000
    });
    services.nominatim = 'operational';
  } catch (error) {
    services.nominatim = 'error';
  }

  try {
    // Test OSRM
    await axios.get(`${OSRM_BASE_URL}/route/v1/driving/13.388860,52.517037;13.385983,52.496891`, {
      timeout: 5000
    });
    services.osrm = 'operational';
  } catch (error) {
    services.osrm = 'error';
  }

  const allOperational = Object.values(services).every(status => status === 'operational');

  res.json({
    success: true,
    status: allOperational ? 'operational' : 'degraded',
    services: services,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;