const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const School = require('./models/School');
const Department = require('./models/Department');

dotenv.config();

const createAccounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas');

        // Fetch SOC and SOE schools
        const soc = await School.findOne({ code: 'SOC' });
        const soe = await School.findOne({ code: 'SOE' });
        const cseDept = await Department.findOne({ code: 'CSE' });
        const eceDept = await Department.findOne({ code: 'ECE' });

        const accounts = [
            {
                name: 'Dean SOC (School of Computing)',
                employeeId: 'DEANSOC001',
                email: 'deansoc@gmail.com',
                password: 'Sai@1234',
                role: 'dean',
                designation: 'Dean SOC',
                department: 'CSE',
                departmentId: cseDept?._id || null,
                schoolId: soc?._id || null,
            },
            {
                name: 'Dean SOE (School of Engineering)',
                employeeId: 'DEANSOE001',
                email: 'deansoe@gmail.com',
                password: 'Sai@1234',
                role: 'dean',
                designation: 'Dean SOE',
                department: 'ECE',
                departmentId: eceDept?._id || null,
                schoolId: soe?._id || null,
            },
            {
                name: 'HOD CSE',
                employeeId: 'HODCSE001',
                email: 'hodcse@gmail.com',
                password: 'Sai@1234',
                role: 'hod',
                designation: 'Head of the Department',
                department: 'CSE',
                departmentId: cseDept?._id || null,
            },
            {
                name: 'CSE Staff Member',
                employeeId: 'STAFFCSE001',
                email: 'staffcse@gmail.com',
                password: 'Sai@1234',
                role: 'faculty',
                designation: 'Assistant Professor',
                department: 'CSE',
                departmentId: cseDept?._id || null,
            },
        ];

        for (const acc of accounts) {
            // Remove existing user with same email or employeeId if any
            await User.deleteMany({ $or: [{ email: acc.email }, { employeeId: acc.employeeId }] });

            const user = await User.create(acc);
            console.log(`✅ Created Account: ${acc.email} (${acc.role}) — Password: ${acc.password}`);

            // Link dean to school if role is dean
            if (acc.role === 'dean' && acc.schoolId) {
                await School.findByIdAndUpdate(acc.schoolId, { deanId: user._id });
            }

            // Link HOD to department if role is hod
            if (acc.role === 'hod' && acc.departmentId) {
                await Department.findByIdAndUpdate(acc.departmentId, { hodId: user._id });
            }
        }

        console.log('\nAll demo accounts created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error creating demo accounts:', err);
        process.exit(1);
    }
};

createAccounts();
