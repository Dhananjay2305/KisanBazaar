const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('splash-back.js')) {
        content = content.replace('</body>', '<script src="js/splash-back.js"></script>\n</body>');
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
}
