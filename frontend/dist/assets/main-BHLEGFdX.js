import{t as e}from"./auth-BVt79YaJ.js";/* empty css              */document.addEventListener(`DOMContentLoaded`,()=>{let e=document.querySelector(`.navbar__toggle`),n=document.querySelector(`.navbar__links`);e&&e.addEventListener(`click`,()=>{n.classList.toggle(`open`)}),document.querySelectorAll(`a[href^="#"]`).forEach(e=>{e.addEventListener(`click`,function(e){let t=this.getAttribute(`href`);if(t===`#`)return;let n=document.querySelector(t);n&&(e.preventDefault(),n.scrollIntoView({behavior:`smooth`,block:`start`}))})}),t()});function t(){let t=document.querySelector(`.navbar__actions`);if(!t)return;let n=e?e():null;n&&(t.innerHTML=`
            <span style="color: var(--gray-600); margin-right: 1rem;">
                Hello, ${n.name.split(` `)[0]}
            </span>
            <a href="${n.role===`farmer`?`farmer-dashboard.html`:`buyer-dashboard.html`}" class="btn btn--primary">
                Dashboard
            </a>
        `)}var n=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.style.opacity=`1`,e.target.style.transform=`translateY(0)`)})},{threshold:.1,rootMargin:`0px 0px -50px 0px`});document.querySelectorAll(`.feature-card, .step`).forEach(e=>{e.style.opacity=`0`,e.style.transform=`translateY(20px)`,e.style.transition=`opacity 0.5s ease, transform 0.5s ease`,n.observe(e)});