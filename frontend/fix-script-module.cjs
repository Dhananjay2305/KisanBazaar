const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace('<script src="/js/push-notifications.js"></script>', '<script type="module" src="/js/push-notifications.js"></script>');
    fs.writeFileSync(file, content);
});
