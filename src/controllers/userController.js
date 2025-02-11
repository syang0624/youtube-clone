import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";

export const getJoin = (req, res) =>
    res.render("join", { pageTitle: "Create Account" });
export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    const pageTitle = "Join";
    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password does NOT match.",
        });
    }
    const exists = await User.exists({
        $or: [{ username: username }, { email: email }],
    });
    if (exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username/email is already taken.",
        });
    }

    try {
        await User.create({
            name,
            username,
            email,
            password,
            location,
        });
        return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: pageTitle,
            errorMessage: error._message,
        });
    }
};

export const getLogin = (req, res) =>
    res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ username: username, socialOnly: false });
    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password!",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
    const baseURL = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalURL = `${baseURL}?${params}`;
    return res.redirect(finalURL);
};
export const finishGithubLogin = async (req, res) => {
    const baseURL = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalURL = `${baseURL}?${params}`;
    const tokenRequest = await (
        await fetch(finalURL, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();

    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiURL = "https://api.github.com";
        const userData = await (
            await fetch(`${apiURL}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();

        const emailData = await (
            await fetch(`${apiURL}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if (!user) {
            user = await User.create({
                name: userData.name,
                avatarUrl: userData.avatar_url,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};

export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        file,
    } = req;

    const currentUser = req.session.user;

    if (currentUser.email !== email && (await User.exists({ email }))) {
        return res.status(400).render("edit-profile", {
            pageTitle,
            errorMessage: "This email is already taken.",
        });
    }

    if (
        currentUser.username !== username &&
        (await User.exists({ username }))
    ) {
        return res.status(400).render("edit-profile", {
            pageTitle,
            errorMessage: "This username is already taken.",
        });
    }

    const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
            avatarUrl: file ? file.path : avatarUrl,
            name: name,
            email: email,
            username: username,
            location: location,
        },
        { new: true }
    );
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
};

export const edit = (req, res) => res.send("Edit User");

export const logout = (req, res) => {
    req.session.destroy();
    req.flash("info", "You are logged out!");
    return res.redirect("/");
};

export const getChangePassword = (req, res) => {
    if (req.session.user.socialOnly === true) {
        req.flash("error", "Cannot change password.");
        return res.redirect("/");
    }
    return res.render("users/change-password", {
        pageTitle: "Change Password",
    });
};

export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: { _id, password },
        },
        body: { oldPassword, newPassword, newPasswordConfirmation },
    } = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "Your current password is incorrect.",
        });
    }
    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "Your new password does NOT match.",
        });
    }

    user.password = newPassword;
    await user.save();
    req.flash("info", "Password updated.");
    return res.redirect("/users/logout");
};

export const see = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    console.log(user);
    if (!user) {
        return res.status(404).render("404", { pageTitle: "User not found." });
    }

    return res.render("users/profile", {
        pageTitle: user.name,
        user: user,
    });
};
