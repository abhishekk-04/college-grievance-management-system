const errorHandler = (err, req, res, next) => {
  console.error('Error Handler Triggered:', err);

  // Check if error is from Multer limit/file type
  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum limit is 10MB.' });
    }
    return res.status(400).json({ message: err.message });
  }

  // Handle custom validation or type errors
  if (err.message && err.message.includes('Only PDF, JPG, JPEG')) {
    return res.status(400).json({ message: err.message });
  }

  // Default server error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { errorHandler };
