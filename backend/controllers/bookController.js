const Book = require('../models/Book');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');
const { saveToMemory, deleteFromMemory } = require('../middleware/upload');
const { createNotification } = require('./notificationController');

// @desc    Get books with filters
// @route   GET /api/books
exports.getBooks = async (req, res, next) => {
    try {
        let query = {};
        const { facultyId, department, academicYear, publicationType, indexedType, search } = req.query;

        if (facultyId) {
            query.facultyId = facultyId;
        }

        // Department filter – get all faculty IDs in department
        if (department || req.user.role === 'hod') {
            const dept = department || req.user.department;
            const facultyIds = await User.find({ department: dept }).distinct('_id');
            query.facultyId = { $in: facultyIds };
        }

        if (academicYear) query.academicYear = academicYear;
        if (publicationType) query.publicationType = publicationType;
        if (indexedType) query.indexedType = indexedType;
        if (search) query.title = { $regex: search, $options: 'i' };

        const records = await Book.find(query)
            .populate('facultyId', 'name department employeeId')
            .sort({ publicationDate: -1 });

        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Get books for a specific faculty
// @route   GET /api/books/faculty/:facultyId
exports.getFacultyBooks = async (req, res, next) => {
    try {
        let query = { facultyId: req.params.facultyId };
        const { academicYear, publicationType, indexedType } = req.query;

        if (academicYear) query.academicYear = academicYear;
        if (publicationType) query.publicationType = publicationType;
        if (indexedType) query.indexedType = indexedType;

        const records = await Book.find(query).sort({ publicationDate: -1 });
        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Add book / chapter
// @route   POST /api/books/:facultyId
exports.addBook = async (req, res, next) => {
    try {
        // Only the faculty member can add their own entries
        if (req.params.facultyId !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only add entries to your own profile' });
        }

        req.body.facultyId = req.params.facultyId;

        if (req.file) {
            const result = saveToMemory(req.file.buffer, 'books', req.file.originalname, req.user.employeeId, req.user.department);
            req.body.fileUrl = result.url;
        }

        const record = await Book.create(req.body);

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'Book',
            targetId: record._id,
            details: `Added book/chapter: ${record.title}`,
        });

        // Notify faculty
        if (req.user._id.toString() !== req.params.facultyId) {
            await createNotification(req.params.facultyId, `New book/chapter added: ${record.title}`, 'Book', '/my-profile');
        }

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Update book / chapter
// @route   PUT /api/books/:id
exports.updateBook = async (req, res, next) => {
    try {
        let record = await Book.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (record.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own entries' });
        }

        if (req.file) {
            if (record.fileUrl) deleteFromMemory(record.fileUrl);
            const result = saveToMemory(req.file.buffer, 'books', req.file.originalname, req.user.employeeId, req.user.department);
            req.body.fileUrl = result.url;
        }

        record = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'Book',
            targetId: record._id,
            details: `Updated book/chapter: ${record.title}`,
        });

        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete book / chapter
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res, next) => {
    try {
        const record = await Book.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (record.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own entries' });
        }

        if (record.fileUrl) deleteFromMemory(record.fileUrl);

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Delete',
            category: 'Book',
            targetId: record._id,
            details: `Deleted book/chapter: ${record.title}`,
        });

        await Book.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
        next(error);
    }
};
