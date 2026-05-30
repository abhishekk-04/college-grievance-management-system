const supabase = require('../config/supabase');

// @desc    Add a comment/response to a grievance
// @route   POST /api/responses
// @access  Private (Student, Faculty, Admin)
const addResponse = async (req, res) => {
  try {
    const { grievanceId, message } = req.body;

    if (!grievanceId || !message || message.trim() === '') {
      return res.status(400).json({ message: 'Grievance ID and message content are required' });
    }

    const { data: grievance } = await supabase
      .from('grievances')
      .select('*')
      .eq('id', grievanceId)
      .single();

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Access Validation
    let responderName = 'System';

    if (req.user.role === 'Student') {
      if (String(grievance.student_id) !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to reply to this grievance' });
      }
      const { data: student } = await supabase.from('students').select('name').eq('id', req.user.id).single();
      responderName = student ? student.name : 'Student';
    } else {
      // Faculty/Admin
      const { data: faculty } = await supabase.from('faculty').select('*').eq('id', req.user.id).single();
      if (!faculty) {
        return res.status(404).json({ message: 'Responder profile not found' });
      }
      
      // Faculty must be in same department
      if (req.user.role === 'Faculty' && String(grievance.department_id) !== String(faculty.department_id)) {
        return res.status(403).json({ message: 'Not authorized to reply to grievances in other departments' });
      }
      
      responderName = faculty.name;
    }

    const { data: newResponse, error } = await supabase
      .from('responses')
      .insert({
        grievance_id: grievanceId,
        message,
        response_by: req.user.id,
        responder_role: req.user.role,
        responder_name: responderName
      })
      .select()
      .single();

    if (error || !newResponse) {
      console.error('Insert response comment error:', error?.message);
      return res.status(400).json({ message: 'Could not post response comment.' });
    }

    // Return frontend compatible fields (mapping snake_case to camelCase)
    res.status(201).json({
      _id: newResponse.id,
      grievanceId: newResponse.grievance_id,
      message: newResponse.message,
      responseBy: newResponse.response_by,
      responderRole: newResponse.responder_role,
      responderName: newResponse.responder_name,
      timestamp: newResponse.timestamp
    });
  } catch (error) {
    console.error('Add Response Error:', error.message);
    res.status(500).json({ message: 'Server error posting response' });
  }
};

// @desc    Get responses for a specific grievance
// @route   GET /api/responses/:grievanceId
// @access  Private (Student, Faculty, Admin)
const getResponsesForGrievance = async (req, res) => {
  try {
    const { data: grievance } = await supabase
      .from('grievances')
      .select('*')
      .eq('id', req.params.grievanceId)
      .single();

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Access check
    if (req.user.role === 'Student' && String(grievance.student_id) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view response logs' });
    }

    if (req.user.role === 'Faculty') {
      const { data: fac } = await supabase.from('faculty').select('department_id').eq('id', req.user.id).single();
      if (String(grievance.department_id) !== String(fac.department_id)) {
        return res.status(403).json({ message: 'Not authorized to view department response logs' });
      }
    }

    const { data: responses, error } = await supabase
      .from('responses')
      .select('*')
      .eq('grievance_id', req.params.grievanceId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Get Comments Error:', error.message);
      return res.status(500).json({ message: 'Server error retrieving responses list' });
    }

    res.json(responses.map(r => ({
      _id: r.id,
      grievanceId: r.grievance_id,
      message: r.message,
      responseBy: r.response_by,
      responderRole: r.responder_role,
      responderName: r.responder_name,
      timestamp: r.timestamp
    })));
  } catch (error) {
    console.error('Get Responses Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving responses list' });
  }
};

module.exports = {
  addResponse,
  getResponsesForGrievance
};
