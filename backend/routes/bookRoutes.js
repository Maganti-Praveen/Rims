const express = require('express');
const router = express.Router();
const { getBooks, getFacultyBooks, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', protect, getBooks);
router.get('/faculty/:facultyId', protect, getFacultyBooks);
router.post('/:facultyId', protect, upload.single('file'), addBook);
router.put('/:id', protect, upload.single('file'), updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
