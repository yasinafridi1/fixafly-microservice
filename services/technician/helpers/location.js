export const locationObjBuilder = (lat, lng) => {
  const location = {
    type: "Point",
    coordinates: [lng, lat],
  };

  return location;
};

export const locationObjDesctructure = (location) => {
  const lng = location.coordinates[0];
  const lat = location.coordinates[1];
  return { lat, lng };
};
