const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { generateAccessToken, generateRefreshToken } = require('../utils/helpers');

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, course, department, password } = req.body;

    if (!name || !rollNumber || !email || !course || !department || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists in students table
    const { data: emailExists } = await supabase
      .from('students')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if roll number already exists
    const { data: rollExists } = await supabase
      .from('students')
      .select('roll_number')
      .eq('roll_number', rollNumber)
      .maybeSingle();

    if (rollExists) {
      return res.status(400).json({ message: 'Roll number already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student
    const { data: student, error: insertError } = await supabase
      .from('students')
      .insert({
        name,
        roll_number: rollNumber,
        email: email.toLowerCase(),
        course,
        department,
        password: hashedPassword
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert Student Error:', insertError.message);
      return res.status(400).json({ message: 'Could not register student details.' });
    }

    const userPayload = { _id: student.id, role: 'Student', email: student.email };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.status(201).json({
      _id: student.id,
      name: student.name,
      rollNumber: student.roll_number,
      email: student.email,
      course: student.course,
      department: student.department,
      role: 'Student',
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login student / faculty / admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Search in Students table
    let { data: user } = await supabase
      .from('students')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    let role = 'Student';

    // 2. If not student, search in Faculty/Admin table
    if (!user) {
      const { data: faculty } = await supabase
        .from('faculty')
        .select('*, departments(department_name, department_head)')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (faculty) {
        user = faculty;
        role = faculty.role; // 'Faculty' or 'Admin'
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userPayload = { _id: user.id, role, email: user.email };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Prepare response data
    const userData = {
      _id: user.id,
      name: user.name,
      email: user.email,
      role,
      accessToken,
      refreshToken
    };

    if (role === 'Student') {
      userData.rollNumber = user.roll_number;
      userData.course = user.course;
      userData.department = user.department;
      userData.profilePicture = user.profile_picture;
    } else if (role === 'Faculty') {
      // Structure department reference nested object for frontend layout compatibility
      userData.department = user.departments ? {
        _id: user.department_id,
        departmentName: user.departments.department_name,
        departmentHead: user.departments.department_head
      } : null;
    }

    res.json(userData);
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Refresh JWT access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'cgs_jwt_refresh_secret_key_2026_super_secure_109283'
    );

    // Generate new tokens
    const userPayload = { _id: decoded.id, role: decoded.role, email: decoded.email };
    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken(userPayload);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh Token Error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  registerStudent,
  login,
  refreshToken,
  logout
};
