import { AMOUNT_PER_KM } from "../config/constants.js";

export const nearestTechnicianBookingAmount = (services, technician) => {
  const distanceInKm = (technician.distance / 1000).toFixed(2);

  const totalAmountOfKM = AMOUNT_PER_KM * distanceInKm;

  const totalAmountOfServices = services.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const totalBookingAmount = Math.floor(
    totalAmountOfKM + totalAmountOfServices
  );
  return totalBookingAmount;
};
