const supabase = require('../config/supabase');

const generateTicketId = async () => {
  const currentYear = new Date().getFullYear();
  
  // Try to find the counter for the current year
  const { data, error } = await supabase
    .from('counters')
    .select('seq')
    .eq('year', currentYear)
    .maybeSingle(); // maybeSingle returns null instead of PGRST116 error if not found!
    
  let nextSeq = 1;
  
  if (!data) {
    // Year counter doesn't exist, create it
    const { error: insertError } = await supabase
      .from('counters')
      .insert({ year: currentYear, seq: 1 });
      
    if (insertError) {
      console.error('Error inserting counter year:', insertError.message);
    }
  } else {
    // Increment the sequence counter
    nextSeq = data.seq + 1;
    const { error: updateError } = await supabase
      .from('counters')
      .update({ seq: nextSeq })
      .eq('year', currentYear);
      
    if (updateError) {
      console.error('Error updating counter sequence:', updateError.message);
    }
  }
  
  const sequenceStr = String(nextSeq).padStart(4, '0');
  return `CGS-${currentYear}-${sequenceStr}`;
};

module.exports = {
  generateTicketId
};
