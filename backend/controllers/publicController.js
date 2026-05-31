const supabase = require('../config/supabase');

// @desc    Get public statistics for home page
// @route   GET /api/public/stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    // 1. Total Registered
    const { count: totalRegistered, error: regError } = await supabase
      .from('grievances')
      .select('*', { count: 'exact', head: true });

    if (regError) throw regError;

    // 2. Total Resolved/Closed
    const { count: totalResolved, error: resError } = await supabase
      .from('grievances')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Resolved', 'Closed']);

    if (resError) throw resError;

    // 3. Average Resolution Time
    const { data: resolvedGrievances, error: timeError } = await supabase
      .from('grievances')
      .select('created_at, updated_at')
      .in('status', ['Resolved', 'Closed']);

    if (timeError) throw timeError;

    let averageResolutionTimeHours = 24; // Default fallback if no resolved grievances exist yet
    if (resolvedGrievances && resolvedGrievances.length > 0) {
      const totalDiffMs = resolvedGrievances.reduce((acc, g) => {
        const start = new Date(g.created_at);
        const end = new Date(g.updated_at);
        return acc + (end - start);
      }, 0);
      const avgMs = totalDiffMs / resolvedGrievances.length;
      averageResolutionTimeHours = Math.max(1, Math.round(avgMs / (1000 * 60 * 60))); // in hours
    }

    res.json({
      totalRegistered: totalRegistered || 0,
      totalResolved: totalResolved || 0,
      averageResolutionTime: averageResolutionTimeHours
    });
  } catch (error) {
    console.error('Public Stats Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving statistics.' });
  }
};

// @desc    Get latest student feedback reviews
// @route   GET /api/public/reviews
// @access  Public
const getPublicReviews = async (req, res) => {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedback')
      .select(`
        id,
        rating,
        comment,
        submitted_at,
        students (
          name
        )
      `)
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json(feedbacks.map(f => ({
      _id: f.id,
      rating: f.rating,
      comment: f.comment,
      submittedAt: f.submitted_at,
      studentName: f.students ? f.students.name : 'Anonymous Student'
    })));
  } catch (error) {
    console.error('Public Reviews Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving reviews.' });
  }
};

module.exports = {
  getPublicStats,
  getPublicReviews
};
