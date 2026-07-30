// splash-back.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Splash Screen Logic (Only for index.html or root)
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        if (!sessionStorage.getItem('splashShown')) {
            const splash = document.createElement('div');
            splash.id = 'global-splash-screen';
            const isDesktop = window.innerWidth >= 768;
            const splashSrc = isDesktop ? '/img/splash-pc.png' : '/img/splash-screen.jpg';
            
            splash.innerHTML = `
                <img src="${splashSrc}" alt="Splash Screen" class="splash-full-img">
            `;
            document.body.appendChild(splash);
            
            // Add styles dynamically if not present
            const style = document.createElement('style');
            style.innerHTML = `
                #global-splash-screen {
                    position: fixed;
                    top: 0; left: 0; width: 100vw; height: 100vh;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    transition: opacity 0.8s ease-out;
                }
                .splash-full-img {
                    max-width: 90vw;
                    max-height: 85vh;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    animation: splashFadeIn 0.8s ease-out;
                }
                @keyframes splashFadeIn { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
            `;
            document.head.appendChild(style);

            // Remove splash after 2 seconds
            setTimeout(() => {
                splash.style.opacity = '0';
                setTimeout(() => splash.remove(), 500);
            }, 2000);
            sessionStorage.setItem('splashShown', 'true');
        }
    }

    // 2. Back Button Logic (For pages other than index.html)
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && window.location.pathname !== '') {
        const backBtn = document.createElement('button');
        backBtn.id = 'global-back-btn';
        backBtn.title = "Go Back";
        backBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
        `;
        backBtn.onclick = () => {
            if (document.referrer && !document.referrer.includes('login') && !document.referrer.includes('auth')) {
                window.history.back();
            } else {
                window.location.href = 'index.html';
            }
        };
        
        document.body.appendChild(backBtn);

        const backStyle = document.createElement('style');
        backStyle.innerHTML = `
            #global-back-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--primary-500, #22c55e);
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 9999;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            #global-back-btn:hover {
                background: var(--primary-600, #16a34a);
                transform: scale(1.15) translateY(-5px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.4);
            }
            @media (max-width: 768px) {
                #global-back-btn {
                    bottom: 20px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(backStyle);
    }

    // 3. Custom Pull-to-Refresh Logic (Mobile)
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    const p2rThreshold = 80;
    
    const p2rDiv = document.createElement('div');
    p2rDiv.id = 'ptr-indicator';
    p2rDiv.innerHTML = '<div class="ptr-spinner"></div>';
    document.body.prepend(p2rDiv);

    const ptrStyle = document.createElement('style');
    ptrStyle.innerHTML = `
        body { overscroll-behavior-y: none; }
        #ptr-indicator {
            position: fixed;
            top: -60px; left: 0; width: 100%; height: 60px;
            display: flex; align-items: center; justify-content: center;
            z-index: 9999;
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
        }
        .ptr-spinner {
            width: 30px; height: 30px;
            border: 3px solid var(--primary-200, #bbf7d0);
            border-top: 3px solid var(--primary-500, #22c55e);
            border-radius: 50%;
            animation: ptr-spin 1s linear infinite;
            opacity: 0.2;
            transition: opacity 0.3s;
        }
        @keyframes ptr-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(ptrStyle);

    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 0 && window.scrollY === 0) {
            const pullResisted = pullDistance * 0.4;
            p2rDiv.style.transform = 'translateY(' + Math.min(pullResisted, p2rThreshold + 20) + 'px)';
            p2rDiv.querySelector('.ptr-spinner').style.opacity = pullResisted > p2rThreshold * 0.7 ? '1' : '0.5';
        } else {
            isPulling = false;
            p2rDiv.style.transform = 'translateY(0)';
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!isPulling) return;
        isPulling = false;
        const pullDistance = currentY - startY;
        const pullResisted = pullDistance * 0.4;
        
        if (pullResisted > p2rThreshold * 0.8) {
            p2rDiv.style.transform = 'translateY(' + p2rThreshold + 'px)';
            p2rDiv.querySelector('.ptr-spinner').style.opacity = '1';
            setTimeout(() => window.location.reload(), 500);
        } else {
            p2rDiv.style.transform = 'translateY(0)';
            p2rDiv.querySelector('.ptr-spinner').style.opacity = '0.2';
        }
        startY = currentY = 0;
    });
});
