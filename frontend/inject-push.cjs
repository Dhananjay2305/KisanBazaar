const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if(!content.includes('push-notifications.js')) {
        content = content.replace('</body>', '<script src="/js/push-notifications.js"></script>\n</body>');
        fs.writeFileSync(file, content);
    }
});
