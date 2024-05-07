const { authentication } = require('../controllers/authController');
const { createNewLoan, getLoan, deleteLoan } = require('../controllers/loansController');

const router = require('express').Router();

router.route('/create').post(authentication, createNewLoan);
router.route('/history').get(authentication, getLoan);
router.route('/delete').delete(authentication, restrictAccess('0'), deleteLoan);

module.exports = router;