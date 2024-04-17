const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
    answer: {
        type: String,
        trim: true,
        required: true
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Articles'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

}, {
    timestamps: true
});
module.exports = Answers = mongoose.model("Answers", answerSchema);