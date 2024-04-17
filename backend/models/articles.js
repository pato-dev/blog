const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    // articleImage: {
    //     type: Object,
    //     url: {
    //         type: URL,
    //     },
    //     public_id: {
    //         type: String,
    //     }
    // },
    articleImage: {
        type: String
    },
    likes: {
        type: Array,
        default: []
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
}, {
    timestamps: true
});
module.exports = Articles = mongoose.model("Articles", articleSchema);