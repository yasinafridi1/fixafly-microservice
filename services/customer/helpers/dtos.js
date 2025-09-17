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

export const bookingDto = (bookings, servicesData, role, technician = null) => {
  // Create a lookup map for faster access
  const serviceMap = {};
  servicesData.forEach((service) => {
    serviceMap[service._id] = service;
  });

  return bookings.map((booking) => {
    const b = booking.toObject ? booking.toObject() : booking;

    const updatedServices = b.services.map((s) => {
      const serviceDetails = serviceMap[s.serviceId] || {};
      return {
        quantity: s.quantity,
        ...serviceDetails, // merge all service fields at top level
      };
    });

    return {
      ...b,
      services: updatedServices,
      technician: technician || b.technician || null,
    };
  });
};
