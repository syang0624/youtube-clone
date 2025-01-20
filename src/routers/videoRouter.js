import express from "express";
import {
    watch,
    postEdit,
    getEdit,
    getUpload,
    postUpload,
} from "../controllers/videoController";

const videoRouter = express.Router();

// have to put upload on top of the :id as it could be a valid id.

videoRouter.get("/:id(\\d+)", watch);
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);
videoRouter.route("/upload").get(getUpload).post(postUpload);

export default videoRouter;
