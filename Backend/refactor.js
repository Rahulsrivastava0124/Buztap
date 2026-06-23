const fs = require('fs');
const path = require('path');
const routesDir = path.join(__dirname, 'src', 'routes');

const replacements = {
  'requireRole("cashier")': 'requirePermission("pos:access")',
  'requireRole("manager")': 'requirePermission("menu:manage")',
  'requireRole("admin")': 'requirePermission("staff:write")',
  "requireRole('cashier')": "requirePermission('pos:access')",
  "requireRole('manager')": "requirePermission('menu:manage')",
  "requireRole('admin')": "requirePermission('staff:write')",
};

fs.readdirSync(routesDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let changed = false;
    
    if (content.includes('const requireRole = require("../middleware/requireRole");')) {
      content = content.replace('const requireRole = require("../middleware/requireRole");', 'const requirePermission = require("../middleware/requirePermission");');
      changed = true;
    }
    
    for (const [oldStr, newStr] of Object.entries(replacements)) {
      if (content.includes(oldStr)) {
        content = content.split(oldStr).join(newStr);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated ' + file);
    }
  }
});
