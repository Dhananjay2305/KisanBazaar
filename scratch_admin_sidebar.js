const fs = require('fs');
let admin = fs.readFileSync('frontend/js/admin.js', 'utf-8');
admin = admin.replace(
    /document\.getElementById\('adminSidebar'\)\?\.classList\.remove\('open'\);\n\s*document\.getElementById\('sidebar'\)\?\.classList\.remove\('open'\);/,
    `document.getElementById('adminSidebar')?.classList.remove('mobile-open');
    document.getElementById('adminOverlay')?.classList.remove('active');`
);
fs.writeFileSync('frontend/js/admin.js', admin, 'utf-8');
console.log('Updated admin.js sidebar close logic');
