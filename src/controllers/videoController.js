import Video from "../models/Video";
import User from "../models/User";

export const home = async (req, res) => {
    const videos = await Video.find({})
        .sort({ createdAt: "desc" })
        .populate("owner");
    return res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner");

    if (!video) {
        return res.render("404", { pageTitle: "Video Not Found" });
    }
    return res.render("watch", {
        pageTitle: video.title,
        video: video,
    });
};

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video Not Found" });
    }
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("edit", {
        pageTitle: `Edit ${video.title}`,
        video: video,
    });
};

export const postEdit = async (req, res) => {
    const {
        user: { _id },
    } = req.session;
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.exists({ _id: id });
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video Not Found" });
    }
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title: title,
        description: description,
        hashtags: Video.formatHashtags(hashtags),
    });
    req.flash("success", "Changes saved.");
    return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload video" });
};

export const postUpload = async (req, res) => {
    const {
        user: { _id },
    } = req.session;
    const { video, thumb } = req.files;
    const { title, description, hashtags } = req.body;
    try {
        const newVideo = await Video.create({
            title: title,
            description: description,
            fileUrl: video[0].path,
            thumbUrl: thumb[0].path,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
    } catch (error) {
        return res.status(400).render("upload", {
            pageTitle: "Upload video",
            errorMessage: error._message,
        });
    }
    return res.redirect("/");
};

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video Not Found" });
    }
    if (String(video.owner) !== String(_id)) {
        req.flash("error", "You are not the owner of the video.");
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async (req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i"),
            },
        }).populate("owner");
    }
    return res.render("search", { pageTitle: "Search", videos: videos });
};

export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
};
