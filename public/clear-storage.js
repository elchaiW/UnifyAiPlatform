// Clear all localStorage data for fresh start
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('luminadoc_messages');
    console.log('✓ Previous chat history cleared');
  } catch (e) {
    console.log('Storage cleared');
  }
}
