const { GoogleGenerativeAI } = require('@google/generative-ai');

// Standard predefined categories
const CATEGORIES = [
  'Attendance Issues',
  'Examination Issues',
  'Marks/Re-evaluation',
  'Fee Related',
  'Scholarship',
  'Hostel Complaints',
  'Library Complaints',
  'Infrastructure',
  'Faculty Related',
  'Technical/Lab',
  'Other'
];

// Fallback logic in case API key is missing or request fails
const analyzeGrievanceFallback = (description) => {
  const text = description.toLowerCase();
  let category = 'Other';
  let suggestedDepartment = 'General Administration';
  let priority = 'Medium';

  // Heuristic rules for classification
  if (text.includes('attendance') || text.includes('bunk') || text.includes('presence')) {
    category = 'Attendance Issues';
    suggestedDepartment = 'Academic Affairs';
  } else if (text.includes('exam') || text.includes('test') || text.includes('hall ticket')) {
    category = 'Examination Issues';
    suggestedDepartment = 'Examination Cell';
  } else if (text.includes('mark') || text.includes('score') || text.includes('grade') || text.includes('re-evaluation') || text.includes('reevaluation')) {
    category = 'Marks/Re-evaluation';
    suggestedDepartment = 'Examination Cell';
  } else if (text.includes('fee') || text.includes('payment') || text.includes('invoice') || text.includes('challan')) {
    category = 'Fee Related';
    suggestedDepartment = 'Finance & Accounts';
  } else if (text.includes('scholarship') || text.includes('grant') || text.includes('concession')) {
    category = 'Scholarship';
    suggestedDepartment = 'Student Welfare';
  } else if (text.includes('hostel') || text.includes('mess') || text.includes('room') || text.includes('warden')) {
    category = 'Hostel Complaints';
    suggestedDepartment = 'Hostel Administration';
  } else if (text.includes('library') || text.includes('book') || text.includes('journal')) {
    category = 'Library Complaints';
    suggestedDepartment = 'Library Committee';
  } else if (text.includes('wifi') || text.includes('internet') || text.includes('computer') || text.includes('lab') || text.includes('software')) {
    category = 'Technical/Lab';
    suggestedDepartment = 'IT & Technical Support';
  } else if (text.includes('infrastructure') || text.includes('fan') || text.includes('light') || text.includes('toilet') || text.includes('building') || text.includes('bench')) {
    category = 'Infrastructure';
    suggestedDepartment = 'Maintenance Department';
  } else if (text.includes('faculty') || text.includes('teacher') || text.includes('professor') || text.includes('lecture') || text.includes('behaviour')) {
    category = 'Faculty Related';
    suggestedDepartment = 'Academic Affairs';
  }

  // Priority heuristics
  if (text.includes('urgent') || text.includes('emergency') || text.includes('fail') || text.includes('harrass') || text.includes('ragging') || text.includes('refund')) {
    priority = 'High';
  } else if (text.includes('routine') || text.includes('slow') || text.includes('update')) {
    priority = 'Low';
  }

  // Brief summary generator
  const cleanText = description.replace(/\s+/g, ' ').trim();
  const sentences = cleanText.split(/[.!?]+/);
  let summary = '';
  if (sentences.length > 0 && sentences[0].length > 10) {
    summary = sentences[0] + '.';
    if (sentences.length > 1 && sentences[1].trim().length > 10) {
      summary += ' ' + sentences[1].trim() + '.';
    }
  } else {
    summary = cleanText.substring(0, 100) + '...';
  }

  return {
    category,
    summary: summary || 'No summary available.',
    suggestedDepartment,
    priority
  };
};

const analyzeGrievance = async (description) => {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.log('AI_API_KEY is not set. Using local rule-based analyzer.');
    return analyzeGrievanceFallback(description);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are an assistant for a college grievance system.
Analyze the following student complaint and return a JSON object with:
- category (one of: Attendance Issues, Examination Issues, Marks/Re-evaluation, Fee Related, Scholarship, Hostel Complaints, Library Complaints, Infrastructure, Faculty Related, Technical/Lab, Other)
- summary (2-3 sentence summary of the grievance)
- suggestedDepartment (suggest a department like "Academic Affairs", "Examination Cell", "Finance & Accounts", "Student Welfare", "Hostel Administration", "Library Committee", "IT & Technical Support", "Maintenance Department")
- priority (Low | Medium | High)

Complaint: "${description}"

Return only valid JSON.`;

    const result = await model.generateContent(prompt);
    const textResult = result.response.text();
    const parsed = JSON.parse(textResult.trim());

    // Validate the response values
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = 'Other';
    }
    if (!['Low', 'Medium', 'High'].includes(parsed.priority)) {
      parsed.priority = 'Medium';
    }

    return {
      category: parsed.category,
      summary: parsed.summary || 'Summary not generated.',
      suggestedDepartment: parsed.suggestedDepartment || 'General Administration',
      priority: parsed.priority
    };
  } catch (error) {
    console.error('Error with Gemini API, falling back to local analyzer:', error.message);
    return analyzeGrievanceFallback(description);
  }
};

module.exports = {
  analyzeGrievance
};
