const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('<script src="js/splash-back.js"></script>')) {
        content = content.replace('<script src="js/splash-back.js"></script>', '<script type="module" src="js/splash-back.js"></script>');
        fs.writeFileSync(file, content);
        console.log('Fixed ' + file);
    }
}
