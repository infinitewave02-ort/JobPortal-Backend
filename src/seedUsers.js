import { db, auth } from './config/firebase.js';

const seedUsers = async () => {
    try {
        console.log('Starting to seed users from 101 to 1000...');
        let employeeCount = 0;
        let employerCount = 0;

        for (let i = 101; i <= 1000; i++) {
            const role = i % 2 === 0 ? 'employee' : 'employer';
            const email = `${role}${i}@example.com`;
            const password = 'password123';
            const fullName = `${role === 'employee' ? 'Employee' : 'Employer'} ${i}`;
            const uidStr = `${i}`;

            let userRecord;
            try {
                // Check if user already exists in Auth to avoid errors
                try {
                    userRecord = await auth.getUser(uidStr);
                } catch (e) {
                    if (e.code === 'auth/user-not-found') {
                        // Create in Firebase Auth
                        userRecord = await auth.createUser({
                            uid: uidStr,
                            email,
                            password,
                            displayName: fullName,
                        });
                    } else {
                        throw e;
                    }
                }
                
                // Add to Firestore Users collection
                const userData = {
                    uid: uidStr,
                    email,
                    name: fullName,
                    role,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await db.collection('users').doc(uidStr).set(userData);

                // Add to specific role collection
                if (role === 'employee') {
                    const employeeData = {
                        uid: uidStr,
                        name: fullName,
                        email,
                        openToWork: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    await db.collection('employees').doc(uidStr).set(employeeData);
                    employeeCount++;
                } else {
                    const employerData = {
                        uid: uidStr,
                        name: fullName,
                        email,
                        companyName: `Company ${i}`,
                        status: 'approved',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    await db.collection('employers').doc(uidStr).set(employerData);
                    employerCount++;
                }

                if (i % 50 === 0) {
                    console.log(`Processed up to ID ${i}...`);
                }

            } catch (err) {
                console.error(`Error creating user ${i}:`, err.message);
            }
        }

        console.log(`\nSeeding completed successfully!`);
        console.log(`Created ${employeeCount} employees and ${employerCount} employers.`);
        process.exit(0);

    } catch (error) {
        console.error('Fatal error during seeding:', error);
        process.exit(1);
    }
};

seedUsers();
