const router = require('express').Router();
const { addAnswer, getAnswers, getAnswer, updateAnswer, deleteAnswer, getRelatedAnswers } = require('../controllers/answers');
const { isAuthenticated } = require('../middlewares/auth');

router.post('/answer/:articleId', isAuthenticated, addAnswer);
router.get('/answers', getAnswers);
router.get('/answer/:answerId', getAnswer);
router.get('/related-answer/:articleId', getRelatedAnswers);
router.put('/answer/update/:answerId', isAuthenticated, updateAnswer);
router.delete('/answer/delete/:answerId', isAuthenticated, deleteAnswer);

module.exports = router;