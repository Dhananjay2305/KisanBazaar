import"./auth-BVt79YaJ.js";/* empty css              */var e=null,t=`http://127.0.0.1:5001`;function n(e){return e?e.startsWith(`http`)?e:t+e:`https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=400&fit=crop`}function r(e,n=`Farmer`){return e?e.startsWith(`http`)?e:t+e:`https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=10B981&color=fff`}document.addEventListener(`DOMContentLoaded`,()=>{let e=getUser();e&&(document.getElementById(`navActions`).innerHTML=`
                    <a href="${e.role===`farmer`?`farmer-dashboard.html`:`buyer-dashboard.html`}" class="btn btn--primary">Dashboard</a>
                `);let t=new URLSearchParams(window.location.search).get(`id`);t?i(t):document.getElementById(`listingContent`).innerHTML=`<p>Listing not found</p>`});async function i(t){try{if(e=(await api.get(`/listings/${t}`)).listing,!e){document.getElementById(`listingContent`).innerHTML=`<p>Listing not found</p>`;return}let i=e.farmer||{},a=getUser(),o=a&&a.role===`buyer`&&e.status===`available`;document.getElementById(`listingContent`).innerHTML=`
                    <div class="card" style="overflow: hidden;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0;">
                            <img src="${n(e.image)}" 
                                 alt="${e.crop_name}"
                                 style="width: 100%; height: 100%; min-height: 300px; object-fit: cover;">
                            <div style="padding: 2rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                    <h1 style="font-size: 2rem;">${e.crop_name}</h1>
                                    <span class="badge badge--${e.status}" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                                        ${e.status}
                                    </span>
                                </div>
                                
                                <p style="color: var(--gray-600); font-size: 1.1rem; margin-bottom: 1.5rem;">
                                    📍 ${e.location}
                                </p>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                                    <div style="padding: 1rem; background: var(--gray-50); border-radius: 0.75rem;">
                                        <p style="color: var(--gray-500); font-size: 0.875rem;">Quantity</p>
                                        <p style="font-size: 1.25rem; font-weight: 600;">${e.quantity} ${e.unit}</p>
                                    </div>
                                    <div style="padding: 1rem; background: var(--primary-50); border-radius: 0.75rem;">
                                        <p style="color: var(--gray-500); font-size: 0.875rem;">Price per ${e.unit}</p>
                                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary-600);">₹${e.price}</p>
                                    </div>
                                </div>

                                ${e.description?`
                                    <div style="margin-bottom: 1.5rem;">
                                        <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 0.5rem;">Description</p>
                                        <p style="color: var(--gray-700);">${e.description}</p>
                                    </div>
                                `:``}

                                <div style="padding: 1rem; background: var(--gray-50); border-radius: 0.75rem; margin-bottom: 1.5rem;">
                                    <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 0.5rem;">Seller</p>
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <img src="${r(i.profile_image,i.name)}" alt="${i.name||`Farmer`}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">
                                        <div>
                                            <p style="font-weight: 600; margin-bottom: 0.25rem;">${i.name||`Farmer`}</p>
                                            <p style="color: var(--gray-600); font-size: 0.9rem; margin: 0;">📍 ${i.location||e.location}</p>
                                        </div>
                                    </div>
                                </div>

                                ${e.status===`available`?`
                                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                        ${o?`
                                            <button class="btn btn--primary btn--lg" onclick="openOfferModal()">
                                                🛒 Buy Now
                                            </button>
                                        `:``}
                                        <a href="https://wa.me/91${i.phone}" target="_blank" class="btn btn--whatsapp btn--lg">
                                            <span>WhatsApp</span>
                                        </a>
                                        <a href="tel:+91${i.phone}" class="btn btn--call btn--lg">
                                            📞 Call Farmer
                                        </a>
                                    </div>
                                    ${a?``:`
                                        <p style="margin-top: 1rem; color: var(--gray-500); font-size: 0.9rem;">
                                            <a href="auth.html">Login as a buyer</a> to send offers
                                        </p>
                                    `}
                                `:`
                                    <div style="padding: 1rem; background: var(--gray-100); border-radius: 0.75rem; text-align: center;">
                                        <p style="color: var(--gray-600);">This listing has been sold</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `}catch(e){document.getElementById(`listingContent`).innerHTML=`<p style="color: var(--error);">Error: ${e.message}</p>`}}var a=JSON.parse(localStorage.getItem(`cart`)||`[]`);function o(){if(!e)return;let t=(parseInt(document.getElementById(`buyQuantity`).value)||0)*e.price;document.getElementById(`modalTotalPrice`).textContent=`₹${t}`}function s(){e&&(document.getElementById(`buyListingId`).value=e.id,document.getElementById(`modalUnit`).textContent=e.unit,document.getElementById(`modalMaxQty`).textContent=e.quantity,document.getElementById(`buyQuantity`).max=e.quantity,document.getElementById(`buyQuantity`).value=1,o(),document.getElementById(`offerModal`).classList.add(`active`))}function c(){document.getElementById(`offerModal`).classList.remove(`active`),document.getElementById(`buyForm`).reset()}document.getElementById(`buyForm`).addEventListener(`submit`,t=>{if(t.preventDefault(),!e)return;let n=parseInt(document.getElementById(`buyQuantity`).value),r=document.getElementById(`buyMessage`).value,i=a.find(t=>t.listing_id===e.id);i?(i.quantity+=n,i.quantity>e.quantity&&(i.quantity=e.quantity)):a.push({listing_id:e.id,crop_name:e.crop_name,price:e.price,quantity:n,unit:e.unit,image:e.image,farmer_id:e.farmer_id||e.farmer?.id,farmer_name:e.farmer?.name||`Farmer`,farmer_image:e.farmer?.profile_image||``,message:r}),localStorage.setItem(`cart`,JSON.stringify(a)),showToast(`Added to cart! Redirecting to cart...`,`success`),setTimeout(()=>{window.location.href=`buyer-dashboard.html#cart`},1e3)}),window.closeOfferModal=c,window.openOfferModal=s,window.updateModalTotal=o;