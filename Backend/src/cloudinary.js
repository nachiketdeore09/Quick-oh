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

const deleteFromCloudinary = async (cloudinaryUrl) => {
    try {
        if (!cloudinaryUrl) return null;
        
        // Extract public_id from the URL
        // Example URL: http://res.cloudinary.com/demo/image/upload/v12345678/sample.jpg
        const publicId = cloudinaryUrl.split('/').pop().split('.')[0];
        
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        console.log("failed while deleting from cloudinary: ", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }