export const technicianDTO = (data, role) => {
  const { fullName, email, _id, status, phone, profilePicture } = data;
  return {
    fullName,
    profilePicture,
    email,
    _id,
    status,
    role,
    phone,
  };
};
