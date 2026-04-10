const fs = require('fs');
const path = './Landing.jsx';
let content = fs.readFileSync(path, 'utf8');

const sectionStartStr = `      {/* ════════════════ 4.6. HOTEL ROOM SERVICE ════════════════ */}`;
const nextSectionStartStr = `      {/* ════════════════ 5. HOW IT WORKS ═════════════════════════ */}`;

const startIndex = content.indexOf(sectionStartStr);
const endIndex = content.indexOf(nextSectionStartStr);

if (startIndex !== -1 && endIndex !== -1) {
  // Extract the section block including newline
  const sectionContent = content.substring(startIndex, endIndex);
  
  // Remove the block from the original place
  content = content.replace(sectionContent, '');
  
  // Replace the heading to be 3.5. HOTEL ROOM SERVICE
  const newSectionContent = sectionContent.replace('4.6.', '3.5.');
  
  // Find where 4. FEATURES starts
  const featuresStartStr = `      {/* ════════════════ 4. FEATURES ══════════════════════════════ */}`;
  
  // Insert it right before 4. FEATURES
  content = content.replace(featuresStartStr, newSectionContent + featuresStartStr);
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully moved HOTEL ROOM SERVICE above FEATURES.');
} else {
  console.log('Failed to find indices.');
}
