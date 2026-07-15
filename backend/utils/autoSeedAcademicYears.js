const AcademicYear = require('../models/AcademicYear');

/**
 * Auto-manages academic years on every server startup.
 *
 * Seeds from HISTORY_START_YEAR up to current academic year.
 * Deletes any future academic years to prevent displaying them prematurely.
 *
 * Indian academic year: June–May
 *   Month >= 6 → current AY starts this calendar year  (e.g. June 2026 → 2026-27)
 *   Month <  6 → current AY started last calendar year (e.g. Mar  2026 → 2025-26)
 */
const HISTORY_START_YEAR = 2020; // earliest academic year to seed (2020-21)

const makeLabel = (startYear) => {
    const shortNext = String(startYear + 1).slice(-2);
    return `${startYear}-${shortNext}`; // e.g. "2025-26"
};

const autoSeedAcademicYears = async () => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1; // 1-based
        const year  = now.getFullYear();

        // Start year of the CURRENT academic year
        const currentStartYear = month >= 6 ? year : year - 1;

        // Clean up any future years seeded prematurely (e.g., 2027-28 in year 2026)
        const allYears = await AcademicYear.find({});
        for (const yr of allYears) {
            const startY = parseInt(yr.label.split('-')[0]);
            if (startY > currentStartYear) {
                await AcademicYear.deleteOne({ _id: yr._id });
                console.log(`[AcademicYear] Cleaned up premature future year: ${yr.label}`);
            }
        }

        const existingCount = await AcademicYear.countDocuments();

        if (existingCount === 0) {
            // Fresh DB — seed full history up to current year
            const years = [];
            let order = 1;
            for (let y = HISTORY_START_YEAR; y <= currentStartYear; y++) {
                const isActive = y === currentStartYear;
                years.push({ label: makeLabel(y), order: order++, isActive });
            }
            await AcademicYear.insertMany(years);
            console.log(`[AcademicYear] Seeded ${years.length} academic years (${makeLabel(HISTORY_START_YEAR)} → ${makeLabel(currentStartYear)})`);
        } else {
            // DB has data — just ensure current year exists
            const maxOrderDoc = await AcademicYear.findOne().sort({ order: -1 }).select('order').lean();
            let nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 1;

            const label = makeLabel(currentStartYear);
            const exists = await AcademicYear.findOne({ label });
            if (!exists) {
                await AcademicYear.create({ label, order: nextOrder++, isActive: true });
                console.log(`[AcademicYear] Auto-created: ${label}`);
            }
        }
    } catch (err) {
        console.error('[AcademicYear] Auto-seed error:', err.message);
    }
};

module.exports = autoSeedAcademicYears;
