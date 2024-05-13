const router = require('express').Router();
const { signup, login, authentication, getDetailUser } = require('../controllers/authController');


router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/detail').get(authentication, getDetailUser)

module.exports = router;