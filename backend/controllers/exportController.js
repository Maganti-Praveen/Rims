const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const Publication = require('../models/Publication');
const Book = require('../models/Book');
const Patent = require('../models/Patent');
const Workshop = require('../models/Workshop');
const Seminar = require('../models/Seminar');

// @desc    Export department data as Excel
// @route   GET /api/export/excel
exports.exportExcel = async (req, res, next) => {
    try {
        const { department, academicYear } = req.query;

        let userQuery = { role: { $in: ['faculty', 'hod'] } };
        if (req.user.role === 'hod') {
            userQuery.department = req.user.department;
        } else if (department) {
            userQuery.department = department;
        }

        const faculty = await User.find(userQuery);
        const facultyIds = faculty.map((f) => f._id);

        let entryQuery = { facultyId: { $in: facultyIds } };
        if (academicYear) entryQuery.academicYear = academicYear;

        const [publications, books, patents, workshops] = await Promise.all([
            Publication.find(entryQuery),
            Book.find(entryQuery),
            Patent.find(entryQuery),
            Workshop.find(entryQuery),
        ]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'RCEE RIMS';
        workbook.created = new Date();

        // Summary Sheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
            { header: 'Faculty Name', key: 'name', width: 25 },
            { header: 'Employee ID', key: 'employeeId', width: 15 },
            { header: 'Department', key: 'department', width: 15 },
            { header: 'Publications', key: 'publications', width: 15 },
            { header: 'Books & Chapters', key: 'books', width: 18 },
            { header: 'Patents', key: 'patents', width: 12 },
            { header: 'Workshops', key: 'workshops', width: 12 },
            { header: 'Academic Year', key: 'academicYear', width: 15 },
        ];

        summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16213E' } };

        faculty.forEach((f) => {
            const pubCount = publications.filter((p) => p.facultyId.toString() === f._id.toString()).length;
            const bookCount = books.filter((b) => b.facultyId.toString() === f._id.toString()).length;
            const patCount = patents.filter((p) => p.facultyId.toString() === f._id.toString()).length;
            const wsCount = workshops.filter((w) => w.facultyId.toString() === f._id.toString()).length;

            summarySheet.addRow({
                name: f.name,
                employeeId: f.employeeId,
                department: f.department,
                publications: pubCount,
                books: bookCount,
                patents: patCount,
                workshops: wsCount,
                academicYear: academicYear || 'All',
            });
        });

        // Publications Sheet
        const pubSheet = workbook.addWorksheet('Publications');
        pubSheet.columns = [
            { header: 'Faculty', key: 'faculty', width: 25 },
            { header: 'Title', key: 'title', width: 40 },
            { header: 'Journal', key: 'journal', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Indexed', key: 'indexed', width: 12 },
            { header: 'Year', key: 'year', width: 12 },
        ];
        pubSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        pubSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F3460' } };

        publications.forEach((p) => {
            const fac = faculty.find((f) => f._id.toString() === p.facultyId.toString());
            pubSheet.addRow({
                faculty: fac ? fac.name : 'Unknown',
                title: p.title,
                journal: p.journalName || '',
                type: p.publicationType || '',
                indexed: p.indexedType || '',
                year: p.academicYear || '',
            });
        });

        // Books & Chapters Sheet
        const bookSheet = workbook.addWorksheet('Books & Chapters');
        bookSheet.columns = [
            { header: 'Faculty', key: 'faculty', width: 25 },
            { header: 'Title', key: 'title', width: 40 },
            { header: 'Publisher / Journal', key: 'journal', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'ISBN / ISSN', key: 'isbn', width: 18 },
            { header: 'Indexed', key: 'indexed', width: 12 },
            { header: 'Year', key: 'year', width: 12 },
        ];
        bookSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        bookSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F3460' } };

        books.forEach((b) => {
            const fac = faculty.find((f) => f._id.toString() === b.facultyId.toString());
            bookSheet.addRow({
                faculty: fac ? fac.name : 'Unknown',
                title: b.title,
                journal: b.journalName || '',
                type: b.publicationType || '',
                isbn: b.issn || '',
                indexed: b.indexedType || '',
                year: b.academicYear || '',
            });
        });

        // Patents Sheet
        const patSheet = workbook.addWorksheet('Patents');
        patSheet.columns = [
            { header: 'Faculty', key: 'faculty', width: 25 },
            { header: 'Title', key: 'title', width: 40 },
            { header: 'Patent No.', key: 'patentNumber', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Year', key: 'year', width: 12 },
        ];
        patSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        patSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F3460' } };

        patents.forEach((p) => {
            const fac = faculty.find((f) => f._id.toString() === p.facultyId.toString());
            patSheet.addRow({
                faculty: fac ? fac.name : 'Unknown',
                title: p.title,
                patentNumber: p.patentNumber || '',
                status: p.status || '',
                year: p.academicYear || '',
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=rdms_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

// @desc    Export faculty profile as PDF
// @route   GET /api/export/pdf/:facultyId
exports.exportPDF = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.facultyId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (req.user.role === 'hod' && user.department !== req.user.department)
            return res.status(403).json({ success: false, message: 'Not authorized' });

        const { academicYear } = req.query;   // optional year filter
        const yearQuery = academicYear ? { facultyId: user._id, academicYear } : { facultyId: user._id };

        const [education, certifications, publications, books, patents, workshops, seminars] = await Promise.all([
            Education.find({ facultyId: user._id }),              // always all
            Certification.find({ facultyId: user._id }),          // always all
            Publication.find(yearQuery),
            Book.find(yearQuery),
            Patent.find(yearQuery),
            Workshop.find(yearQuery),
            Seminar.find(yearQuery),
        ]);

        const doc = new PDFDocument({ margin: 0, size: 'A4', autoFirstPage: true });
        res.setHeader('Content-Type', 'application/pdf');
        const safeName = (user.name || 'faculty').replace(/\s+/g, '_');
        const safeEmpId = (user.employeeId || 'EMP').replace(/\s+/g, '_');
        const safeYear = academicYear ? `_${academicYear.replace(/\//g, '-')}` : '';
        res.setHeader('Content-Disposition',
`attachment; filename=${safeEmpId}_${safeName}${safeYear}_profile.pdf`);
        doc.pipe(res);

        // â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const PAGE_W = doc.page.width;   // 595.28
        const PAGE_H = doc.page.height;  // 841.89
        const L = 40;               // left margin
        const R = PAGE_W - 40;      // right edge
        const CW = R - L;            // content width  515
        const NAVY = '#1e3a5f';
        const NAVY2 = '#254a7a';
        const BLUE_LT = '#aed6f1';
        const WHITE = '#ffffff';
        const LIGHT = '#f0f4f8';
        const ALTROW = '#f7fafc';
        const DARK = '#2c3e50';
        const GREY = '#7f8c8d';
        const RED = '#c0392b';
        const BODYBOT = PAGE_H - 50;      // last safe y before footer

        const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
        const safe = (v) => (v === null || v === undefined || v === '') ? '-' : String(v);

        let pageNum = 1;

        // â”€â”€ Letterhead â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const drawHeader = () => {
            // Taller navy bar so logo has breathing room
            doc.rect(0, 0, PAGE_W, 95).fill(NAVY);

            // Logo — fit into a wider horizontal area so it's clearly visible
            try {
                const path = require('path');
                const fs = require('fs');
                const logo = path.join(__dirname, '../../frontend/src/assets/rcee.png');
                if (fs.existsSync(logo)) {
                    // fit: [W, H] scales proportionally to fill width=80, max height=72
                    doc.image(logo, L, 11, { fit: [80, 72], align: 'center', valign: 'center' });
                }
            } catch (_) { }

            const tx = L + 92;   // shifted right to give logo 80px + 12px gap
            doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(14)
                .text('RCEE RIMS — Research Information Management System', tx, 16, { width: CW - 98 });
            doc.font('Helvetica').fontSize(9).fillColor(BLUE_LT)
                .text('Faculty Research Profile  |  Confidential Document', tx, 38, { width: CW - 98 });
            const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
            doc.fontSize(8).fillColor(BLUE_LT)
                .text(`Generated: ${today}`, tx, 54, { width: CW - 98 });

            doc.y = 100;
        };

        // â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const drawFooter = () => {
            const fy = PAGE_H - 32;
            doc.rect(0, fy, PAGE_W, 32).fill(NAVY);
            doc.fillColor(BLUE_LT).font('Helvetica').fontSize(7.5)
                .text(`RCEE RIMS  |  ${user.name}  |  ${user.department}  |  ${user.employeeId}`, L, fy + 10, { width: CW - 60 });
            doc.text(`Page ${pageNum}`, 0, fy + 10, { width: PAGE_W - L, align: 'right' });
        };

        // â”€â”€ New page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const newPage = () => {
            drawFooter();
            pageNum++;
            doc.addPage();
            drawHeader();
        };

        const checkY = (needed = 30) => { if (doc.y + needed > BODYBOT) newPage(); };

        // â”€â”€ Section heading bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const section = (title) => {
            checkY(40);
            doc.moveDown(0.4);
            const sy = doc.y;
            doc.rect(L, sy, CW, 20).fill(NAVY);
            doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(9.5)
                .text(title.toUpperCase(), L + 8, sy + 6, { width: CW - 10, lineBreak: false });
            doc.y = sy + 26;
        };

        // â”€â”€ Table: header + rows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        //   cols   â€” array of strings
        //   widths â€” array of numbers (must sum to CW)
        //   isHdr  â€” true for header row
        let _alt = false;
        const tblReset = () => { _alt = false; };

        const tblRow = (cols, widths, isHdr = false) => {
            const ROW_H = 17;
            checkY(ROW_H + 2);
            const ry = doc.y;
            const bg = isHdr ? NAVY : (_alt ? ALTROW : WHITE);
            doc.rect(L, ry, CW, ROW_H).fill(bg);

            // thin horizontal border
            if (!isHdr) {
                doc.rect(L, ry, CW, ROW_H).stroke('#e2e8f0');
                _alt = !_alt;
            }

            const clr = isHdr ? WHITE : DARK;
            const font = isHdr ? 'Helvetica-Bold' : 'Helvetica';
            doc.fillColor(clr).font(font).fontSize(8);

            let cx = L;
            cols.forEach((col, i) => {
                doc.text(safe(col), cx + 4, ry + 5, {
                    width: widths[i] - 8,
                    height: ROW_H - 6,
                    ellipsis: true,
                    lineBreak: false,
                });
                cx += widths[i];
            });
            if (isHdr) { _alt = false; }
            doc.y = ry + ROW_H;
        };

        // â”€â”€ Info grid (two columns, absolute positioning) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        //   pairs: [ [label, value], [label, value] ]   â€” one pair per column
        const infoGrid = (pairs) => {
            const ROW_H = 20;
            checkY(ROW_H + 4);
            const gy = doc.y;
            const colW = CW / 2;

            // Draw backgrounds
            doc.rect(L, gy, colW - 4, ROW_H).fill(LIGHT);
            doc.rect(L + colW, gy, colW, ROW_H).fill(ALTROW);

            // Left column
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor(NAVY)
                .text(safe(pairs[0][0]) + ':', L + 5, gy + 6, { width: 95, lineBreak: false });
            doc.font('Helvetica').fontSize(8.5).fillColor(DARK)
                .text(safe(pairs[0][1]), L + 102, gy + 6, { width: colW - 110, lineBreak: false, ellipsis: true });

            // Right column
            if (pairs[1]) {
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor(NAVY)
                    .text(safe(pairs[1][0]) + ':', L + colW + 5, gy + 6, { width: 95, lineBreak: false });
                doc.font('Helvetica').fontSize(8.5).fillColor(DARK)
                    .text(safe(pairs[1][1]), L + colW + 102, gy + 6, { width: colW - 110, lineBreak: false, ellipsis: true });
            }

            doc.y = gy + ROW_H + 3;
        };

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // BUILD DOCUMENT
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        drawHeader();

        // -- Name block (with profile photo on the right) --
        const PHOTO_SIZE = 58;
        const NAME_H = 64;
        const ny = doc.y;
        doc.rect(L, ny, CW, NAME_H).fill(LIGHT);
        doc.rect(L, ny, 4, NAME_H).fill(RED);   // accent bar

        // Try to load profile photo from URL
        let photoLoaded = false;
        const photoX = R - PHOTO_SIZE - 8;
        const photoY = ny + (NAME_H - PHOTO_SIZE) / 2;
        const photoCX = photoX + PHOTO_SIZE / 2;
        const photoCY = photoY + PHOTO_SIZE / 2;

        // Profile picture is stored locally at memory/uploads/*
        // URL format: /uploads/profiles/filename.jpg
        // Physical path: <root>/memory/uploads/profiles/filename.jpg
        if (user.profilePicture) {
            try {
                const fs_ = require('fs');
                const path_ = require('path');
                // Strip leading /uploads/ and resolve against the memory directory
                const relPath = user.profilePicture.replace(/^\/uploads\//, '');
                const rootDir = path_.join(__dirname, '..', '..', 'memory');
                const fullPath = path_.join(rootDir, relPath);
                if (fs_.existsSync(fullPath)) {
                    const buf = fs_.readFileSync(fullPath);
                    doc.save();
                    doc.circle(photoCX, photoCY, PHOTO_SIZE / 2).clip();
                    doc.image(buf, photoX, photoY, { width: PHOTO_SIZE, height: PHOTO_SIZE });
                    doc.restore();
                    // Thin circle border
                    doc.circle(photoCX, photoCY, PHOTO_SIZE / 2).lineWidth(1.5).stroke(NAVY);
                    photoLoaded = true;
                }
            } catch (_) { /* photo is optional */ }
        }

        // Fallback: coloured circle with initial
        if (!photoLoaded) {
            doc.circle(photoCX, photoCY, PHOTO_SIZE / 2).fill(NAVY2);
            doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(22)
                .text(
                    (user.name || 'U').charAt(0).toUpperCase(),
                    photoX, photoCY - 13,
                    { width: PHOTO_SIZE, align: 'center', lineBreak: false }
                );
        }

        // Text left side
        const nameTextW = CW - PHOTO_SIZE - 32;
        doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(15)
            .text(user.name, L + 12, ny + 8, { width: nameTextW, lineBreak: false });
        doc.font('Helvetica').fontSize(9).fillColor(GREY)
            .text(
                `${user.department || ""}   |   ${(user.role || "").toUpperCase()}   |   Emp ID: ${user.employeeId || ""}`,
                L + 12, ny + 28, { width: nameTextW, lineBreak: false }
            );
        if (user.email) {
            doc.font('Helvetica').fontSize(8).fillColor('#5d6d7e')
                .text(user.email, L + 12, ny + 46, { width: nameTextW, lineBreak: false, ellipsis: true });
        }
        doc.y = ny + NAME_H + 4;

        // â”€â”€ Stats strip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const sty = doc.y;
        const sw = CW / 7;
        const statData = [
            ['Publications', publications.length],
            ['Books/Chapters', books.length],
            ['Patents', patents.length],
            ['Workshops', workshops.length],
            ['Seminars', seminars.length],
            ['Certifications', certifications.length],
            ['Education', education.length],
        ];
        statData.forEach(([lbl, cnt], i) => {
            const sx = L + i * sw;
            doc.rect(sx, sty, sw, 34).fill(i % 2 === 0 ? NAVY : NAVY2);
            doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(15)
                .text(String(cnt), sx, sty + 3, { width: sw, align: 'center', lineBreak: false });
            doc.font('Helvetica').fontSize(6.5).fillColor(BLUE_LT)
                .text(lbl, sx, sty + 21, { width: sw, align: 'center', lineBreak: false });
        });
        doc.y = sty + 42;

        // â”€â”€ Basic Information â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        section('Basic Information');
        infoGrid([['Email', user.email], ['Mobile', user.mobileNumber]]);
        infoGrid([['Domain / Specialization', user.domain], ['Joining Date', fmtDate(user.joiningDate)]]);
        infoGrid([['Official Email', user.officialEmail], [null, null]]);

        // Address in its own full-width row so long text can wrap
        if (user.address) {
            checkY(35);
            const ay = doc.y;
            doc.rect(L, ay, CW, 28).fill(ALTROW);
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor(NAVY)
                .text('Address:', L + 5, ay + 5, { width: 60, lineBreak: false });
            doc.font('Helvetica').fontSize(8.5).fillColor(DARK)
                .text(safe(user.address), L + 68, ay + 5, { width: CW - 75, lineBreak: true, height: 22, ellipsis: true });
            doc.y = ay + 32;
        }

        // Research IDs
        const rids = [];
        if (user.orcidId) rids.push(['ORCID ID', user.orcidId]);
        if (user.googleScholarUrl) rids.push(['Google Scholar', user.googleScholarUrl]);
        if (user.scopusAuthorId) rids.push(['Scopus Author ID', user.scopusAuthorId]);
        if (user.vidhwanId) rids.push(['Vidwan ID', user.vidhwanId]);
        if (rids.length > 0) {
            checkY(12 + rids.length * 14);
            doc.moveDown(0.4);
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor(NAVY).text('Research Profile Links:', L, doc.y);
            doc.moveDown(0.2);
            rids.forEach(([lbl, val]) => {
                doc.font('Helvetica').fontSize(8).fillColor('#1a5276')
                    .text(`  - ${lbl}: ${safe(val)}`, L + 8, doc.y, { width: CW - 10, lineBreak: false, ellipsis: true });
                doc.moveDown(0.25);
            });
        }

        // â”€â”€ Education â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        section('Education');
        if (education.length > 0) {
            const w = [120, 175, 150, 70];
            tblReset();
            tblRow(['Degree', 'University / Institution', 'Specialization', 'Year'], w, true);
            education.forEach(e => tblRow([e.degree, e.university, e.specialization, e.year], w));
        } else {
            doc.font('Helvetica').fontSize(9).fillColor(GREY).text('  No education records added.', L + 4, doc.y); doc.moveDown(0.4);
        }

        // ── Certifications ──
        section('Certifications');
        if (certifications.length > 0) {
            const w = [135, 95, 75, 70, 70, 70];
            tblReset();
            tblRow(['Title', 'Issued By', 'Type', 'Enroll Date', 'Issued Date', 'Credential ID'], w, true);
            certifications.forEach(c => tblRow([c.title, c.issuedBy, c.certificateType || '-', fmtDate(c.enrollDate), fmtDate(c.issuedDate || c.date), c.credentialId || '-'], w));
        } else {
            doc.font('Helvetica').fontSize(9).fillColor(GREY).text('  No certifications added.', L + 4, doc.y); doc.moveDown(0.4);
        }

        // ── Publications ──
        section('Publications');
        if (publications.length > 0) {
            const w = [190, 100, 65, 55, 105];
            tblReset();
            tblRow(['Title', 'Journal / Venue', 'Type', 'Indexed', 'Acad. Year'], w, true);
            publications.forEach(p => {
                tblRow([p.title, p.journalName, p.publicationType, p.indexedType, p.academicYear], w);
                if (p.doi || p.issn || (p.indexedType === 'IEEE Conference' && p.conferenceDate)) {
                    checkY(12);
                    const sub = [
                        p.doi && `DOI: ${p.doi}`,
                        p.issn && `ISSN: ${p.issn}`,
                        p.indexedType === 'IEEE Conference' && p.conferenceDate && `Conf Date: ${fmtDate(p.conferenceDate)}`
                    ].filter(Boolean).join('   |   ');
                    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(GREY)
                        .text(`     ${sub}`, L + 6, doc.y, { width: CW - 10, lineBreak: false, ellipsis: true });
                    doc.moveDown(0.2);
                }
            });
        } else {
            doc.font('Helvetica').fontSize(9).fillColor(GREY).text('  No publications added.', L + 4, doc.y); doc.moveDown(0.4);
        }

        // ── Books & Chapters ──
        section('Books & Chapters');
        if (books.length > 0) {
            const w = [190, 100, 65, 55, 105];
            tblReset();
            tblRow(['Title', 'Publisher / Journal', 'Type', 'ISBN / ISSN', 'Acad. Year'], w, true);
            books.forEach(b => {
                tblRow([b.title, b.journalName, b.publicationType, b.issn, b.academicYear], w);
                if (b.doi) {
                    checkY(12);
                    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(GREY)
                        .text(`     DOI: ${b.doi}`, L + 6, doc.y, { width: CW - 10, lineBreak: false, ellipsis: true });
                    doc.moveDown(0.2);
                }
            });
        } else {
            doc.font('Helvetica').fontSize(9).fillColor(GREY).text('  No books or chapters added.', L + 4, doc.y); doc.moveDown(0.4);
        }

        // ── Patents ──
        section('Patents');
        if (patents.length > 0) {
            const w = [185, 100, 65, 95, 70];
            tblReset();
            tblRow(['Title', 'Patent No.', 'Status', 'Filing Date', 'Acad. Year'], w, true);
            patents.forEach(p => tblRow([p.title, p.patentNumber, p.status, fmtDate(p.filingDate), p.academicYear], w));
        } else {
            doc.font('Helvetica').fontSize(9).fillColor(GREY).text('  No patents added.', L + 4, doc.y); doc.moveDown(0.4);
        }

        // ── Workshops ──
        section('Workshops & FDPs');
        if (workshops.length > 0) {
            const w = [150, 115, 60, 60, 50, 80];
            tblReset();
            tblRow(['Title', 'Institution', 'Role', 'Mode', 'Duration', 'Date'], w, true);
            workshops.forEach(ws => tblRow([ws.title, ws.institution, ws.role, ws.mode || '-', ws.durationDays || '-', fmtDate(ws.date)], w));
        } else {
            doc.font('Helvetica').fontSize(9).fillColor(GREY).text('  No workshops added.', L + 4, doc.y); doc.moveDown(0.4);
        }

        // ── Seminars ──
        section('Seminars & Conferences');
        if (seminars.length > 0) {
            const w = [170, 130, 65, 65, 85];
            tblReset();
            tblRow(['Topic', 'Institution', 'Role', 'Mode', 'Date'], w, true);
            seminars.forEach(s => tblRow([s.topic, s.institution, s.role, s.mode || '-', fmtDate(s.date)], w));
        } else {
            doc.font('Helvetica').fontSize(9).fillColor(GREY).text('  No seminars added.', L + 4, doc.y); doc.moveDown(0.4);
        }

        drawFooter();
        doc.end();
    } catch (error) {
        next(error);
    }
};


// @desc    Export NAAC-formatted report
// @route   GET /api/export/naac
exports.exportNAAC = async (req, res, next) => {
    try {
        const { department, academicYear } = req.query;

        let userQuery = { role: { $in: ['faculty', 'hod'] } };
        if (req.user.role === 'hod') {
            userQuery.department = req.user.department;
        } else if (department) {
            userQuery.department = department;
        }

        const faculty = await User.find(userQuery);
        const facultyIds = faculty.map((f) => f._id);
        const facultyMap = {};
        faculty.forEach((f) => { facultyMap[f._id.toString()] = f; });

        let entryQuery = { facultyId: { $in: facultyIds } };
        if (academicYear) entryQuery.academicYear = academicYear;

        const [publications, patents, workshops, seminars] = await Promise.all([
            Publication.find(entryQuery).populate('facultyId', 'name department').lean(),
            Patent.find(entryQuery).populate('facultyId', 'name department').lean(),
            Workshop.find(entryQuery).populate('facultyId', 'name department').lean(),
            Seminar.find(entryQuery).populate('facultyId', 'name department').lean(),
        ]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'RCEE RIMS - NAAC Report';
        workbook.created = new Date();

        const headerStyle = { font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }, alignment: { horizontal: 'center', wrapText: true } };

        // --- Criterion 3.4.3: Publications ---
        const pubSheet = workbook.addWorksheet('3.4.3 Publications');
        pubSheet.columns = [
            { header: 'S.No', key: 'sno', width: 6 },
            { header: 'Title of Paper', key: 'title', width: 35 },
            { header: 'Name of Author(s)', key: 'author', width: 25 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Name of Journal', key: 'journal', width: 30 },
            { header: 'Year of Publication', key: 'year', width: 15 },
            { header: 'ISSN Number', key: 'issn', width: 15 },
            { header: 'Indexed In', key: 'indexed', width: 15 },
            { header: 'Link to Article/DOI', key: 'doi', width: 25 },
        ];
        pubSheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
        publications.forEach((pub, i) => {
            pubSheet.addRow({
                sno: i + 1,
                title: pub.title,
                author: pub.facultyId?.name || '',
                department: pub.facultyId?.department || '',
                journal: pub.journalName || '',
                year: pub.academicYear || '',
                issn: pub.issnNumber || '',
                indexed: pub.indexedType || '',
                doi: pub.doi || pub.fileUrl || '',
            });
        });

        // --- Criterion 3.4.4: Patents ---
        const patSheet = workbook.addWorksheet('3.4.4 Patents');
        patSheet.columns = [
            { header: 'S.No', key: 'sno', width: 6 },
            { header: 'Title of Patent', key: 'title', width: 35 },
            { header: 'Name of Patentee(s)', key: 'patentee', width: 25 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Patent Number', key: 'patentNo', width: 18 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Filing Date', key: 'filingDate', width: 15 },
            { header: 'Academic Year', key: 'year', width: 15 },
        ];
        patSheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
        patents.forEach((pat, i) => {
            patSheet.addRow({
                sno: i + 1,
                title: pat.title,
                patentee: pat.facultyId?.name || '',
                department: pat.facultyId?.department || '',
                patentNo: pat.patentNumber || '',
                status: pat.status || '',
                filingDate: pat.filingDate ? new Date(pat.filingDate).toLocaleDateString('en-IN') : '',
                year: pat.academicYear || '',
            });
        });

        // --- Criterion 3.4.5: Workshops/Seminars ---
        const wsSheet = workbook.addWorksheet('3.4.5 Workshops & Seminars');
        wsSheet.columns = [
            { header: 'S.No', key: 'sno', width: 6 },
            { header: 'Title/Topic', key: 'title', width: 35 },
            { header: 'Name of Faculty', key: 'faculty', width: 25 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Type', key: 'type', width: 12 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Institution/Venue', key: 'institution', width: 25 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Academic Year', key: 'year', width: 15 },
        ];
        wsSheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
        let sno = 1;
        workshops.forEach((ws) => {
            wsSheet.addRow({
                sno: sno++,
                title: ws.title,
                faculty: ws.facultyId?.name || '',
                department: ws.facultyId?.department || '',
                type: 'Workshop',
                role: ws.role || '',
                institution: ws.institution || '',
                date: ws.date ? new Date(ws.date).toLocaleDateString('en-IN') : '',
                year: ws.academicYear || '',
            });
        });
        seminars.forEach((sem) => {
            wsSheet.addRow({
                sno: sno++,
                title: sem.topic,
                faculty: sem.facultyId?.name || '',
                department: sem.facultyId?.department || '',
                type: 'Seminar',
                role: sem.role || '',
                institution: sem.institution || '',
                date: sem.date ? new Date(sem.date).toLocaleDateString('en-IN') : '',
                year: sem.academicYear || '',
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=NAAC_Report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};
