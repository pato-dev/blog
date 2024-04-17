const Answers = require("../models/answer");
const Articles = require("../models/articles");
const { isValidObjectId } = require('mongoose')

exports.addAnswer = async (req, res) => {
    try {
        const user = req.user
        const { articleId } = req.params;
        const article = await Articles.findById(articleId);
        const newPost = new Answers({
            userId: user._id,
            articleId: article._id,
            answer: req.body.answer,
        });
        await newPost
            .save()
            .then((data) => res.json({ message: 'New Post Added!', data }))
            .catch((err) => res.status(400).json(`Error:${err}`));
    } catch (error) {
        return res.status(500).send({
            error: "Could't add post. ", error,
        });
    }
};
exports.getAnswers = async (req, res) => {
    const { pageNo = 0, limit = 10 } = req.query;
    const answers = await Answers.find({})
        .sort({ createdAt: -1 })
        .populate({ path: 'articleId', select: ['title'] })
        .populate({ path: 'userId', select: ['authorname', 'avatar'] })
        .skip(parseInt(pageNo) * parseInt(limit))
        .limit(parseInt(limit));
    const postCount = await Answers.countDocuments()
    res.send({ answers, postCount })
};
exports.getRelatedAnswers = async (req, res) => {
    try {
        const { pageNo = 0, limit = 10 } = req.query;
        const { articleId } = req.params;
        const article = await Articles.findById(articleId);
        const relatedPost = await Answers.find({ articleId: article._id })
            .populate({ path: 'userId', select: ['authorname', 'avatar'] })
            .sort({ createdAt: -1 })
            .skip(parseInt(pageNo) * parseInt(limit))
            .limit(parseInt(limit));
        const count = await Answers.countDocuments({ articleId: article._id })
        return res.status(200).send({ relatedPost, count });
    } catch (error) {
        return res.status(500).send({ error: "Server Error" })
    }
}
exports.getAnswer = async (req, res) => {
    try {
        const { answerId } = req.params;
        if (!isValidObjectId(answerId)) return res.status(401).json({ error: 'Invalid request!' });
        const answer = await Answers.findById(answerId)
        if (!answer) return res.status(404).json({ error: "Post not found!" });
        return res.json(answer);
    } catch (error) {
        return res.status(500).send({
            error: "Could't get post. ", error,
        });
    }
};
exports.updateAnswer = async (req, res) => {
    try {
        const user = req.user
        const { answerId } = req.params;
        const updates = Object.keys(req.body)
        const post = await Answers.findById(answerId);
        if (user._id.toString() !== post.userId.toString()) return res.status(404).send({ error: "You can only update post created by you!..." });
        updates.forEach((update) => post[update] = req.body[update])
        await post.save()
        return res.status(200).send({ message: "Post updated!", post })
    } catch (e) {
        return res.status(500).send({ error: "Server error", e })
    }
};
exports.deleteAnswer = async (req, res) => {
    try {
        const user = req.user
        const { answerId } = req.params;

        if (!isValidObjectId(answerId))
            return res.status(401).json({ error: 'Invalid request!' })
        const post = await Answers.findById(answerId);
        if (!post) return res.status(404).json({ error: "Post not found!" });

        if (user._id.toString() !== post.userId.toString()) {
            return res.status(404).json({ error: "Not Authorized!" });
        }
        await Answers.findByIdAndDelete(answerId);
        return res.json({ message: "Post removed successfully!" });
    } catch (err) {
        return res.status(500).send({
            error: "Could not delete post. ", err,
        });
    }
};