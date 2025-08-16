function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance.toFixed(2);
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}


24.65548, 46.699583;

// Optimized query to get nearest providers based on boundary
/*{
   async function findNearestProvider(customerLat, customerLon) {
  let boundary = 0.02; // initial ~2 km
  const maxBoundary = 1; // maximum ~111 km
  let nearbyProviders = [];

  while (nearbyProviders.length === 0 && boundary <= maxBoundary) {
    const lowLat = customerLat - boundary;
    const highLat = customerLat + boundary;
    const lowLon = customerLon - boundary;
    const highLon = customerLon + boundary;

    nearbyProviders = await Provider.find({
      lat: { $gte: lowLat, $lte: highLat },
      lon: { $gte: lowLon, $lte: highLon },
    }).limit(10);

    if (nearbyProviders.length === 0) {
      boundary *= 2; // expand search area
    }
  }

  // Safeguard: if no providers found, return null
  if (nearbyProviders.length === 0) {
    return null;
  }

  // pick the nearest provider from the filtered ones
  let nearestProvider = nearbyProviders[0];
  let minDistance = getDistanceFromLatLonInKm(
    customerLat,
    customerLon,
    nearestProvider.lat,
    nearestProvider.lon
  );

  for (const provider of nearbyProviders) {
    const distance = getDistanceFromLatLonInKm(
      customerLat,
      customerLon,
      provider.lat,
      provider.lon
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestProvider = provider;
    }
  }

  return { nearestProvider, distanceKm: minDistance.toFixed(2) };
}

}*/