const supabase = require('../config/supabase');

// @desc    Submit student feedback / rating
// @route   POST /api/feedback
// @access  Private (Student)
const submitFeedback = async (req, res) => {
  try {
    const { grievanceId, rating, comment } = req.body;

    if (!grievanceId || !rating) {
      return res.status(400).json({ message: 'Grievance ID and star rating (1-5) are required' });
    }

    const { data: grievance } = await supabase
      .from('grievances')
      .select('*')
      .eq('id', grievanceId)
      .single();

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Verify ownership
    if (String(grievance.student_id) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to provide feedback on this grievance' });
    }

    if (grievance.status !== 'Resolved' && grievance.status !== 'Closed') {
      return res.status(400).json({ message: 'Feedback can only be submitted after the grievance is resolved' });
    }

    // Check if feedback already submitted
    const { data: feedbackExists } = await supabase
      .from('feedback')
      .select('id')
      .eq('grievance_id', grievanceId)
      .maybeSingle();

    if (feedbackExists) {
      return res.status(400).json({ message: 'Feedback has already been submitted for this ticket' });
    }

    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert({
        student_id: req.user.id,
        grievance_id: grievanceId,
        rating,
        comment: comment || ''
      })
      .select()
      .single();

    if (error || !feedback) {
      console.error('Insert feedback error:', error?.message);
      return res.status(400).json({ message: 'Could not submit feedback.' });
    }

    // Update grievance status to 'Closed' and update time
    await supabase
      .from('grievances')
      .update({
        status: 'Closed',
        updated_at: new Date().toISOString()
      })
      .eq('id', grievanceId);

    // Log the close status update in timeline responses
    const { data: student } = await supabase.from('students').select('name').eq('id', req.user.id).single();
    const displayName = student ? student.name : 'Student';

    await supabase.from('responses').insert({
      grievance_id: grievanceId,
      message: `Feedback submitted: Rated ${rating}/5 Stars. Comments: "${comment || 'None'}"`,
      response_by: req.user.id,
      responder_role: 'Student',
      responder_name: displayName
    });

    res.status(201).json({
      _id: feedback.id,
      rating: feedback.rating,
      comment: feedback.comment
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error.message);
    res.status(500).json({ message: 'Server error saving feedback' });
  }
};

// @desc    Get feedback for a specific grievance
// @route   GET /api/feedback/:grievanceId
// @access  Private (Admin, Faculty)
const getFeedbackForGrievance = async (req, res) => {
  try {
    const { data: grievance } = await supabase
      .from('grievances')
      .select('*')
      .eq('id', req.params.grievanceId)
      .single();

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Faculty department check
    if (req.user.role === 'Faculty') {
      const { data: fac } = await supabase.from('faculty').select('department_id').eq('id', req.user.id).single();
      if (String(grievance.department_id) !== String(fac.department_id)) {
        return res.status(403).json({ message: 'Not authorized to view feedback in other departments' });
      }
    }

    const { data: feedback, error } = await supabase
      .from('feedback')
      .select('*, students(*)')
      .eq('grievance_id', req.params.grievanceId)
      .maybeSingle();

    if (error || !feedback) {
      return res.status(404).json({ message: 'Feedback not found for this grievance' });
    }

    res.json({
      _id: feedback.id,
      rating: feedback.rating,
      comment: feedback.comment,
      submittedAt: feedback.submitted_at,
      studentId: feedback.students ? {
        _id: feedback.students.id,
        name: feedback.students.name,
        rollNumber: feedback.students.roll_number,
        email: feedback.students.email
      } : null
    });
  } catch (error) {
    console.error('Get Feedback Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving feedback' });
  }
};

// @desc    Get all feedback submissions
// @route   GET /api/feedback
// @access  Private (Admin)
const getAllFeedback = async (req, res) => {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedback')
      .select('*, students(*), grievances(*)')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Get All Feedbacks Error:', error.message);
      return res.status(500).json({ message: 'Server error fetching all feedbacks' });
    }

    res.json(feedbacks.map(f => ({
      _id: f.id,
      rating: f.rating,
      comment: f.comment,
      submittedAt: f.submitted_at,
      studentId: f.students ? {
        _id: f.students.id,
        name: f.students.name,
        rollNumber: f.students.roll_number,
        email: f.students.email
      } : null,
      grievanceId: f.grievances ? {
        _id: f.grievances.id,
        ticketId: f.grievances.ticket_id,
        subject: f.grievances.subject,
        status: f.grievances.status
      } : null
    })));
  } catch (error) {
    console.error('Get All Feedback Error:', error.message);
    res.status(500).json({ message: 'Server error fetching all feedbacks' });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackForGrievance,
  getAllFeedback
};
