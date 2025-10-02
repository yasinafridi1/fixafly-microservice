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

export const bookingDto = (bookings, servicesData, techniciansData = []) => {
  // Service lookup
  const serviceMap = {};
  servicesData.forEach((service) => {
    serviceMap[service._id] = service;
  });

  // Technician lookup
  const technicianMap = {};
  if (Array.isArray(techniciansData)) {
    techniciansData.forEach((tech) => {
      technicianMap[tech._id] = tech;
    });
  }

  return bookings.map((booking) => {
    const b = booking.toObject ? booking.toObject() : booking;

    // Map services
    const updatedServices = b.services.map((s) => {
      const serviceDetails = serviceMap[s.serviceId] || {};
      return {
        quantity: s.quantity,
        ...serviceDetails,
      };
    });

    // Map technician (support both "technician" and "technicianId")
    let technician = null;

    if (b.technician && technicianMap[b.technician]) {
      technician = technicianMap[b.technician];
    } else if (b.technicianId && technicianMap[b.technicianId]) {
      technician = technicianMap[b.technicianId];
    }

    return {
      ...b,
      services: updatedServices,
      technician,
    };
  });
};

export const bookingAdminDTO = (bookings, techniciansData = []) => {
  // Technician lookup
  const technicianMap = {};
  if (Array.isArray(techniciansData)) {
    techniciansData.forEach((tech) => {
      technicianMap[tech._id] = tech;
    });
  }

  return bookings.map((booking) => {
    const b = booking.toObject ? booking.toObject() : booking;

    // Map technician (support both "technician" and "technicianId")
    let technician = null;
    if (b.technician && technicianMap[b.technician]) {
      technician = technicianMap[b.technician];
    } else if (b.technicianId && technicianMap[b.technicianId]) {
      technician = technicianMap[b.technicianId];
    }

    return {
      ...b,
      technician, // mapped technician
      // services remain untouched
    };
  });
};
