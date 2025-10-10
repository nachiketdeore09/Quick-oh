import express from "express";
import axios from "axios";
import { apiResponse } from "../utils/apiResponse.js";
const router = express.Router();

router.get("/reverse-geocode", async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res
            .status(400)
            .json(
                new apiResponse(
                    200,
                    {},
                    "Latitude and longitude required"
                )
            );
    }

    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
                lat,
                lon,
                format: "json",
            },
            headers: {
                "User-Agent": "Quick-oh/1.0", // Required by Nominatim
            },
        });

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    response.data,
                    "address fetched"
                )
            );
    } catch (error) {
        console.error("Geocoding error:", error.message);
        return res
            .status(500)
            .json(
                new apiResponse(
                    500,
                    {},
                    "Failed to fetch address"
                )
            );
    }
});

export default router;