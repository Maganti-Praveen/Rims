const Publication = require('../models/Publication');
const Patent = require('../models/Patent');
const Workshop = require('../models/Workshop');
const Seminar = require('../models/Seminar');
const Certification = require('../models/Certification');
const Education = require('../models/Education');
const User = require('../models/User');

// @desc    Get rankings ranked by total research upload count
// @route   GET /api/scores/rankings
exports.getRankings = async (req, res, next) => {
    try {
        const faculty = await User.find({ role: { $in: ['faculty', 'hod'] } })
            .select('name department profilePicture employeeId')
            .lean();

        const facultyIds = faculty.map(f => f._id);

        // Batch-fetch counts for all 5 research categories in parallel (education excluded)
        const [allPubs, allPatents, allWorkshops, allSeminars, allCerts] = await Promise.all([
            Publication.find({ facultyId: { $in: facultyIds } }).select('facultyId').lean(),
            Patent.find({ facultyId: { $in: facultyIds } }).select('facultyId').lean(),
            Workshop.find({ facultyId: { $in: facultyIds } }).select('facultyId').lean(),
            Seminar.find({ facultyId: { $in: facultyIds } }).select('facultyId').lean(),
            Certification.find({ facultyId: { $in: facultyIds } }).select('facultyId').lean(),
        ]);

        // Count per faculty using O(n) grouping
        const countByFaculty = (arr) => arr.reduce((acc, item) => {
            const id = item.facultyId.toString();
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});

        const pubCount  = countByFaculty(allPubs);
        const patCount  = countByFaculty(allPatents);
        const wsCount   = countByFaculty(allWorkshops);
        const semCount  = countByFaculty(allSeminars);
        const certCount = countByFaculty(allCerts);

        // Compute total uploads per faculty
        const ranked = faculty.map(f => {
            const id = f._id.toString();
            const counts = {
                publications:   pubCount[id]  || 0,
                patents:        patCount[id]  || 0,
                workshops:      wsCount[id]   || 0,
                seminars:       semCount[id]  || 0,
                certifications: certCount[id] || 0,
            };
            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            return { ...f, score: total, counts };
        });

        // Sort by total uploads descending
        ranked.sort((a, b) => b.score - a.score);

        // College top 5
        const collegeTop5 = ranked.slice(0, 5);

        // Department top 3
        const deptMap = {};
        ranked.forEach(f => {
            if (!deptMap[f.department]) deptMap[f.department] = [];
            if (deptMap[f.department].length < 3) deptMap[f.department].push(f);
        });

        res.json({
            success: true,
            data: { collegeTop5, departmentTop3: deptMap },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get count-based summary for a specific faculty
// @route   GET /api/scores/faculty/:facultyId
exports.getFacultyScore = async (req, res, next) => {
    try {
        const id = req.params.facultyId;
        const [pubs, pats, ws, sems, certs] = await Promise.all([
            Publication.countDocuments({ facultyId: id }),
            Patent.countDocuments({ facultyId: id }),
            Workshop.countDocuments({ facultyId: id }),
            Seminar.countDocuments({ facultyId: id }),
            Certification.countDocuments({ facultyId: id }),
        ]);
        const counts = {
            publications: pubs, patents: pats, workshops: ws,
            seminars: sems, certifications: certs,
        };
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        res.json({ success: true, data: { total, counts } });
    } catch (error) {
        next(error);
    }
};
