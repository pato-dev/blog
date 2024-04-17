const router = require('express').Router();
const { createArticle, getArticles, getArticle, updateArticle, searchArticle, deleteArticle, getRelatedArticle, likeArticle } = require('../controllers/articles');
const { isAuthenticated } = require('../middlewares/auth');
const uploadArticle = require('../middlewares/articleMulter')

router.post('/add', isAuthenticated, uploadArticle.single("articleImage"), createArticle);
router.get('/articles', getArticles);
router.get('/article/:articleId', getArticle);
router.put('/article/:articleId/likes', likeArticle);
router.get('/search', searchArticle);
router.get('/related-article/:articleId', getRelatedArticle);
router.put('/update/:articleId', isAuthenticated, uploadArticle.single("articleImage"), updateArticle);
router.delete('/delete/:articleId', isAuthenticated, deleteArticle);

module.exports = router;