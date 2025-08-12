export const userDto = (data, accessToken = null, refreshToken = null) => {
  const { email, _id, role } = data;
  return {
    email,
    _id,
    role,
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
  };
};
