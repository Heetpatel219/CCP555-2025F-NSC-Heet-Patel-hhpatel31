// Simple test to check if our modules load correctly
try {
  console.log('Testing Fragment model...');
  const Fragment = require('./src/model/fragment');
  console.log('✓ Fragment model loaded');
  
  console.log('Testing response module...');
  const { createSuccessResponse } = require('./src/response');
  console.log('✓ Response module loaded');
  
  console.log('Testing routes...');
  const getFragments = require('./src/routes/api/get');
  console.log('✓ GET route loaded');
  
  const postFragment = require('./src/routes/api/post');
  console.log('✓ POST route loaded');
  
  const getFragmentById = require('./src/routes/api/get-by-id');
  console.log('✓ GET by ID route loaded');
  
  console.log('All modules loaded successfully!');
} catch (error) {
  console.error('Error loading modules:', error.message);
  process.exit(1);
}


