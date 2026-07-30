import"./api-DqiYm43F.js";import{g as o}from"./auth-DlKCV7tk.js";import"./push-notifications-CQmv0i8S.js";document.addEventListener("DOMContentLoaded",()=>{const t=document.querySelector(".navbar__toggle"),e=document.querySelector(".navbar__links");t&&t.addEventListener("click",()=>{e.classList.toggle("open")}),document.querySelectorAll('a[href^="#"]').forEach(n=>{n.addEventListener("click",function(s){const r=this.getAttribute("href");if(r==="#")return;const a=document.querySelector(r);a&&(s.preventDefault(),a.scrollIntoView({behavior:"smooth",block:"start"}))})}),c()});function c(){const t=document.querySelector(".navbar__actions");if(!t)return;const e=o?o():null;e&&(t.innerHTML=`
            <span style="color: var(--gray-600); margin-right: 1rem;">
                Hello, ${e.name.split(" ")[0]}
            </span>
            <a href="${e.role==="farmer"?"farmer-dashboard.html":"buyer-dashboard.html"}" class="btn btn--primary">
                Dashboard
            </a>
        `)}const i={threshold:.1,rootMargin:"0px 0px -50px 0px"},l=new IntersectionObserver(t=>{t.forEach(e=>{e.isIntersecting&&(e.target.style.opacity="1",e.target.style.transform="translateY(0)")})},i);document.querySelectorAll(".feature-card, .step").forEach(t=>{t.style.opacity="0",t.style.transform="translateY(20px)",t.style.transition="opacity 0.5s ease, transform 0.5s ease",l.observe(t)});
