export const adminDTO = (data, role) => {
  const { fullName, email, _id } = data;
  return {
    fullName,
    email,
    _id,
    role,
  };
};

export const controllerDTO = (data, role) => {
  const { fullName, email, _id, status, profilePicture } = data;
  return {
    fullName,
    profilePicture,
    email,
    _id,
    status,
    role,
  };
};
