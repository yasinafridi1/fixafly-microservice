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

export const serviceDTO = (data) => {
  const { name, image, description, price, _id, status, visibilityStatus } =
    data;
  return {
    name,
    image,
    description,
    price,
    _id,
    status,
    visibilityStatus,
  };
};
