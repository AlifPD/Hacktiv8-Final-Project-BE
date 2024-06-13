const { authentication, restrictAccess } = require('../controllers/authController');
const { createNewLoan, getLoan, deleteLoan, editLoan, getLoanDetail } = require('../controllers/loansController');

const router = require('express').Router();

router.route('/create').post(authentication, createNewLoan);
router.route('/history').get(authentication, getLoan);
router.route('/history/detail').get(authentication, getLoanDetail);
router.route('/delete').delete(authentication, restrictAccess('0'), deleteLoan);
router.route('/update').put(authentication, restrictAccess('0'), editLoan);

module.exports = router;