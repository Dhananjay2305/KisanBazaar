const fs = require('fs');

function addSidebarOverlayAndClose(filePath, sidebarId) {
    let html = fs.readFileSync(filePath, 'utf-8');
    
    // 1. Add overlay div if not exists
    if (!html.includes('id="mobileOverlay"')) {
        html = html.replace('<main class="main-content">', '<div id="mobileOverlay" class="mobile-overlay" onclick="closeSidebar()" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:999;"></div>\n        <main class="main-content">');
    }

    // 2. Update toggleSidebar to show/hide overlay
    const toggleFunc = `function toggleSidebar() {
            const sidebar = document.getElementById('${sidebarId}');
            const overlay = document.getElementById('mobileOverlay');
            sidebar.classList.toggle('open');
            if (overlay) {
                overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
            }
        }`;
    
    // Replace old toggleSidebar
    html = html.replace(/function toggleSidebar\(\) \{[\s\S]*?\}/, toggleFunc);

    // 3. Add closeSidebar function
    if (!html.includes('function closeSidebar()')) {
        const closeFunc = `\n        function closeSidebar() {
            document.getElementById('${sidebarId}')?.classList.remove('open');
            const overlay = document.getElementById('mobileOverlay');
            if (overlay) overlay.style.display = 'none';
        }\n`;
        html = html.replace('function showSection(sectionName) {', closeFunc + '        function showSection(sectionName) {');
    }

    // 4. Update showSection to call closeSidebar
    if (html.includes("document.getElementById('sidebar')?.classList.remove('open');")) {
        html = html.replace("document.getElementById('sidebar')?.classList.remove('open');", "closeSidebar();");
    }

    fs.writeFileSync(filePath, html, 'utf-8');
    console.log('Updated', filePath);
}

addSidebarOverlayAndClose('frontend/farmer-dashboard.html', 'sidebar');
addSidebarOverlayAndClose('frontend/buyer-dashboard.html', 'sidebar');
// admin uses frontend/js/admin.js, but let's just do farmer/buyer for now.
