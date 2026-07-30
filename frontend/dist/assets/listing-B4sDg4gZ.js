import{r as d}from"./api-BHxz7L8x.js";import"./auth-DBSquTju.js";import"./push-notifications-CQmv0i8S.js";let e=null;const g="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=400&fit=crop";function p(a,r="Farmer"){const t=`https://ui-avatars.com/api/?name=${encodeURIComponent(r)}&background=10B981&color=fff`;return d(a,t)}document.addEventListener("DOMContentLoaded",()=>{const a=getUser();a&&(document.getElementById("navActions").innerHTML=`
                    <a href="${a.role==="farmer"?"farmer-dashboard.html":"buyer-dashboard.html"}" class="btn btn--primary">Dashboard</a>
                `);const t=new URLSearchParams(window.location.search).get("id");t?u(t):document.getElementById("listingContent").innerHTML="<p>Listing not found</p>"});async function u(a){try{if(e=(await api.get(`/listings/${a}`)).listing,!e){document.getElementById("listingContent").innerHTML="<p>Listing not found</p>";return}const t=e.farmer||{},n=getUser(),i=n&&n.role==="buyer"&&e.status==="available";document.getElementById("listingContent").innerHTML=`
                    <div class="card" style="overflow: hidden;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0;">
                            <img src="${d(e.image,g)}" 
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
                                `:""}

                                <div style="padding: 1rem; background: var(--gray-50); border-radius: 0.75rem; margin-bottom: 1.5rem;">
                                    <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 0.5rem;">Seller</p>
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <img src="${p(t.profile_image,t.name)}" alt="${t.name||"Farmer"}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">
                                        <div>
                                            <p style="font-weight: 600; margin-bottom: 0.25rem;">${t.name||"Farmer"}</p>
                                            <p style="color: var(--gray-600); font-size: 0.9rem; margin: 0;">📍 ${t.location||e.location}</p>
                                        </div>
                                    </div>
                                </div>

                                ${e.status==="available"?`
                                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                        ${i?`
                                            <button class="btn btn--primary btn--lg" onclick="openOfferModal()">
                                                🛒 Buy Now
                                            </button>
                                        `:""}
                                        <a href="https://wa.me/91${t.phone}" target="_blank" class="btn btn--whatsapp btn--lg">
                                            <span>WhatsApp</span>
                                        </a>
                                        <a href="tel:+91${t.phone}" class="btn btn--call btn--lg">
                                            📞 Call Farmer
                                        </a>
                                    </div>
                                    ${n?"":`
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
                `}catch(r){document.getElementById("listingContent").innerHTML=`<p style="color: var(--error);">Error: ${r.message}</p>`}}let o=JSON.parse(localStorage.getItem("cart")||"[]");function m(){if(!e)return;const r=(parseInt(document.getElementById("buyQuantity").value)||0)*e.price;document.getElementById("modalTotalPrice").textContent=`₹${r}`}function y(){e&&(document.getElementById("buyListingId").value=e.id,document.getElementById("modalUnit").textContent=e.unit,document.getElementById("modalMaxQty").textContent=e.quantity,document.getElementById("buyQuantity").max=e.quantity,document.getElementById("buyQuantity").value=1,m(),document.getElementById("offerModal").classList.add("active"))}function f(){document.getElementById("offerModal").classList.remove("active"),document.getElementById("buyForm").reset()}document.getElementById("buyForm").addEventListener("submit",a=>{var i,s,l;if(a.preventDefault(),!e)return;const r=parseInt(document.getElementById("buyQuantity").value),t=document.getElementById("buyMessage").value,n=o.find(c=>c.listing_id===e.id);n?(n.quantity+=r,n.quantity>e.quantity&&(n.quantity=e.quantity)):o.push({listing_id:e.id,crop_name:e.crop_name,price:e.price,quantity:r,unit:e.unit,image:e.image,farmer_id:e.farmer_id||((i=e.farmer)==null?void 0:i.id),farmer_name:((s=e.farmer)==null?void 0:s.name)||"Farmer",farmer_image:((l=e.farmer)==null?void 0:l.profile_image)||"",message:t}),localStorage.setItem("cart",JSON.stringify(o)),showToast("Added to cart! Redirecting to cart...","success"),setTimeout(()=>{window.location.href="buyer-dashboard.html#cart"},1e3)});window.closeOfferModal=f;window.openOfferModal=y;window.updateModalTotal=m;
