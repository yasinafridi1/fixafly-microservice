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

// New optimized query to find nearest
// async function findNearestTechnicians(lat, lng, limit = 5) {
//   const nearest = await TechnicianModel.aggregate([
//     {
//       $geoNear: {
//         near: { type: "Point", coordinates: [lng, lat] }, // [lng, lat]
//         distanceField: "distance", // distance will be added in meters
//         spherical: true, // use spherical distance calculation
//         limit: limit, // top N nearest
//       },
//     },
//     {
//       $match: { isDeleted: false }, // ignore soft-deleted technicians
//     },
//   ]);

//   // Convert distance from meters to km and round
//   return nearest.map((tech) => ({
//     ...tech,
//     distanceKm: (tech.distance / 1000).toFixed(2),
//   }));
// }

// const customerLat = 24.65548;
// const customerLng = 46.699583;

// const nearestTechs = await findNearestTechnicians(customerLat, customerLng, 5);

// console.log(nearestTechs);
/*
[
  {
    _id: "...",
    fullName: "John Doe",
    email: "john@example.com",
    location: { type: "Point", coordinates: [46.7, 24.65] },
    distance: 5234.12, // in meters
    distanceKm: "5.23"
  },
  ...
]
*/

// Optimized query to get nearest providers based on boundary Manual and old process
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
