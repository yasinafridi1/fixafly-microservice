export const locationObjBuilder = (lat, lng) => {
  const location = {
    type: "Point",
    coordinates: [lat, lng],
  };

  return location;
};

export const locationObjDesctructure = (location) => {
  const lat = location.coordinates[0];
  const lng = location.coordinates[1];
  return { lat, lng };
};
