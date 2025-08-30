import { locationObjDesctructure } from "./location";

export const technicianDTO = (data, role) => {
  const { fullName, email, _id, status, phone, profilePicture, location } =
    data;

  const { lat, lng } = locationObjDesctructure(location);
  return {
    fullName,
    profilePicture,
    email,
    _id,
    status,
    role,
    phone,
    lat,
    lng,
  };
};
