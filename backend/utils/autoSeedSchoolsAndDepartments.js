const School = require('../models/School');
const Department = require('../models/Department');

const seedSchoolsAndDepartments = async () => {
    try {
        // Check if schools exist
        let soc = await School.findOne({ code: 'SOC' });
        if (!soc) {
            soc = await School.create({
                name: 'School of Computing',
                code: 'SOC',
            });
            console.log('[AutoSeed] Created School of Computing (SOC)');
        }

        let soe = await School.findOne({ code: 'SOE' });
        if (!soe) {
            soe = await School.create({
                name: 'School of Engineering',
                code: 'SOE',
            });
            console.log('[AutoSeed] Created School of Engineering (SOE)');
        }

        // Default departments mapping
        const defaultDepts = [
            { name: 'Computer Science & Engineering', code: 'CSE', schoolId: soc._id },
            { name: 'Artificial Intelligence & Machine Learning', code: 'AIML', schoolId: soc._id },
            { name: 'Artificial Intelligence & Data Science', code: 'AIDS', schoolId: soc._id },
            { name: 'Cyber Security', code: 'CYBER', schoolId: soc._id },
            { name: 'Internet of Things', code: 'IOT', schoolId: soc._id },

            { name: 'Electronics & Communication Engineering', code: 'ECE', schoolId: soe._id },
            { name: 'Electrical & Electronics Engineering', code: 'EEE', schoolId: soe._id },
            { name: 'Mechanical Engineering', code: 'MECH', schoolId: soe._id },
            { name: 'Civil Engineering', code: 'CIVIL', schoolId: soe._id },

            { name: 'Master of Business Administration', code: 'MBA', schoolId: null },
            { name: 'Bachelor of Business Administration', code: 'BBA', schoolId: null },
        ];

        for (const dept of defaultDepts) {
            const exists = await Department.findOne({ code: dept.code });
            if (!exists) {
                await Department.create(dept);
                console.log(`[AutoSeed] Created department ${dept.code}`);
            } else if (!exists.schoolId && dept.schoolId) {
                exists.schoolId = dept.schoolId;
                await exists.save();
            }
        }
    } catch (err) {
        console.error('[AutoSeed] Error seeding schools and departments:', err.message);
    }
};

module.exports = seedSchoolsAndDepartments;
