const User = require("../models/users");
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt")
const { isValidObjectId } = require('mongoose');
const { Validator } = require('node-input-validator');

exports.createUser = async (req, res) => {
    try {
        const { email } = req.body;
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.send({ message: 'E-mail already exists, Login to continue!' })
        }
        const newUser = new User({
            authorname: req.body.authorname,
            email: req.body.email,
            age: req.body.age,
            password: req.body.password,
            avatar: req.file.filename,
        });
        await newUser
            .save()
            .then((user) => res.json({ message: 'New User Added!', user }))
            .catch((err) => res.status(400).json(`Error:${err}`));
    } catch {
        console.log('Server Error')
    }
}
exports.login = async (req, res) => {
    try {
        const profile = await User.findByCredentials(req.body.email, req.body.password)
        await profile.generateAuthToken()
        const { password, ...user } = profile.toJSON()
        return res.status(200).send({ success: true, message: 'Login Successfully', user })
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ message: 'Incorrect Credentials' })
    }
}
exports.logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        // res.clearCookie('token');
        res.status(200).json({
            success: true,
            message: 'Logout Successfully'
        })
    } catch (e) {
        res.status(500).send()
    }
}
exports.getAllUsers = async (req, res) => {
    try {
        const { pageNo = 0, limit = 10 } = req.query;
        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(parseInt(pageNo) * parseInt(limit))
            .limit(parseInt(limit));

        const postCount = await User.countDocuments()

        res.json({
            users: users.map((user) => ({
                id: user._id,
                authorname: user.authorname,
                email: user.email,
                age: user.age,
                avatar: user.avatar
            })),
            postCount,
        });
    } catch (error) {
        console.log('Server Error')
    }
}
exports.getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!isValidObjectId(userId)) return res.status(401).json({ error: 'Invalid request!' });
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ error: "User not found!" });

        const { authorname, email, age, password, avatar } = user;
        return res.json({
            user: {
                id: user._id,
                authorname,
                email,
                age,
                password,
                avatar,
                // thumbnail: user.thumbnail?.url,
            },
        });
    } catch (error) {
        return res.status(500).send({
            message: "Could't get article. " + error,
        });
    }
};
exports.current_user = async (req, res) => {
    return res.status(200).send({
        message: 'Current user login succesufully!',
        profile: req.user
    })
}
exports.change_password = async (req, res) => {
    try {
        const v = new Validator(req.body, {
            old_password: 'required',
            new_password: 'required',
            confirm_password: 'required|same:new_password',
        });
        const matched = await v.check();
        if (!matched) {
            return res.status(422).send(v.errors)
        }
        let current_user = req.user
        if (bcrypt.compareSync(req.body.old_password, current_user.password)) {
            let hashPassword = bcrypt.hashSync(req.body.new_password, 10);
            let userData = await User.findByIdAndUpdate({ _id: current_user._id, }, { password: hashPassword }, { new: true })
            await userData.save()
            return res.status(200).send({
                message: 'Password Updated Successfully!'
            })
        } else {
            return res.status(400).send({
                message: 'Old Password does not match!',
                data: {}
            })
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message,
            data: error
        })
    }
}
exports.update_profile = async (req, res) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(401).send({ message: 'Not found!' })
        }
        if (user) {
            user.authorname = req.body.authorname || user.authorname;
            user.email = req.body.email || user.email;
            user.age = req.body.age || user.age;
            // if (req.body.password) {
            //     user.password = req.body.password || user.password;
            // }
            let filepath = path.join(__dirname, `../../frontend/src/uploads/profiles/${user?.avatar}`);
            let file = fs.existsSync(filepath)
            if (!file) return res.json({ msg: "File does not exist" })
            fs.unlinkSync(filepath)

            await User.updateOne({ _id: user._id }, {
                authorname: req.body.authorname,
                email: req.body.email,
                age: req.body.age,
                // password: req.body.password,
                avatar: req.file.filename,
            });
            let userData = await User.findOne({ _id: user._id })
            return res.status(200).send({
                message: 'Profile Updated Successfully!',
                data: userData
            })
        }
    } catch (error) {
        return res.status(400).send({
            message: error.message,
            data: error
        })
    }
}
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!isValidObjectId(userId))
            return res.status(401).json({ error: 'Invalid request!' })
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ error: "User not found!" });

        let filepath = path.join(__dirname, `../../frontend/src/uploads/profiles/${user?.avatar}`);
        let file = fs.existsSync(filepath)
        if (!file) return res.json({ msg: "File does not exist" })
        fs.unlinkSync(filepath)
        // const public_id = article.thumbnail?.public_id;
        // if (public_id) {
        //     const { result } = await cloudinary.uploader.destroy(public_id)
        //     if (result !== "ok") return res.status(404).json({ error: 'Could not remove thumbnail' });
        // }
        await User.findByIdAndDelete(userId);
        return res.json({ message: "User removed successfully!" });
    } catch (err) {
        return res.status(500).send({
            message: "Could not delete the file. " + err,
        });
    }
};
