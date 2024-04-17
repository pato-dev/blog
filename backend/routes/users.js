const router = require('express').Router();
const { createUser, getAllUsers, getUser, deleteUser, login, logout, change_password, current_user, update_profile } = require('../controllers/users');
const { isAuthenticated } = require('../middlewares/auth');
const upload = require('../middlewares/profileMulter');

router.post('/register', upload.single("avatar"), createUser);
router.post('/login', login);
router.get('/logout', isAuthenticated, logout);
router.get('/users', getAllUsers);
router.get('/user/:userId', isAuthenticated, getUser);

router.get('/profile', isAuthenticated, current_user);
router.post('/change-password', isAuthenticated, change_password);
router.put('/update-profile', isAuthenticated, upload.single("avatar"), update_profile);
router.delete('/user/delete/:userId', isAuthenticated, deleteUser);

module.exports = router;