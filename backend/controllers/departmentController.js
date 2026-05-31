const supabase = require('../config/supabase');

// Helper to format department object for frontend compatibility
const formatDept = (d) => {
  if (!d) return null;
  return {
    _id: d.id,
    departmentName: d.department_name,
    departmentHead: d.department_head,
    description: d.description,
    createdAt: d.created_at
  };
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res) => {
  try {
    const { departmentName, departmentHead, description } = req.body;

    if (!departmentName || !departmentHead || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if name exists
    const { data: deptExists } = await supabase
      .from('departments')
      .select('department_name')
      .eq('department_name', departmentName)
      .maybeSingle();

    if (deptExists) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    const { data: department, error } = await supabase
      .from('departments')
      .insert({
        department_name: departmentName,
        department_head: departmentHead,
        description
      })
      .select()
      .single();

    if (error || !department) {
      console.error('Create Department Error:', error?.message);
      return res.status(400).json({ message: 'Could not create department.' });
    }

    res.status(201).json(formatDept(department));
  } catch (error) {
    console.error('Create Department Error:', error.message);
    res.status(500).json({ message: 'Server error creating department' });
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getAllDepartments = async (req, res) => {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .order('department_name', { ascending: true });

    if (error) {
      console.error('Get All Depts Error:', error.message);
      return res.status(500).json({ message: 'Server error fetching departments' });
    }

    res.json(departments.map(formatDept));
  } catch (error) {
    console.error('Get All Departments Error:', error.message);
    res.status(500).json({ message: 'Server error fetching departments' });
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private (Admin)
const getDepartmentById = async (req, res) => {
  try {
    const { data: department, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(formatDept(department));
  } catch (error) {
    console.error('Get Department ID Error:', error.message);
    res.status(500).json({ message: 'Server error fetching department' });
  }
};

// @desc    Update department details
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res) => {
  try {
    const { departmentName, departmentHead, description } = req.body;

    const updates = {};
    if (departmentName) updates.department_name = departmentName;
    if (departmentHead) updates.department_head = departmentHead;
    if (description) updates.description = description;

    const { data: department, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !department) {
      console.error('Update Dept Error:', error?.message);
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(formatDept(department));
  } catch (error) {
    console.error('Update Department Error:', error.message);
    res.status(500).json({ message: 'Server error updating department' });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res) => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Delete Dept Error:', error.message);
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete Department Error:', error.message);
    res.status(500).json({ message: 'Server error deleting department' });
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};
