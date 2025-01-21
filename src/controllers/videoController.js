export const home = (req, res) => {
    res.render("home", { pageTitle: "Home" });
};
export const watch = (req, res) => {
    const { id } = req.params;

    return res.render("watch", { pageTitle: `Watching` });
};

export const getEdit = (req, res) => {
    const { id } = req.params;

    return res.render("edit", { pageTitle: `Editing: ` });
};

export const postEdit = (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload video" });
};

export const postUpload = (req, res) => {
    return res.redirect("/");
};
