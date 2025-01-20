let videos = [
    {
        title: "Video #1",
        rating: 5,
        comments: 2,
        createdAt: "2 minutes ago",
        views: 59,
        id: 1,
    },
    {
        title: "Video #2",
        rating: 5,
        comments: 2,
        createdAt: "2 minutes ago",
        views: 59,
        id: 2,
    },
    {
        title: "Video #3",
        rating: 5,
        comments: 2,
        createdAt: "2 minutes ago",
        views: 59,
        id: 3,
    },
];

export const trending = (req, res) => {
    res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
    const { id } = req.params;
    console.log("Show video", id);
    const video = videos[id - 1];
    return res.render("watch", { pageTitle: `Watching ${video.title}`, video });
};

export const getEdit = (req, res) => {
    const { id } = req.params;
    const video = videos[id - 1];
    return res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};

export const postEdit = (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    videos[id - 1].title = title;
    res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload video" });
};

export const postUpload = (req, res) => {
    const newVideo = {
        title: req.body.title,
        rating: 0,
        comments: 0,
        createdAt: "just now",
        views: 0,
        id: videos.length + 1,
    };
    videos.push(newVideo);
    return res.redirect("/");
};
