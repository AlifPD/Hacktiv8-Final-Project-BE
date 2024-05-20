const { authentication, restrictAccess } = require('../controllers/authController');
const { createInventoryItem, getAllInventory, getDetailInventory, deleteInventoryItem } = require('../controllers/inventoryController');

const router = require('express').Router();

router.route('/create').post(authentication, restrictAccess('0'), createInventoryItem);

router.route('/detail/all').get(authentication, getAllInventory);

router.route('/detail').get(authentication, getDetailInventory);

router.route('/delete').delete(authentication, restrictAccess('0'), deleteInventoryItem);

module.exports = router;