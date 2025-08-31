import { locationObjDesctructure } from "./location.js";

export const technicianDTO = (data, role) => {
  const {
    fullName,
    email,
    _id,
    status,
    phone,
    profilePicture,
    location,
    idCard,
  } = data;

  const { lat, lng } = locationObjDesctructure(location);
  return {
    fullName,
    profilePicture,
    idCard,
    email,
    _id,
    status,
    role,
    phone,
    lat,
    lng,
  };
};
