const express = require('express');
const router = express.Router();
const { getEmailTemplates, getEmailTemplate, updateEmailTemplate, resetEmailTemplate } = require('../controllers/emailTemplateController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', authorize('super_admin', 'admin'), getEmailTemplates);
router.get('/:key', authorize('super_admin', 'admin'), getEmailTemplate);
router.put('/:key', authorize('super_admin', 'admin'), updateEmailTemplate);
router.post('/:key/reset', authorize('super_admin', 'admin'), resetEmailTemplate);

module.exports = router;
