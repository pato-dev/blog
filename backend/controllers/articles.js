const Articles = require("../models/articles");
const Answers = require("../models/answer");
const fs = require('fs');
const path = require('path');
const { isValidObjectId } = require('mongoose')

exports.createArticle = async (req, res) => {
    try {
        const user = req.user
        const newPost = new Articles({
            title: req.body.title,
            description: req.body.description,
            articleImage: req.file.filename,
            userId: user._id,
        });
        await newPost
            .save()
            .then((data) => res.json({ message: 'New Article Posted!', data }))
            .catch((err) => res.status(400).json({ error: `Error`, err }));
    } catch (error) {
        res.status(500).send({
            error: "Server error." + error,
        });
    }
};

exports.getArticles = async (req, res) => {
    const { pageNo = 0, limit = 10 } = req.query;
    const articles = await Articles.find({})
        .sort({ createdAt: -1 })
        .populate({ path: 'userId', select: ['authorname', 'avatar'] })
        .skip(parseInt(pageNo) * parseInt(limit))
        .limit(parseInt(limit));
    const postCount = await Articles.countDocuments()
    res.send({ articles, postCount })
};

exports.getArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        if (!isValidObjectId(articleId)) return res.status(401).json({ error: 'Invalid request!' });

        const post = await Articles.findById(articleId).populate({ path: 'userId', select: ['authorname'] });
        if (!post)
            return res.status(404).json({ error: "Post not found!" });

        const { title, description, articleImage } = post;
        return res.json({
            article: {
                id: post._id,
                title,
                description,
                articleImage,
                authorname: post.userId.authorname
            },
        });
    } catch (error) {
        return res.status(500).send({
            message: "Could't get article. " + error,
        });
    }
};
exports.updateArticle = async (req, res) => {
    try {
        const user = req.user
        const { articleId } = req.params;
        const post = await Articles.findById(articleId);
        if (user._id.toString() !== post.userId.toString()) {
            return res.status(404).json({ error: "Not Authorized!" });
        }
        if (post) {
            post.title = req.body.title || post.title;
            post.description = req.body.description || post.description;
            post.articleImage = req.body.articleImage || post.articleImage;

            const updatedPost = await Articles.updateOne({ _id: post._id }, {
                title: req.body.title,
                description: req.body.description,
                articleImage: req.file.filename,
            });
            if (!updatedPost) {
                return
            }
            let filepath = path.join(__dirname, `../../frontend/src/uploads/postImages/${post?.articleImage}`);
            let file = fs.existsSync(filepath)
            if (!file) return res.json({ message: "File does not exist" })
            fs.unlinkSync(filepath)

            const data = await Articles.findOne({ _id: post._id })
            return res.status(200).send({
                message: 'Article Updated Successfully!', data
            })
        }
    } catch (error) {
        res.status(500).send({
            error: "Server Error", error,
        });
    }
};
exports.searchArticle = async (req, res) => {
    try {
        const { title } = req.query;
        if (!title.trim())
            return res.status(401).json({ error: 'Search query is missing!' });

        const posts = await Articles.find({ title: { $regex: title, $options: 'i' } }).populate({ path: 'userId', select: ['authorname'] });
        res.json({
            post: posts.map((post) => ({
                id: post._id,
                title: post.title,
                description: post.description,
                authorname: post.userId.authorname,
            })),
        });
    } catch (error) {
        res.status(500).send({
            message: "No article with given tittle found!. " + error,
        });
    }
};
exports.getRelatedArticle = async (req, res) => {
    const { articleId } = req.params;
    if (!isValidObjectId(articleId)) return res.status(401).json({ error: 'Invalid request!' });
    const post = await Articles.findById(articleId)
    if (!post) return res.status(404).json({ error: 'Post not found!' });
    const relatedPosts = await Articles.find({
        // tags: { $in: [...post.tags] },
        _id: { $ne: post._id },
    })
        .populate({ path: 'userId', select: ['authorname'] })
        .sort("-createdAt") // or .sort({cratedAt: -1})
        .limit(5)
    res.json({
        posts: relatedPosts.map((post) => ({
            id: post._id,
            title: post.title,
            description: post.description,
            authorname: post.userId.authorname
        })),
    });
};
exports.likeArticle = async (req, res) => {
    try {
        const article = await Articles.findOne(req.params.id);
        console.log(article)
        if (!article.likes.includes(req.body.userId)) {
            const like = await article.updateOne({ $push: { likes: req.body.userId } })
            return res.status(200).send({
                message: 'This article has been liked',
                like
            })
        }
        else {
            const like = await article.updateOne({ $pull: { likes: req.body.userId } })
            return res.status(200).send({
                message: 'This article has been disliked',
                like
            })
        }
    } catch (error) {
        return res.status(500).json(error)
    }
}
exports.deleteArticle = async (req, res) => {
    try {
        const user = req.user
        const { articleId } = req.params;
        if (!isValidObjectId(articleId))
            return res.status(401).json({ error: 'Invalid request!' })
        const post = await Articles.findById(articleId);
        if (!post) return res.status(404).json({ error: "Post not found!" });

        if (user._id.toString() !== post.userId.toString()) {
            return res.status(404).json({ error: "Not Authorized!" });
        }

        let filepath = path.join(__dirname, `../../frontend/src/uploads/postImages/${post?.articleImage}`);
        let file = fs.existsSync(filepath)
        if (!file) return res.json({ message: "File does not exist", name: req.params.name })
        fs.unlinkSync(filepath)

        // const public_id = article.thumbnail?.public_id;
        // if (public_id) {
        //     const { result } = await cloudinary.uploader.destroy(public_id)
        //     if (result !== "ok") return res.status(404).json({ error: 'Could not remove thumbnail' });
        // }
        await Articles.findByIdAndDelete(articleId);
        await Answers.deleteMany({ articleId })
        return res.json({ message: "Post removed successfully!" });
    } catch (err) {
        return res.status(500).send({
            error: "Server Error", err,
        });
    }
};