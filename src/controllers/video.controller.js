import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    page = isNaN(page) ? 1 : Number(page);
    limit = isNaN(limit) ? 10 : Number(limit);

    const matchStage = {};
    if(userId){
        matchStage["$match"] = {
            owner:new mongoose.Types.ObjectId(userId)
        }
    }
    if(query) {
        matchStage["$match"] = {
            $or:[
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }
    }
    if(userId && query){
        matchStage["$match"] = {
            $and:[
                {owner: new mongoose.Types.ObjectId(userId)},
                {
                    $or:[
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        }
    }

    matchStage["$match"]["pipeline"] = [
        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "owner",
                pipeline : [
                    {
                        $project : {
                            username : 1,
                            avatar : 1,
                            fullname : 1
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                owner : {
                    $first : "$owner"
                }
            }
        }
    ];

    const sortStage = {};
    if(sortBy && sortType){
        sortStage["$sort"] = {
            [sortBy]: sortType === "asc" ? 1 : -1
        }
    }else{
        sortStage["$sort"] = {
            createdAt: -1
        }
    }

    const skipStage = { $skip: (page - 1) * limit };
    const limitStage = { $limit: limit };
    const videos = await Video.aggregate([
        matchStage,
        sortStage,
        skipStage,
        limitStage
    ]);

    res.status(200).json(new ApiResponse(
        200,
        videos,
        "Get videos success"
    ));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}