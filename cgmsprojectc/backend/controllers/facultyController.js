const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Helper to format faculty object for frontend compatibility
const formatFaculty = (fac) => {
  if (!fac) return null;
  return {
    _id: fac.id,
    name: fac.name,
    email: fac.email,
    role: fac.role,
    createdAt: fac.created_at,
    department: fac.departments ? {
      _id: fac.department_id,
      departmentName: fac.departments.department_name,
      departmentHead: fac.departments.department_head,
      description: fac.departments.description
    } : null
  };
};

// @desc    Create a new faculty account
// @route   POST /api/faculty
// @access  Private (Admin)
const createFaculty = async (req, res) => {
  try {
    const { name, email, department, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email already registered
    const { data: facultyExists } = await supabase
      .from('faculty')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (facultyExists) {
      return res.status(400).json({ message: 'Email already registered as faculty' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert Faculty
    const { data: faculty, error } = await supabase
      .from('faculty')
      .insert({
        name,
        email: email.toLowerCase(),
        department_id: role === 'Admin' ? null : (department || null),
        role: role || 'Faculty',
        password: hashedPassword
      })
      .select()
      .single();

    if (error || !faculty) {
      console.error('Create Faculty Error:', error?.message);
      return res.status(400).json({ message: 'Could not create faculty member.' });
    }

    res.status(201).json({
      _id: faculty.id,
      name: faculty.name,
      email: faculty.email,
      department: faculty.department_id,
      role: faculty.role
    });
  } catch (error) {
    console.error('Create Faculty Error:', error.message);
    res.status(500).json({ message: 'Server error creating faculty' });
  }
};

// @desc    Get all faculty accounts
// @route   GET /api/faculty
// @access  Private (Admin)
const getAllFaculty = async (req, res) => {
  try {
    const { data: faculties, error } = await supabase
      .from('faculty')
      .select('*, departments(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get All Faculty Error:', error.message);
      return res.status(500).json({ message: 'Server error fetching faculty list' });
    }

    res.json(faculties.map(formatFaculty));
  } catch (error) {
    console.error('Get All Faculty Error:', error.message);
    res.status(500).json({ message: 'Server error fetching faculty list' });
  }
};

// @desc    Get faculty by ID
// @route   GET /api/faculty/:id
// @access  Private (Admin, Faculty)
const getFacultyById = async (req, res) => {
  try {
    // Auth check
    if (req.user.role === 'Faculty' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view other profiles' });
    }

    const { data: faculty, error } = await supabase
      .from('faculty')
      .select('*, departments(*)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    res.json(formatFaculty(faculty));
  } catch (error) {
    console.error('Get Faculty ID Error:', error.message);
    res.status(500).json({ message: 'Server error fetching faculty details' });
  }
};

// @desc    Update faculty profile
// @route   PUT /api/faculty/:id
// @access  Private (Admin, Faculty)
const updateFaculty = async (req, res) => {
  try {
    // Auth check
    if (req.user.role === 'Faculty' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to edit other profiles' });
    }

    const { name, email, department, password, role } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    
    if (req.user.role === 'Admin') {
      if (department !== undefined) updates.department_id = department || null;
      if (role) updates.role = role;
    } else {
      if (department !== undefined) {
        return res.status(403).json({ message: 'Only Admins can change departments' });
      }
    }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const { data: faculty, error } = await supabase
      .from('faculty')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !faculty) {
      console.error('Update Faculty Error:', error?.message);
      return res.status(404).json({ message: 'Faculty member not found' });
    }
    
    // Pull joined relation data for response formatting
    const { data: updatedFac } = await supabase
      .from('faculty')
      .select('*, departments(*)')
      .eq('id', faculty.id)
      .single();

    res.json(formatFaculty(updatedFac));
  } catch (error) {
    console.error('Update Faculty Error:', error.message);
    res.status(500).json({ message: 'Server error updating faculty profile' });
  }
};

// @desc    Delete faculty account
// @route   DELETE /api/faculty/:id
// @access  Private (Admin)
const deleteFaculty = async (req, res) => {
  try {
    // Prevent self delete
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account!' });
    }

    const { error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Delete Faculty Error:', error.message);
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    res.json({ message: 'Faculty member deleted successfully' });
  } catch (error) {
    console.error('Delete Faculty Error:', error.message);
    res.status(500).json({ message: 'Server error deleting faculty' });
  }
};

module.exports = {
  createFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty
};
