import { USER_ROLES } from "../config/constants.js";

export const customerDto = (data, role) => {
  const { fullName, email, _id, status, phone, profilePicture, vatNumber } =
    data;
  return {
    fullName,
    profilePicture,
    phone,
    email,
    _id,
    status,
    role,
    ...(role === USER_ROLES.company ? { vatNumber } : {}),
  };
};
