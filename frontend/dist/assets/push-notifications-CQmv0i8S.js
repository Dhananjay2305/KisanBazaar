document.addEventListener("DOMContentLoaded",()=>{if((window.location.pathname.endsWith("index.html")||window.location.pathname==="/"||window.location.pathname==="")&&!sessionStorage.getItem("splashShown")){const e=document.createElement("div");e.id="global-splash-screen";const l=window.innerWidth>=768?"/img/splash-pc.png":"/img/splash-screen.jpg";e.innerHTML=`
                <img src="${l}" alt="Splash Screen" class="splash-full-img">
            `,document.body.appendChild(e);const c=document.createElement("style");c.innerHTML=`
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
            `,document.head.appendChild(c),setTimeout(()=>{e.style.opacity="0",setTimeout(()=>e.remove(),500)},2e3),sessionStorage.setItem("splashShown","true")}if(!window.location.pathname.endsWith("index.html")&&window.location.pathname!=="/"&&window.location.pathname!==""){const e=document.createElement("button");e.id="global-back-btn",e.title="Go Back",e.innerHTML=`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
        `,e.onclick=()=>{document.referrer&&!document.referrer.includes("login")&&!document.referrer.includes("auth")?window.history.back():window.location.href="index.html"},document.body.appendChild(e);const a=document.createElement("style");a.innerHTML=`
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
        `,document.head.appendChild(a)}let o=0,r=0,i=!1;const n=80,t=document.createElement("div");t.id="ptr-indicator",t.innerHTML='<div class="ptr-spinner"></div>',document.body.prepend(t);const s=document.createElement("style");s.innerHTML=`
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
    `,document.head.appendChild(s),document.addEventListener("touchstart",e=>{window.scrollY===0&&(o=e.touches[0].clientY,i=!0)},{passive:!0}),document.addEventListener("touchmove",e=>{if(!i)return;r=e.touches[0].clientY;const a=r-o;if(a>0&&window.scrollY===0){const l=a*.4;t.style.transform="translateY("+Math.min(l,n+20)+"px)",t.querySelector(".ptr-spinner").style.opacity=l>n*.7?"1":"0.5"}else i=!1,t.style.transform="translateY(0)"},{passive:!0}),document.addEventListener("touchend",()=>{if(!i)return;i=!1,(r-o)*.4>n*.8?(t.style.transform="translateY("+n+"px)",t.querySelector(".ptr-spinner").style.opacity="1",setTimeout(()=>window.location.reload(),500)):(t.style.transform="translateY(0)",t.querySelector(".ptr-spinner").style.opacity="0.2"),o=r=0})});const d="BIh7OWGYwnTN9QvdFIMGrc2wEVXfhY0g6kka0EMyoNRJJntmvHrTKygt-F0bSdQWzPRfLAh7mGEJpX0tF8qjyUU";"serviceWorker"in navigator&&p().catch(o=>console.error("Push notification registration failed:",o));async function p(){console.log("Registering service worker...");const o=await navigator.serviceWorker.register("/sw.js",{scope:"/"});if(console.log("Service Worker Registered..."),await Notification.requestPermission()!=="granted"){console.log("Notification permission denied.");return}console.log("Registering Push...");const i=await o.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:h(d)});console.log("Push Registered..."),console.log("Sending Push Subscription to Backend...");let n=null;const t=localStorage.getItem("sb-addnaontkrvwgcotzjyy-auth-token");if(t)try{n=JSON.parse(t).access_token}catch{}const s=window.location.hostname.includes("localhost")?"http://localhost:5001/api/push/subscribe":"/_/backend/api/push/subscribe";await fetch(s,{method:"POST",body:JSON.stringify(i),headers:{"content-type":"application/json",...n?{Authorization:`Bearer ${n}`}:{}}}),console.log("Push Subscription Sent.")}function h(o){const r="=".repeat((4-o.length%4)%4),i=(o+r).replace(/\-/g,"+").replace(/_/g,"/"),n=window.atob(i),t=new Uint8Array(n.length);for(let s=0;s<n.length;++s)t[s]=n.charCodeAt(s);return t}
