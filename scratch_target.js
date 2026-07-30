const fs = require('fs');
['frontend/farmer-dashboard.html', 'frontend/buyer-dashboard.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/e\.target\.dataset\.section/g, 'e.currentTarget.dataset.section');
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Updated', file);
});
