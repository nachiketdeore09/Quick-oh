import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    }
)

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("local file path doesnt exist");
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        console.log("uploaded url: ", response.url)
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.log("failed while uploading: ", error);
        try {
            fs.unlinkSync(localFilePath)
        } catch (error) {
            console.log("unlinking error", error)
        }
        return null;
    }
}

export { uploadOnCloudinary }