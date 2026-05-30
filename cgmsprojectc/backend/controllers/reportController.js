const supabase = require('../config/supabase');

// @desc    Get system-wide summary statistics for admin dashboard
// @route   GET /api/reports/summary
// @access  Private (Admin)
const getSummaryStats = async (req, res) => {
  try {
    // 1. Total counts
    const { count: totalStudents } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: totalFaculty } = await supabase.from('faculty').select('*', { count: 'exact', head: true }).eq('role', 'Faculty');
    const { count: totalGrievances } = await supabase.from('grievances').select('*', { count: 'exact', head: true });

    // 2. Status counts
    const { count: pendingCount } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
    const { count: underReviewCount } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('status', 'Under Review');
    const { count: inProgressCount } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('status', 'In Progress');
    const { count: resolvedCount } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('status', 'Resolved');
    const { count: closedCount } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('status', 'Closed');
    const { count: rejectedCount } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('status', 'Rejected');

    // 3. Categories breakdown (Fetch categories list and aggregate locally)
    const { data: grievancesCategories } = await supabase.from('grievances').select('category');
    const categoryMap = {};
    if (grievancesCategories) {
      grievancesCategories.forEach(g => {
        categoryMap[g.category] = (categoryMap[g.category] || 0) + 1;
      });
    }
    const categoryStats = Object.keys(categoryMap).map(name => ({
      name,
      value: categoryMap[name]
    }));

    // 4. Department breakdown
    const { data: depts } = await supabase.from('departments').select('id, department_name');
    const departmentStats = [];
    if (depts) {
      for (const d of depts) {
        const { count } = await supabase
          .from('grievances')
          .select('*', { count: 'exact', head: true })
          .eq('department_id', d.id);
        departmentStats.push({
          name: d.department_name,
          value: count || 0
        });
      }
    }

    // 5. Monthly trends (last 6 months, calculated locally from created_at timestamps)
    const { data: trendDates } = await supabase.from('grievances').select('created_at');
    const monthlyTrends = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const mName = `${months[mIdx]} ${yr}`;

      let matchCount = 0;
      if (trendDates) {
        matchCount = trendDates.filter(t => {
          const tDate = new Date(t.created_at);
          return tDate.getFullYear() === yr && tDate.getMonth() === mIdx;
        }).length;
      }

      monthlyTrends.push({
        month: mName,
        Grievances: matchCount
      });
    }

    res.json({
      counts: {
        students: totalStudents || 0,
        faculty: totalFaculty || 0,
        grievances: totalGrievances || 0,
        pending: pendingCount || 0,
        underReview: underReviewCount || 0,
        inProgress: inProgressCount || 0,
        resolved: resolvedCount || 0,
        closed: closedCount || 0,
        rejected: rejectedCount || 0
      },
      categoryStats,
      departmentStats,
      monthlyTrends
    });
  } catch (error) {
    console.error('Get Stats Error:', error.message);
    res.status(500).json({ message: 'Server error generating summary report' });
  }
};

// @desc    Get detailed department performance report
// @route   GET /api/reports/department
// @access  Private (Admin)
const getDepartmentReport = async (req, res) => {
  try {
    const { data: depts } = await supabase.from('departments').select('*');
    const reports = [];

    if (depts) {
      for (const dept of depts) {
        const { count: total } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('department_id', dept.id);
        const { count: pending } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('department_id', dept.id).eq('status', 'Pending');
        const { count: inProgress } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('department_id', dept.id).eq('status', 'In Progress');
        const { count: resolved } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('department_id', dept.id).eq('status', 'Resolved');
        const { count: closed } = await supabase.from('grievances').select('*', { count: 'exact', head: true }).eq('department_id', dept.id).eq('status', 'Closed');

        // Calculate average feedback ratings locally
        const { data: closedGrievanceIds } = await supabase.from('grievances').select('id').eq('department_id', dept.id).eq('status', 'Closed');
        let avgRating = 0;
        
        if (closedGrievanceIds && closedGrievanceIds.length > 0) {
          const ids = closedGrievanceIds.map(g => g.id);
          const { data: feedbacks } = await supabase.from('feedback').select('rating').in('grievance_id', ids);
          
          if (feedbacks && feedbacks.length > 0) {
            const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
            avgRating = Number((sum / feedbacks.length).toFixed(1));
          }
        }

        reports.push({
          id: dept.id,
          departmentName: dept.department_name,
          departmentHead: dept.department_head,
          totalGrievances: total || 0,
          pendingGrievances: pending || 0,
          inProgressGrievances: inProgress || 0,
          resolvedOrClosed: (resolved || 0) + (closed || 0),
          averageRating: avgRating || 'N/A'
        });
      }
    }

    res.json(reports);
  } catch (error) {
    console.error('Dept Report Error:', error.message);
    res.status(500).json({ message: 'Server error generating department report' });
  }
};

// @desc    Export grievance records as CSV
// @route   GET /api/reports/export
// @access  Private (Admin)
const exportCSVReport = async (req, res) => {
  try {
    const { data: grievances, error } = await supabase
      .from('grievances')
      .select('*, students(*), departments(*), faculty(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Export CSV Select Error:', error.message);
      return res.status(500).json({ message: 'Server error generating CSV' });
    }

    let csv = 'Ticket ID,Student Name,Roll Number,Course,Student Dept,Grievance Dept,Category,Subject,Priority,Status,Assigned Faculty,Created Date\n';

    if (grievances) {
      grievances.forEach(g => {
        const ticketId = g.ticket_id;
        const studentName = g.students ? `"${g.students.name.replace(/"/g, '""')}"` : 'Unknown';
        const rollNumber = g.students ? g.students.roll_number : 'N/A';
        const course = g.students ? g.students.course : 'N/A';
        const studentDept = g.students ? g.students.department : 'N/A';
        const grievanceDept = g.departments ? `"${g.departments.department_name.replace(/"/g, '""')}"` : 'Unassigned';
        const category = g.category;
        const subject = `"${g.subject.replace(/"/g, '""')}"`;
        const priority = g.priority;
        const status = g.status;
        const assignedFaculty = g.faculty ? `"${g.faculty.name.replace(/"/g, '""')}"` : 'None';
        const createdDate = g.created_at.split('T')[0];

        csv += `${ticketId},${studentName},${rollNumber},${course},${studentDept},${grievanceDept},${category},${subject},${priority},${status},${assignedFaculty},${createdDate}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=grievances_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export CSV Error:', error.message);
    res.status(500).json({ message: 'Server error generating CSV export' });
  }
};

module.exports = {
  getSummaryStats,
  getDepartmentReport,
  exportCSVReport
};
