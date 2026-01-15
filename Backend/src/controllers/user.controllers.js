import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../cloudinary.js";
import { User } from "../models/user.models.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const accessOptions = {
    httpOnly: true,
    secure: isProduction, // true for Render (HTTPS)
    sameSite: isProduction ? "none" : "lax", // allow cross-site cookies
    path: "/",
    maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY, 10) || 24 * 60 * 60 * 1000,
};

const refreshOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge:
        parseInt(process.env.REFRESH_TOKEN_EXPIRY, 10) ||
        7 * 24 * 60 * 60 * 1000,
};



const generateRefreshAndAccessTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const refreshToken = user.generateRefreshTokens();
        const accessToken = user.generateAccessTokens();
        // console.log("o1");
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //take user details
    // check for required fields
    // check if user already exist
    // check for images
    // upload image
    // create a user obj and entry in db
    // remove password and refresh token field from response
    // check for success in creation

    // accepting data
    const { name, email, password, phoneNumber, role, address } = req.body;

    //validation of data
    if ([name, email, password, phoneNumber, address].some((fields) =>
        fields?.trim() === ""
    )) {
        throw new apiError(400, "Please provide all required details");
    }

    const userExist = await User.findOne({
        $or: [{ phoneNumber }, { email }]
    })

    if (userExist) {
        throw new apiError(401, "email or phone number already in use");
    }
    // console.log("Path is: ", req.file.path)
    const profilePicturePath = req.file?.path;

    if (!profilePicturePath) {
        throw new apiError(401, "Profile Path is required.");
    }

    const profilePicture = await uploadOnCloudinary(profilePicturePath);

    console.log("profile image url is: ", profilePicture.url);

    if (!profilePicture) {
        throw new apiError(400, "error while uploading");
    }

    //create entry in DB
    const userEntry = await User.create({
        name: name.toLowerCase(),
        email,
        password,
        role,
        profilePicture: profilePicture.url,
        phoneNumber,
        address
    });
    const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(userEntry._id);

    const createdUser = await User.findById(userEntry._id).select(
        "-password -refreshToken");
    console.log("user created")
    if (!createdUser) {
        throw new apiError(500, "Error while creating error");
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessOptions)
        .cookie("refreshToken", refreshToken, refreshOptions)
        .json(
            new apiResponse(
                200,
                createdUser,
                "User created successfully"
            )
        )

})

const loginUser = asyncHandler(async (req, res) => {
    //accept the data in res
    // find user
    // check password
    // generate refresf and accesss tokens
    // send them in cookies

    // 
    const { name, email, phoneNumber, password } = req.body;

    if (!(email || phoneNumber)) {
        throw new apiError(400, "email or phone Number is required");
    }
    //finding user
    const user = await User.findOne({
        $or: [{ email }, { phoneNumber }]
    })

    if (!user) {
        throw new apiError(404, "User not found, please register");
    }
    // validating password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid Password");
    }

    //generating refresh and access tokens
    const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(user._id);

    // removing unecessary fields from user
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //this option of cookies make cookies secure and immodifiable from the front end . cookies by default are modifiable 
    console.log(accessToken)
    console.log(refreshToken)
    console.log("Login done");
    return res
        .status(200)
        .cookie("accessToken", accessToken, accessOptions)
        .cookie("refreshToken", refreshToken, refreshOptions)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "Successfully LoggedIn"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true // this new option return the updated document or else it is false
        }
    )


    console.log("Logout done");
    return res
        .status(200)
        .clearCookie("accessToken", accessOptions)
        .clearCookie("refreshToken", refreshOptions)
        .json(
            new apiResponse(
                200,
                {},
                "User Logged Out successfully"
            )
        )
})

const refreshAccessTokens = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorised access");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new apiError(401, "Invalid Refresh Token");
        }
        if (incomingRefreshToken != user.refreshToken) {
            throw new apiError(401, "Refresh Token expired , please login");
        }



        const { accessToken, newRefreshToken } = await generateRefreshAndAccessTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, accessOptions)
            .cookie("refreshToken", newRefreshToken, refreshOptions)
            .json(
                new apiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "accessTokens refreshed successfully"
                )
            )

    } catch (error) {
        throw new apiError(400, "Invalid Refresh Token")
    }
})

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    // take the fields from the body
    const { oldPassword, newPassword } = req.body;
    // find the user from DB
    const user = await User.findById(req.user?._id);
    //verify the old Password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid old Password");
    }

    //save the new password in the user document and update it in DB
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {},
                "Password changed successfully",
            )
        )


})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new apiError(400, "No Valid User");
    }
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "returned user successfully"
            )
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { newName, newEmail, newAddress } = req.body;
    console.log(newName);
    console.log(newAddress);
    if ([newName, newEmail, newAddress].some((feild) =>
        feild?.trim() === ""
    )) {
        throw new apiError(400, "eveery feild is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name: newName,
                email: newEmail,
                address: newAddress,
            }
        },
        {
            new: true,
        }
    ).select("-password ");

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "Details updated successfully"
            )
        )

})

const updateUserProfilePicture = asyncHandler(async (req, res) => {
    const newProfilePicLocalpath = req.file?.path;

    if (!newProfilePicLocalpath) {
        throw new apiError(400, "profile picture is required");
    }
    const profilePicture = await uploadOnCloudinary(newProfilePicLocalpath);

    if (!profilePicture.url) {
        throw new apiError(400, "Error while uploading");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profilePicture: profilePicture.url,
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "avatar updated successfully"
            )
        )
})

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        throw new apiError(400, "User ID is required");
    }
    const user = await User.findById(userId)
    if (!user) {
        return new apiError(400, "No valid Users");
    }
    return res.status(200).json(
        new apiResponse(200, user, "returned the User")
    );
})

// TODO -> further i have to write the getUserOrderHistory and getUserCart controller

export {
    generateRefreshAndAccessTokens,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessTokens,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserProfilePicture,
    getUserById
};