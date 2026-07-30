const fs = require('fs');

// farmer-dashboard.html
let farmer = fs.readFileSync('frontend/farmer-dashboard.html', 'utf-8');
if (!farmer.includes("document.getElementById('sidebar')?.classList.remove('open');")) {
    farmer = farmer.replace('function showSection(sectionName) {', 'function showSection(sectionName) {\n            document.getElementById(\'sidebar\')?.classList.remove(\'open\');');
    fs.writeFileSync('frontend/farmer-dashboard.html', farmer, 'utf-8');
    console.log('Updated farmer-dashboard.html');
}

// buyer-dashboard.html
let buyer = fs.readFileSync('frontend/buyer-dashboard.html', 'utf-8');
if (!buyer.includes("document.getElementById('sidebar')?.classList.remove('open');")) {
    buyer = buyer.replace('function showSection(sectionName) {', 'function showSection(sectionName) {\n            document.getElementById(\'sidebar\')?.classList.remove(\'open\');');
    fs.writeFileSync('frontend/buyer-dashboard.html', buyer, 'utf-8');
    console.log('Updated buyer-dashboard.html');
}

// frontend/js/admin.js
let admin = fs.readFileSync('frontend/js/admin.js', 'utf-8');
if (!admin.includes("classList.remove('open')")) {
    admin = admin.replace('async function switchView(viewId) {', 'async function switchView(viewId) {\n    document.getElementById(\'adminSidebar\')?.classList.remove(\'open\');\n    document.getElementById(\'sidebar\')?.classList.remove(\'open\');');
    fs.writeFileSync('frontend/js/admin.js', admin, 'utf-8');
    console.log('Updated admin.js');
}
