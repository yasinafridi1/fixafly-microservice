import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import uploadFileToS3, { deleteFileFromS3 } from "../shared/utils/AwsUtil.js";
import BannerModel from "../models/BannerModel.js";

export const addBanner = AsyncWrapper(async (req, res, next) => {
  const attachment = await uploadFileToS3(req.file);
  const newBanner = new BannerModel({
    image: attachment,
    isActive: req.body.isActive === "ACTIVE",
  });
  const result = await newBanner.save();
  SuccessMessage(res, "Banner added successfully", result);
});

export const getAllBanners = AsyncWrapper(async (req, res, next) => {
  const banners = await BannerModel.find();
  SuccessMessage(res, "Banners fetched successfully", banners);
});

export const updateBanner = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const banner = await BannerModel.findById(id);
  if (!banner) {
    return next(new ErrorHandler("Banner not found", 404));
  }

  let imageUrl = banner.image;
  if (req.file) {
    // Delete previous image from S3 if exists
    if (banner.image) {
      await deleteFileFromS3(banner.image);
    }
    // Upload new image
    imageUrl = await uploadFileToS3(req.file);
  }

  banner.isActive = isActive === "ACTIVE";
  banner.image = imageUrl;
  const result = await banner.save();
  SuccessMessage(res, "Banner status updated successfully", result);
});

export const deleteBanner = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const banner = await BannerModel.findById(id);
  if (!banner) {
    return next(new ErrorHandler("Banner not found", 404));
  }

  // Delete image from S3 if exists
  if (banner.image) {
    await deleteFileFromS3(banner.image);
  }
  await banner.deleteOne({ _id: id });
  SuccessMessage(res, "Banner deleted successfully");
});
