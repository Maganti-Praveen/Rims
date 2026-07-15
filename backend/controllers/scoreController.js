const Publication = require('../models/Publication');
const Book = require('../models/Book');
const Patent = require('../models/Patent');
const Workshop = require('../models/Workshop');
const Seminar = require('../models/Seminar');
const Certification = require('../models/Certification');
const Education = require('../models/Education');
const User = require('../models/User');
const ScoreConfig = require('../models/ScoreConfig');

// Helper to load configurations and structure it by category and subcategory
const getScoreConfigMap = async () => {
    const configs = await ScoreConfig.find().lean();
    const map = {};
    configs.forEach(c => {
        if (!map[c.category]) map[c.category] = {};
        map[c.category][c.subCategory] = c.points;
    });
    return map;
};

// Points mapping helpers
const getPointsForPub = (pub, configMap) => {
    let subCat = 'Other';
    if (pub.indexedType === 'SCI') subCat = 'SCI Journal';
    else if (pub.indexedType === 'Scopus') subCat = 'Scopus Journal';
    else if (pub.indexedType === 'UGC') subCat = 'UGC Care Journal';
    else if (pub.publicationType === 'Book') subCat = 'Book Publication';
    else if (pub.publicationType === 'Chapter') subCat = 'Book Chapter';
    else if (pub.publicationType === 'Conference') subCat = 'Conference Proceeding';
    
    return configMap['publication']?.[subCat] || 1;
};

const getPointsForBook = (book, configMap) => {
    const subCat = book.publicationType === 'Book' ? 'Book Publication' : 'Book Chapter';
    return configMap['publication']?.[subCat] || 5;
};

const getPointsForPatent = (pat, configMap) => {
    const subCat = pat.status || 'Filed';
    return configMap['patent']?.[subCat] || 1;
};

const getPointsForWorkshop = (ws, configMap) => {
    const subCat = ws.role || 'Attended';
    return configMap['workshop']?.[subCat] || 1;
};

const getPointsForSeminar = (sem, configMap) => {
    let subCat = 'Attended';
    if (sem.role === 'Organized') subCat = 'Organized';
    else if (sem.role && (sem.role.toLowerCase().includes('speaker') || sem.role.toLowerCase().includes('resource'))) subCat = 'Resource Person';
    
    return configMap['seminar']?.[subCat] || 1;
};

const getPointsForCert = (cert, configMap) => {
    let subCat = 'Other';
    const issuer = (cert.issuedBy || '').toLowerCase();
    if (issuer.includes('nptel') || issuer.includes('swayam')) {
        subCat = 'NPTEL / SWAYAM';
    } else if (issuer.includes('aws') || issuer.includes('oracle') || issuer.includes('cisco') || issuer.includes('coursera') || issuer.includes('udemy') || issuer.includes('google')) {
        subCat = 'Global Certification';
    }
    
    return configMap['certification']?.[subCat] || 1;
};

// @desc    Get rankings ranked by research score or upload count
// @route   GET /api/scores/rankings
exports.getRankings = async (req, res, next) => {
    try {
        const { department, academicYear, sortBy = 'score' } = req.query;

        const userQuery = { role: { $in: ['faculty', 'hod'] } };
        if (req.user.role === 'hod') {
            userQuery.department = req.user.department;
        } else if (department) {
            userQuery.department = department;
        }

        const faculty = await User.find(userQuery)
            .select('name department profilePicture employeeId')
            .lean();

        const facultyIds = faculty.map(f => f._id);

        const pubFilter = { facultyId: { $in: facultyIds } };
        const bookFilter = { facultyId: { $in: facultyIds } };
        const patFilter = { facultyId: { $in: facultyIds } };
        const wsFilter  = { facultyId: { $in: facultyIds } };
        const semFilter = { facultyId: { $in: facultyIds } };
        const certFilter = { facultyId: { $in: facultyIds } };

        if (academicYear) {
            pubFilter.academicYear = academicYear;
            bookFilter.academicYear = academicYear;
            patFilter.academicYear = academicYear;
            wsFilter.academicYear = academicYear;
            semFilter.academicYear = academicYear;
        }

        // Batch-fetch counts for all categories in parallel
        const [allPubs, allBooks, allPatents, allWorkshops, allSeminars, allCerts] = await Promise.all([
            Publication.find(pubFilter).select('facultyId indexedType publicationType academicYear').lean(),
            Book.find(bookFilter).select('facultyId indexedType publicationType academicYear').lean(),
            Patent.find(patFilter).select('facultyId status academicYear').lean(),
            Workshop.find(wsFilter).select('facultyId role academicYear').lean(),
            Seminar.find(semFilter).select('facultyId role academicYear').lean(),
            Certification.find(certFilter).select('facultyId issuedBy').lean(),
        ]);

        const configMap = await getScoreConfigMap();

        // Calculate scores and counts per faculty
        const facultyStats = {};
        facultyIds.forEach(id => {
            facultyStats[id.toString()] = {
                score: 0,
                uploadCount: 0,
                counts: {
                    publications: 0,
                    books: 0,
                    patents: 0,
                    workshops: 0,
                    seminars: 0,
                    certifications: 0
                }
            };
        });

        allPubs.forEach(pub => {
            const fid = pub.facultyId.toString();
            if (facultyStats[fid]) {
                const pts = getPointsForPub(pub, configMap);
                facultyStats[fid].score += pts;
                facultyStats[fid].uploadCount += 1;
                facultyStats[fid].counts.publications += 1;
            }
        });

        allBooks.forEach(book => {
            const fid = book.facultyId.toString();
            if (facultyStats[fid]) {
                const pts = getPointsForBook(book, configMap);
                facultyStats[fid].score += pts;
                facultyStats[fid].uploadCount += 1;
                facultyStats[fid].counts.books += 1;
            }
        });

        allPatents.forEach(pat => {
            const fid = pat.facultyId.toString();
            if (facultyStats[fid]) {
                const pts = getPointsForPatent(pat, configMap);
                facultyStats[fid].score += pts;
                facultyStats[fid].uploadCount += 1;
                facultyStats[fid].counts.patents += 1;
            }
        });

        allWorkshops.forEach(ws => {
            const fid = ws.facultyId.toString();
            if (facultyStats[fid]) {
                const pts = getPointsForWorkshop(ws, configMap);
                facultyStats[fid].score += pts;
                facultyStats[fid].uploadCount += 1;
                facultyStats[fid].counts.workshops += 1;
            }
        });

        allSeminars.forEach(sem => {
            const fid = sem.facultyId.toString();
            if (facultyStats[fid]) {
                const pts = getPointsForSeminar(sem, configMap);
                facultyStats[fid].score += pts;
                facultyStats[fid].uploadCount += 1;
                facultyStats[fid].counts.seminars += 1;
            }
        });

        allCerts.forEach(cert => {
            const fid = cert.facultyId.toString();
            if (facultyStats[fid]) {
                const pts = getPointsForCert(cert, configMap);
                facultyStats[fid].score += pts;
                facultyStats[fid].uploadCount += 1;
                facultyStats[fid].counts.certifications += 1;
            }
        });

        const activeSortKey = sortBy === 'uploadCount' ? 'uploadCount' : 'score';

        // Map back to ranked faculty list
        const ranked = faculty.map(f => {
            const stats = facultyStats[f._id.toString()] || {
                score: 0,
                uploadCount: 0,
                counts: { publications: 0, books: 0, patents: 0, workshops: 0, seminars: 0, certifications: 0 }
            };
            return {
                ...f,
                score: stats.score,
                uploadCount: stats.uploadCount,
                counts: stats.counts,
                displayScore: stats[activeSortKey]
            };
        });

        // Sort by selected metric descending
        ranked.sort((a, b) => b[activeSortKey] - a[activeSortKey]);

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

// @desc    Get score and count summary for a specific faculty
// @route   GET /api/scores/faculty/:facultyId
exports.getFacultyScore = async (req, res, next) => {
    try {
        const id = req.params.facultyId;
        const [pubs, books, pats, ws, sems, certs] = await Promise.all([
            Publication.find({ facultyId: id }).lean(),
            Book.find({ facultyId: id }).lean(),
            Patent.find({ facultyId: id }).lean(),
            Workshop.find({ facultyId: id }).lean(),
            Seminar.find({ facultyId: id }).lean(),
            Certification.find({ facultyId: id }).lean(),
        ]);

        const configMap = await getScoreConfigMap();
        
        let score = 0;
        pubs.forEach(p => score += getPointsForPub(p, configMap));
        books.forEach(b => score += getPointsForBook(b, configMap));
        pats.forEach(p => score += getPointsForPatent(p, configMap));
        ws.forEach(w => score += getPointsForWorkshop(w, configMap));
        sems.forEach(s => score += getPointsForSeminar(s, configMap));
        certs.forEach(c => score += getPointsForCert(c, configMap));

        const counts = {
            publications: pubs.length,
            books: books.length,
            patents: pats.length,
            workshops: ws.length,
            seminars: sems.length,
            certifications: certs.length,
        };
        const totalUploads = Object.values(counts).reduce((a, b) => a + b, 0);

        res.json({
            success: true,
            data: {
                total: totalUploads, // total count
                score: score,       // point-based score
                counts
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all score configurations
// @route   GET /api/scores/config
exports.getConfigs = async (req, res, next) => {
    try {
        const configs = await ScoreConfig.find().sort({ category: 1, subCategory: 1 }).lean();
        res.json({ success: true, data: configs });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a score configuration
// @route   PUT /api/scores/config/:id
exports.updateConfig = async (req, res, next) => {
    try {
        const { points } = req.body;
        const config = await ScoreConfig.findByIdAndUpdate(
            req.params.id,
            { points: Number(points) },
            { new: true, runValidators: true }
        );
        if (!config) {
            return res.status(404).json({ success: false, message: 'Configuration not found' });
        }
        res.json({ success: true, data: config });
    } catch (error) {
        next(error);
    }
};
