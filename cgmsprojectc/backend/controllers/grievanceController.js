const supabase = require('../config/supabase');
const { generateTicketId } = require('../services/ticketService');
const { analyzeGrievance } = require('../services/aiService');

// Helper to format grievance object for frontend compatibility (matches Mongoose populates)
const formatGrievance = (g) => {
  if (!g) return null;
  return {
    _id: g.id,
    ticketId: g.ticket_id,
    category: g.category,
    subject: g.subject,
    description: g.description,
    priority: g.priority,
    status: g.status,
    attachments: g.attachments || [],
    aiSummary: g.ai_summary,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
    studentId: g.students ? {
      _id: g.students.id,
      name: g.students.name,
      rollNumber: g.students.roll_number,
      email: g.students.email,
      course: g.students.course,
      department: g.students.department,
      profilePicture: g.students.profile_picture
    } : null,
    department: g.departments ? {
      _id: g.departments.id,
      departmentName: g.departments.department_name,
      departmentHead: g.departments.department_head,
      description: g.departments.description
    } : null,
    assignedTo: g.faculty ? {
      _id: g.faculty.id,
      name: g.faculty.name,
      email: g.faculty.email
    } : null
  };
};

// @desc    Analyze complaint description (AI assistance)
// @route   POST /api/grievances/analyze
// @access  Private (Student)
const analyzeComplaintText = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.trim() === '') {
      return res.status(400).json({ message: 'Description is required for analysis' });
    }

    const analysis = await analyzeGrievance(description);

    // Try to find matching department ID
    let matchedDepartmentId = null;
    const { data: depts } = await supabase.from('departments').select('*');
    
    if (depts && depts.length > 0) {
      const match = depts.find(d => 
        d.department_name.toLowerCase().includes(analysis.suggestedDepartment.toLowerCase()) ||
        analysis.suggestedDepartment.toLowerCase().includes(d.department_name.toLowerCase())
      );
      if (match) {
        matchedDepartmentId = match.id;
        analysis.suggestedDepartment = match.department_name;
      } else {
        matchedDepartmentId = depts[0].id;
        analysis.suggestedDepartment = depts[0].department_name;
      }
    }

    res.json({
      ...analysis,
      departmentId: matchedDepartmentId
    });
  } catch (error) {
    console.error('AI Analysis Controller Error:', error.message);
    res.status(500).json({ message: 'Error analyzing complaint text' });
  }
};

// @desc    Submit a new grievance
// @route   POST /api/grievances
// @access  Private (Student)
const submitGrievance = async (req, res) => {
  try {
    const { category, subject, description, departmentId, priority, aiSummary } = req.body;

    if (!category || !subject || !description || !departmentId) {
      return res.status(400).json({ message: 'Category, subject, description, and department are required' });
    }

    // Verify department exists
    const { data: dept } = await supabase
      .from('departments')
      .select('id')
      .eq('id', departmentId)
      .maybeSingle();

    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push(`/uploads/${file.filename}`);
      });
    }

    // Generate unique Ticket ID
    const ticketId = await generateTicketId();

    const { data: grievance, error: insertError } = await supabase
      .from('grievances')
      .insert({
        ticket_id: ticketId,
        student_id: req.user.id,
        category,
        subject,
        description,
        department_id: departmentId,
        priority: priority || 'Medium',
        status: 'Pending',
        attachments,
        ai_summary: aiSummary || '',
        assigned_to: null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Submit Grievance Insert Error:', insertError.message);
      return res.status(400).json({ message: 'Could not log grievance ticket.' });
    }

    // Create initial timeline audit response comment
    await supabase.from('responses').insert({
      grievance_id: grievance.id,
      message: 'Grievance submitted. Ticket generated successfully.',
      response_by: req.user.id,
      responder_role: 'Student',
      responder_name: 'System Log'
    });

    res.status(201).json({
      _id: grievance.id,
      ticketId: grievance.ticket_id,
      category: grievance.category,
      subject: grievance.subject,
      status: grievance.status,
      priority: grievance.priority
    });
  } catch (error) {
    console.error('Submit Grievance Error:', error.message);
    res.status(500).json({ message: 'Server error submitting grievance' });
  }
};

// @desc    Get all grievances (Admin view all)
// @route   GET /api/grievances
// @access  Private (Admin)
const getAllGrievances = async (req, res) => {
  try {
    const { category, status, priority, department, search } = req.query;
    
    let query = supabase
      .from('grievances')
      .select('*, students(*), departments(*), faculty(*)');

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (department) query = query.eq('department_id', department);

    // Fetch lists
    const { data: grievances, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Get All Grievances Error:', error.message);
      return res.status(500).json({ message: 'Server error fetching grievances' });
    }

    // Handle local search filters (snappy filtering for nested fields)
    let results = grievances.map(formatGrievance);
    
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      results = results.filter(g => 
        g.ticketId.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        g.studentId?.name.toLowerCase().includes(q) ||
        g.studentId?.rollNumber.toLowerCase().includes(q)
      );
    }

    res.json(results);
  } catch (error) {
    console.error('Get All Grievances Error:', error.message);
    res.status(500).json({ message: 'Server error fetching grievances' });
  }
};

// @desc    Get own grievances (Student view)
// @route   GET /api/grievances/mine
// @access  Private (Student)
const getMyGrievances = async (req, res) => {
  try {
    const { data: grievances, error } = await supabase
      .from('grievances')
      .select('*, students(*), departments(*), faculty(*)')
      .eq('student_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get My Grievances Error:', error.message);
      return res.status(500).json({ message: 'Server error fetching your grievances' });
    }

    res.json(grievances.map(formatGrievance));
  } catch (error) {
    console.error('Get My Grievances Error:', error.message);
    res.status(500).json({ message: 'Server error fetching your grievances' });
  }
};

// @desc    Get grievances assigned to faculty member's department
// @route   GET /api/grievances/department
// @access  Private (Faculty / Admin)
const getDepartmentGrievances = async (req, res) => {
  try {
    const { data: faculty } = await supabase
      .from('faculty')
      .select('department_id')
      .eq('id', req.user.id)
      .single();

    if (!faculty || !faculty.department_id) {
      return res.status(404).json({ message: 'Faculty member department association not found.' });
    }

    const { category, status, priority } = req.query;

    let query = supabase
      .from('grievances')
      .select('*, students(*), departments(*), faculty(*)')
      .eq('department_id', faculty.department_id);

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data: grievances, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Get Dept Grievances Error:', error.message);
      return res.status(500).json({ message: 'Server error fetching department grievances' });
    }

    res.json(grievances.map(formatGrievance));
  } catch (error) {
    console.error('Get Dept Grievances Error:', error.message);
    res.status(500).json({ message: 'Server error fetching department grievances' });
  }
};

// @desc    Get grievance by ID
// @route   GET /api/grievances/:id
// @access  Private (Student, Faculty, Admin)
const getGrievanceById = async (req, res) => {
  try {
    const { data: grievance, error } = await supabase
      .from('grievances')
      .select('*, students(*), departments(*), faculty(*)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    const formatted = formatGrievance(grievance);

    // Auth validations
    if (req.user.role === 'Student' && String(formatted.studentId._id) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this grievance' });
    }

    if (req.user.role === 'Faculty') {
      const { data: fac } = await supabase
        .from('faculty')
        .select('department_id')
        .eq('id', req.user.id)
        .single();

      if (String(formatted.department._id) !== String(fac.department_id)) {
        return res.status(403).json({ message: 'Not authorized. Grievance does not belong to your department.' });
      }
    }

    res.json(formatted);
  } catch (error) {
    console.error('Get Grievance ID Error:', error.message);
    res.status(500).json({ message: 'Server error fetching grievance details' });
  }
};

// @desc    Track grievance by Ticket ID
// @route   GET /api/grievances/ticket/:ticketId
// @access  Private (Student, Faculty, Admin)
const getGrievanceByTicketId = async (req, res) => {
  try {
    const { data: grievance, error } = await supabase
      .from('grievances')
      .select('*, students(*), departments(*), faculty(*)')
      .eq('ticket_id', req.params.ticketId)
      .maybeSingle();

    if (error || !grievance) {
      return res.status(404).json({ message: 'Grievance ticket not found' });
    }

    const formatted = formatGrievance(grievance);

    // Student access constraint
    if (req.user.role === 'Student' && String(formatted.studentId._id) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to track this grievance' });
    }

    res.json(formatted);
  } catch (error) {
    console.error('Track Grievance Error:', error.message);
    res.status(500).json({ message: 'Server error tracking grievance' });
  }
};

// @desc    Update grievance status
// @route   PUT /api/grievances/:id/status
// @access  Private (Faculty, Admin)
const updateGrievanceStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const { data: grievance } = await supabase
      .from('grievances')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Faculty department check
    if (req.user.role === 'Faculty') {
      const { data: fac } = await supabase.from('faculty').select('department_id').eq('id', req.user.id).single();
      if (String(grievance.department_id) !== String(fac.department_id)) {
        return res.status(403).json({ message: 'Not authorized to edit status for this department' });
      }
    }

    const previousStatus = grievance.status;
    
    // Update grievance status and update date
    const { data: updatedGrievance } = await supabase
      .from('grievances')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    // Log status timeline comment
    let responderName = 'Administrator';
    if (req.user.role !== 'Admin') {
      const { data: faculty } = await supabase.from('faculty').select('name').eq('id', req.user.id).single();
      responderName = faculty ? faculty.name : 'Faculty Officer';
    }

    await supabase.from('responses').insert({
      grievance_id: grievance.id,
      message: `Status updated from '${previousStatus}' to '${status}'. Note: ${note || 'No notes added.'}`,
      response_by: req.user.id,
      responder_role: req.user.role,
      responder_name: responderName
    });

    res.json({
      _id: updatedGrievance.id,
      status: updatedGrievance.status
    });
  } catch (error) {
    console.error('Update Status Error:', error.message);
    res.status(500).json({ message: 'Server error updating status' });
  }
};

// @desc    Assign grievance to faculty or department
// @route   PUT /api/grievances/:id/assign
// @access  Private (Admin)
const assignGrievance = async (req, res) => {
  try {
    const { departmentId, facultyId } = req.body;

    const { data: grievance } = await supabase
      .from('grievances')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    let noteMessage = '';
    const updates = {};

    if (departmentId) {
      const { data: dept } = await supabase.from('departments').select('department_name').eq('id', departmentId).single();
      if (!dept) return res.status(404).json({ message: 'Department not found' });
      
      updates.department_id = departmentId;
      noteMessage += `Assigned to department: '${dept.department_name}'. `;
    }

    if (facultyId) {
      const { data: fac } = await supabase.from('faculty').select('name').eq('id', facultyId).single();
      if (!fac) return res.status(404).json({ message: 'Faculty member not found' });
      
      updates.assigned_to = facultyId;
      noteMessage += `Assigned to faculty: '${fac.name}'.`;
    } else if (facultyId === null) {
      updates.assigned_to = null;
      noteMessage += `Unassigned faculty reference.`;
    }

    const { data: updatedGrievance } = await supabase
      .from('grievances')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    // Log the assignment update
    let adminName = 'Administrator';
    const { data: admin } = await supabase.from('faculty').select('name').eq('id', req.user.id).single();
    if (admin) adminName = admin.name;

    await supabase.from('responses').insert({
      grievance_id: grievance.id,
      message: noteMessage || 'Grievance metadata updated.',
      response_by: req.user.id,
      responder_role: 'Admin',
      responder_name: adminName
    });

    const { data: fullDetails } = await supabase
      .from('grievances')
      .select('*, students(*), departments(*), faculty(*)')
      .eq('id', updatedGrievance.id)
      .single();

    res.json(formatGrievance(fullDetails));
  } catch (error) {
    console.error('Assign Grievance Error:', error.message);
    res.status(500).json({ message: 'Server error reassigning grievance' });
  }
};

// @desc    Delete grievance
// @route   DELETE /api/grievances/:id
// @access  Private (Admin)
const deleteGrievance = async (req, res) => {
  try {
    const { error } = await supabase
      .from('grievances')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Delete Grievance Error:', error.message);
      return res.status(404).json({ message: 'Grievance not found' });
    }

    res.json({ message: 'Grievance and associated comments/feedback deleted successfully' });
  } catch (error) {
    console.error('Delete Grievance Error:', error.message);
    res.status(500).json({ message: 'Server error deleting grievance' });
  }
};

module.exports = {
  analyzeComplaintText,
  submitGrievance,
  getAllGrievances,
  getMyGrievances,
  getDepartmentGrievances,
  getGrievanceById,
  getGrievanceByTicketId,
  updateGrievanceStatus,
  assignGrievance,
  deleteGrievance
};
