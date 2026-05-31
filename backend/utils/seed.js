require('dotenv').config({ path: __dirname + '/../.env' });
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const departmentsData = [
  {
    department_name: 'Academic Affairs',
    department_head: 'Dr. Sarah Jenkins',
    description: 'Handles attendance issues, curriculum disputes, syllabus progress, and faculty classroom conduct.'
  },
  {
    department_name: 'Examination Cell',
    department_head: 'Prof. Robert Miller',
    description: 'Deals with exam schedules, hall tickets, grades, marks, re-evaluation, and transcripts.'
  },
  {
    department_name: 'Finance & Accounts',
    department_head: 'Mr. David Vance',
    description: 'Manages tuition fees, refund requests, payment receipts, fine disputes, and fee portal technical errors.'
  },
  {
    department_name: 'Student Welfare',
    department_head: 'Dr. Clara Higgins',
    description: 'Handles scholarship applications, government grants, extracurricular funding, and student community disputes.'
  },
  {
    department_name: 'Hostel Administration',
    department_head: 'Mr. John Warden',
    description: 'Addresses hostel room allocations, water/power supply, building hygiene, and mess food complaints.'
  },
  {
    department_name: 'IT & Technical Support',
    department_head: 'Mrs. Emily Bytes',
    description: 'Maintains computer labs, college Wi-Fi connectivity, account access portals, and technical lab equipment.'
  },
  {
    department_name: 'Maintenance Department',
    department_head: 'Mr. Thomas Briggs',
    description: 'Handles classroom infrastructure, broken benches, lighting problems, fans, and campus plumbing.'
  }
];

const seedDB = async () => {
  try {
    console.log('Starting Supabase Database Seeding...');

    // Clear existing data (in correct cascade dependency order)
    console.log('Clearing existing data from tables...');
    await supabase.from('feedback').delete().neq('rating', 0);
    await supabase.from('responses').delete().neq('message', '');
    await supabase.from('grievances').delete().neq('subject', '');
    await supabase.from('faculty').delete().neq('name', '');
    await supabase.from('students').delete().neq('name', '');
    await supabase.from('departments').delete().neq('department_name', '');
    await supabase.from('counters').delete().neq('year', 0);

    console.log('Seeding departments...');
    const { data: createdDepts, error: deptError } = await supabase
      .from('departments')
      .insert(departmentsData)
      .select();

    if (deptError) throw new Error('Dept Seeding failed: ' + deptError.message);
    console.log(`Seeded ${createdDepts.length} departments.`);

    // Hashing passwords
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    const hashedFacultyPassword = await bcrypt.hash('faculty123', salt);
    const hashedStudentPassword = await bcrypt.hash('student123', salt);

    console.log('Seeding default Admin...');
    const { error: adminError } = await supabase
      .from('faculty')
      .insert({
        name: 'System Admin',
        email: 'admin@cgs.com',
        role: 'Admin',
        password: hashedAdminPassword
      });

    if (adminError) throw new Error('Admin Seeding failed: ' + adminError.message);
    console.log('Seeded Admin account (admin@cgs.com / admin123).');

    console.log('Seeding default Faculty members...');
    const academicDept = createdDepts.find(d => d.department_name === 'Academic Affairs');
    const examDept = createdDepts.find(d => d.department_name === 'Examination Cell');
    const itDept = createdDepts.find(d => d.department_name === 'IT & Technical Support');

    const { error: facError } = await supabase
      .from('faculty')
      .insert([
        {
          name: 'Dr. Sarah Jenkins',
          email: 'faculty@cgs.com',
          department_id: academicDept.id,
          role: 'Faculty',
          password: hashedFacultyPassword
        },
        {
          name: 'Prof. Robert Miller',
          email: 'examcell@cgs.com',
          department_id: examDept.id,
          role: 'Faculty',
          password: hashedFacultyPassword
        },
        {
          name: 'Mrs. Emily Bytes',
          email: 'support@cgs.com',
          department_id: itDept.id,
          role: 'Faculty',
          password: hashedFacultyPassword
        }
      ]);

    if (facError) throw new Error('Faculty Seeding failed: ' + facError.message);
    console.log('Seeded Faculty accounts (e.g. faculty@cgs.com / faculty123).');

    console.log('Seeding default Student...');
    const { error: studError } = await supabase
      .from('students')
      .insert({
        name: 'Abhishek Kumar',
        roll_number: 'CS20230042',
        email: 'student@cgs.com',
        course: 'B.Tech Computer Science',
        department: 'Computer Science & Engineering',
        password: hashedStudentPassword,
        profile_picture: ''
      });

    if (studError) throw new Error('Student Seeding failed: ' + studError.message);
    console.log('Seeded Student account (student@cgs.com / student123).');

    console.log('Supabase Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDB();
