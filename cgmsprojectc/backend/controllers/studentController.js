const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Helper to format student object for frontend compatibility (mapping snake_case to camelCase)
const formatStudent = (student) => {
  if (!student) return null;
  return {
    _id: student.id,
    name: student.name,
    rollNumber: student.roll_number,
    email: student.email,
    course: student.course,
    department: student.department,
    profilePicture: student.profile_picture,
    createdAt: student.created_at
  };
};

// @desc    Get student profile (own)
// @route   GET /api/students/profile
// @access  Private (Student)
const getOwnProfile = async (req, res) => {
  try {
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(formatStudent(student));
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Update student profile (own)
// @route   PUT /api/students/profile
// @access  Private (Student)
const updateOwnProfile = async (req, res) => {
  try {
    const { name, course, department, password, profilePicture } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (course) updates.course = course;
    if (department) updates.department = department;
    if (profilePicture !== undefined) updates.profile_picture = profilePicture;

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const { data: student, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error || !student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(formatStudent(student));
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (Admin)
const getStudentById = async (req, res) => {
  try {
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(formatStudent(student));
  } catch (error) {
    console.error('Get Student Error:', error.message);
    res.status(500).json({ message: 'Server error fetching student data' });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin)
const getAllStudents = async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get All Students Error:', error.message);
      return res.status(500).json({ message: 'Server error fetching students list' });
    }

    res.json(students.map(formatStudent));
  } catch (error) {
    console.error('Get All Students Error:', error.message);
    res.status(500).json({ message: 'Server error fetching students list' });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Delete Student Error:', error.message);
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student account deleted successfully' });
  } catch (error) {
    console.error('Delete Student Error:', error.message);
    res.status(500).json({ message: 'Server error deleting student' });
  }
};

module.exports = {
  getOwnProfile,
  updateOwnProfile,
  getStudentById,
  getAllStudents,
  deleteStudent
};
