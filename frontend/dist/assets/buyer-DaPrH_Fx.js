const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/api-DqiYm43F.js","assets/api-CDGBb-Nk.css"])))=>i.map(i=>d[i]);
import{s as d,r as h}from"./api-DqiYm43F.js";import{a as x}from"./auth-DlKCV7tk.js";import{_ as B}from"./preload-helper-ckwbz45p.js";let v=null,m=[],p=null;function k(){if(!navigator.geolocation){d("Geolocation not supported","error");return}d("Detecting location...","info"),navigator.geolocation.getCurrentPosition(e=>{p={lat:e.coords.latitude,lng:e.coords.longitude},d("Location updated! Sorting by distance...","success"),document.getElementById("priceSort").value="distance",y()},e=>{d("Location error: "+e.message,"error")})}function C(e,t,o,r){if(!e||!t||!o||!r)return null;const i=6371,a=(o-e)*Math.PI/180,n=(r-t)*Math.PI/180,s=Math.sin(a/2)*Math.sin(a/2)+Math.cos(e*Math.PI/180)*Math.cos(o*Math.PI/180)*Math.sin(n/2)*Math.sin(n/2),u=2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));return i*u}document.addEventListener("DOMContentLoaded",async()=>{try{const e=await x("buyer");if(!e){localStorage.removeItem("token"),localStorage.removeItem("user"),window.location.replace("auth.html");return}if(document.getElementById("userName").textContent=e.name,document.getElementById("profileName").value=e.name,document.getElementById("profileEmail").value=e.email||"",document.getElementById("profilePhone").value=e.phone||"",document.getElementById("profileRole").value=e.role,document.getElementById("profileLocation").value=e.location||"",e.profile_image){const{resolveImageUrl:r}=await B(async()=>{const{resolveImageUrl:i}=await import("./api-DqiYm43F.js").then(a=>a.i);return{resolveImageUrl:i}},__vite__mapDeps([0,1]));document.getElementById("profileImagePreview").src=r(e.profile_image)}T(),y(),F(),I(),$();const t=["browse","cart","offers","orders","profile"],o=window.location.hash.replace("#","");t.includes(o)?f(o):f("browse")}catch(e){console.error("Buyer dashboard initialization failed:",e),d(e.message||"Connection offline. Retrying in background...","error")}finally{document.documentElement.classList.remove("auth-checking")}});document.querySelectorAll(".sidebar__link").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const o=t.target.dataset.section;f(o)})});window.addEventListener("hashchange",()=>{const e=["browse","cart","offers","orders","profile"],t=window.location.hash.replace("#","");e.includes(t)&&f(t)});function f(e){var o;["browse","cart","offers","orders","profile"].includes(e)&&(document.querySelectorAll(".sidebar__link").forEach(r=>r.classList.remove("active")),(o=document.querySelector(`[data-section="${e}"]`))==null||o.classList.add("active"),document.getElementById("browseSection").style.display=e==="browse"?"block":"none",document.getElementById("offersSection").style.display=e==="offers"?"block":"none",document.getElementById("ordersSection").style.display=e==="orders"?"block":"none",document.getElementById("cartSection").style.display=e==="cart"?"block":"none",document.getElementById("profileSection").style.display=e==="profile"?"block":"none",e==="cart"?E():e==="orders"&&N(),window.location.hash!==`#${e}`&&(window.location.hash=e))}function S(){document.getElementById("sidebar").classList.toggle("open")}async function T(){try{const e=await api.get("/stats/buyer");document.getElementById("statTotalOffers").textContent=e.total_offers,document.getElementById("statAccepted").textContent=e.accepted_offers,document.getElementById("statPending").textContent=e.pending_offers,document.getElementById("statRejected").textContent=e.rejected_offers}catch(e){console.error("Stats error:",e.message)}}async function I(){try{const e=await api.get("/notifications"),t=document.getElementById("notifBadge"),o=document.getElementById("notifList");if(e.unread_count>0?(t.style.display="flex",t.textContent=e.unread_count>9?"9+":e.unread_count):t.style.display="none",e.notifications.length===0){o.innerHTML='<p style="padding:1rem;color:var(--gray-500);text-align:center;">No notifications</p>';return}o.innerHTML=e.notifications.slice(0,20).map(r=>`
                    <div class="notification-item ${r.is_read?"":"notification-item--unread"}" onclick="markRead('${r.id}', this)">
                        <span class="notification-item__icon">${r.type==="offer_received"?"💰":r.type==="offer_accepted"?"✅":"❌"}</span>
                        <div>
                            <p class="notification-item__text">${r.message}</p>
                            <small class="notification-item__time">${O(r.created_at)}</small>
                        </div>
                    </div>
                `).join("")}catch(e){console.error("Notification error:",e.message)}}function q(){document.getElementById("notifDropdown").classList.toggle("active")}async function P(e,t){try{await api.put(`/notifications/${e}/read`),t.classList.remove("notification-item--unread"),I()}catch{}}async function D(){try{await api.put("/notifications/read-all"),I(),d("All notifications marked as read","success")}catch{}}function O(e){const t=Date.now()-new Date(e).getTime(),o=Math.floor(t/6e4);if(o<1)return"Just now";if(o<60)return`${o}m ago`;const r=Math.floor(o/60);return r<24?`${r}h ago`:`${Math.floor(r/24)}d ago`}document.addEventListener("click",e=>{const t=document.getElementById("notifDropdown"),o=document.querySelector(".notification-bell");t.classList.contains("active")&&!t.contains(e.target)&&!o.contains(e.target)&&t.classList.remove("active")});function A(e,t){document.querySelectorAll(".category-pill").forEach(o=>o.classList.remove("active")),e.classList.add("active"),document.getElementById("searchCrop").value=t,y()}function b(e,t="Farmer"){const o=`https://ui-avatars.com/api/?name=${encodeURIComponent(t)}&background=10B981&color=fff`;return h(e,o)}async function y(){const e=document.getElementById("listingsGrid");e.innerHTML='<div class="spinner" style="margin: 2rem auto;"></div>';try{const t=document.getElementById("searchCrop").value,o=document.getElementById("searchLocation").value;let r="/listings?status=available";t&&(r+=`&crop=${encodeURIComponent(t)}`),o&&(r+=`&location=${encodeURIComponent(o)}`),m=(await api.get(r)).listings||[],m.forEach(n=>{var s;p&&((s=n.farmerId)!=null&&s.coordinates)&&(n.distance=C(p.lat,p.lng,n.farmerId.coordinates.lat,n.farmerId.coordinates.lng))});const a=document.getElementById("priceSort").value;if(a==="low"?m.sort((n,s)=>n.price-s.price):a==="high"?m.sort((n,s)=>s.price-n.price):a==="distance"&&p&&m.sort((n,s)=>(n.distance||9999)-(s.distance||9999)),m.length===0){e.innerHTML=`
                        <div class="empty-state" style="grid-column: 1/-1;">
                            <div class="empty-state__icon">🔍</div>
                            <h3 class="empty-state__title">No listings found</h3>
                            <p class="empty-state__text">Try adjusting your filters or check back later</p>
                        </div>
                    `;return}e.innerHTML=m.map(n=>{var s,u,g;return`
                    <div class="card">
                        <img src="${h(n.image)}" 
                             alt="${n.crop_name}" class="card__image">
                        <div class="card__content">
                            <h3 class="card__title">${n.crop_name}</h3>
                            ${n.category?`<span class="badge" style="margin-bottom:0.5rem;display:inline-block;">${n.category}</span>`:""}
                            <div class="card__meta">
                                📍 ${n.location}
                            </div>
                            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">
                                ${n.quantity} ${n.unit} available
                            </p>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <img src="${b((s=n.farmer)==null?void 0:s.profile_image,(u=n.farmer)==null?void 0:u.name)}" alt="Farmer" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                                <p style="color: var(--gray-500); font-size: 0.875rem; margin: 0;">
                                    by ${((g=n.farmer)==null?void 0:g.name)||"Farmer"}
                                </p>
                            </div>
                            ${n.distance!==void 0?`<p style="color: var(--primary-600); font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem;">📏 ${n.distance.toFixed(1)} km away</p>`:'<div style="margin-bottom:1rem;"></div>'}
                            <div class="card__price">
                                ₹${n.price} <span>per ${n.unit}</span>
                            </div>
                            <div class="card__footer">
                                <button class="btn btn--primary btn--sm" onclick="openOfferModalById('${n.id}')">
                                    🛒 Buy Now
                                </button>
                                <a href="listing.html?id=${n.id}" class="btn btn--secondary btn--sm">
                                    View Details
                                </a>
                            </div>
                        </div>
                    </div>
                `}).join("")}catch(t){e.innerHTML=`<p style="color: var(--error);">Error loading listings: ${t.message}</p>`}}let c=JSON.parse(localStorage.getItem("cart")||"[]"),l=null;function $(){const e=document.getElementById("cartBadge");e&&(c.length>0?(e.style.display="inline-block",e.textContent=c.length):e.style.display="none")}function w(){localStorage.setItem("cart",JSON.stringify(c)),$()}function L(){if(!l)return;const t=(parseInt(document.getElementById("buyQuantity").value)||0)*l.price;document.getElementById("modalTotalPrice").textContent=`₹${t}`}async function F(){try{const t=(await api.get("/offers/sent")).offers||[],o=document.getElementById("offersTableBody"),r=document.getElementById("noOffersMessage"),i=document.getElementById("offersTable");if(t.length===0){i.style.display="none",r.style.display="block";return}i.style.display="table",r.style.display="none",o.innerHTML=t.map(a=>{var u,g,_;const n=((u=a.listing)==null?void 0:u.farmer)||{},s=n.phone||"";return`
                    <tr>
                        <td><strong>${((g=a.listing)==null?void 0:g.crop_name)||"N/A"}</strong></td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="${b(n.profile_image,n.name)}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                                <div>
                                    ${n.name||"Unknown"}<br>
                                    <small style="color: var(--gray-500);">${n.location||""}</small>
                                </div>
                            </div>
                        </td>
                        <td>${a.quantity||1} ${((_=a.listing)==null?void 0:_.unit)||""}</td>
                        <td><strong style="color: var(--primary-600);">₹${a.offer_price*(a.quantity||1)}</strong></td>
                        <td><span class="badge badge--${a.status}">${a.status}</span></td>
                        <td>
                            ${a.status==="accepted"?`
                                <div style="display: flex; gap: 0.5rem;">
                                    <a href="https://wa.me/91${s}" target="_blank" class="btn btn--whatsapp btn--sm">
                                        WhatsApp
                                    </a>
                                    <a href="tel:+91${s}" class="btn btn--call btn--sm">
                                        📞 Call
                                    </a>
                                </div>
                            `:"-"}
                        </td>
                    </tr>
                `}).join("")}catch(e){d(e.message,"error")}}function R(e){var o,r,i;const t=m.find(a=>a.id===e);t&&(l=t,document.getElementById("buyListingId").value=t.id,document.getElementById("modalUnit").textContent=t.unit,document.getElementById("modalMaxQty").textContent=t.quantity,document.getElementById("buyQuantity").max=t.quantity,document.getElementById("buyQuantity").value=1,document.getElementById("modalListingInfo").innerHTML=`
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img src="${h(t.image)}" 
                         style="width: 60px; height: 60px; border-radius: 0.5rem; object-fit: cover;">
                    <div style="flex: 1;">
                        <strong>${t.crop_name}</strong><br>
                        <span style="color: var(--gray-500);">₹${t.price} per ${t.unit}</span><br>
                        <span style="color: var(--gray-500);">📍 ${t.location}</span>
                    </div>
                    <div style="text-align: right; border-left: 1px solid var(--gray-200); padding-left: 1rem;">
                        <img src="${b((o=t.farmer)==null?void 0:o.profile_image,(r=t.farmer)==null?void 0:r.name)}" alt="Farmer" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-bottom: 0.25rem;"><br>
                        <small style="color: var(--gray-500);">${((i=t.farmer)==null?void 0:i.name)||"Farmer"}</small>
                    </div>
                </div>
            `,L(),document.getElementById("offerModal").classList.add("active"))}function M(){document.getElementById("offerModal").classList.remove("active"),document.getElementById("buyForm").reset(),l=null}document.getElementById("buyForm").addEventListener("submit",e=>{var i,a,n;if(e.preventDefault(),!l)return;const t=parseInt(document.getElementById("buyQuantity").value),o=document.getElementById("buyMessage").value,r=c.find(s=>s.listing_id===l.id);r?(r.quantity+=t,r.quantity>l.quantity&&(r.quantity=l.quantity)):c.push({listing_id:l.id,crop_name:l.crop_name,price:l.price,quantity:t,unit:l.unit,image:l.image,farmer_id:l.farmer_id||((i=l.farmer)==null?void 0:i.id),farmer_name:((a=l.farmer)==null?void 0:a.name)||"Farmer",farmer_image:((n=l.farmer)==null?void 0:n.profile_image)||"",message:o}),w(),d("Added to cart!","success"),M()});function E(){const e=document.getElementById("cartList"),t=document.getElementById("cartEmpty"),o=document.getElementById("cartTable"),r=document.getElementById("cartFooter");if(c.length===0){o.style.display="none",r.style.display="none",t.style.display="block";return}o.style.display="table",r.style.display="flex",t.style.display="none";let i=0;e.innerHTML=c.map((a,n)=>{const s=a.price*a.quantity;return i+=s,`
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <img src="${h(a.image)}" style="width: 40px; height: 40px; border-radius: 0.25rem; object-fit: cover;">
                                <div>
                                    <strong>${a.crop_name}</strong><br>
                                    <div style="display: flex; align-items: center; gap: 0.25rem; margin-top: 0.25rem;">
                                        <img src="${b(a.farmer_image,a.farmer_name)}" style="width: 16px; height: 16px; border-radius: 50%; object-fit: cover;">
                                        <small style="color: var(--gray-500);">by ${a.farmer_name}</small>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>${a.quantity} ${a.unit}</td>
                        <td>₹${a.price}</td>
                        <td><strong>₹${s}</strong></td>
                        <td>
                            <button class="btn btn--sm btn--secondary" onclick="removeFromCart(${n})" style="color: var(--error); padding:0.25rem 0.5rem; font-size:0.8rem;">Remove</button>
                        </td>
                    </tr>
                `}).join(""),document.getElementById("cartTotalAmount").textContent=`₹${i}`}function U(e){c.splice(e,1),w(),E()}function j(){confirm("Are you sure you want to empty your cart?")&&(c=[],w(),E())}function H(){c.length!==0&&(window.location.href="checkout.html")}async function N(){try{const t=(await api.get("/orders/buyer")).orders||[],o=document.getElementById("ordersTableBody"),r=document.getElementById("noOrdersMessage"),i=document.getElementById("ordersTable");if(t.length===0){i.style.display="none",r.style.display="block";return}i.style.display="table",r.style.display="none",o.innerHTML=t.map(a=>`
                    <tr>
                        <td><small>#${a.id.substring(a.id.length-8)}</small></td>
                        <td>${new Date(a.created_at).toLocaleDateString()}</td>
                        <td>
                            ${a.items.map(n=>`${n.crop_name} (${n.quantity}${n.unit})`).join(", ")}
                        </td>
                        <td><strong>₹${a.total_amount}</strong></td>
                        <td><span class="badge badge--${a.payment_status==="completed"?"accepted":"pending"}">${a.payment_status==="completed"?"Paid":"Pending"}</span></td>
                        <td>${a.payment_method||"N/A"}</td>
                    </tr>
                `).join("")}catch(e){d(e.message,"error")}}document.getElementById("searchCrop").addEventListener("input",()=>{clearTimeout(v),v=setTimeout(()=>y(),500)});document.getElementById("searchLocation").addEventListener("input",()=>{clearTimeout(v),v=setTimeout(()=>y(),500)});document.getElementById("priceSort").addEventListener("change",()=>y());function Q(e){const t=e.target.files[0];if(t){const o=new FileReader;o.onload=function(r){document.getElementById("profileImagePreview").src=r.target.result},o.readAsDataURL(t)}}document.getElementById("profileForm").addEventListener("submit",async e=>{var r;e.preventDefault();const t=new FormData;t.append("name",document.getElementById("profileName").value),t.append("email",document.getElementById("profileEmail").value),t.append("phone",document.getElementById("profilePhone").value),t.append("location",document.getElementById("profileLocation").value);const o=(r=document.getElementById("profileImageInput"))==null?void 0:r.files[0];o&&t.append("profileImage",o);try{const i=await api.putForm("/auth/profile",t);if(window.saveSession(window.getToken(),i.user),document.getElementById("userName").textContent=i.user.name,i.user.profile_image){const{resolveImageUrl:a}=await B(async()=>{const{resolveImageUrl:n}=await import("./api-DqiYm43F.js").then(s=>s.i);return{resolveImageUrl:n}},__vite__mapDeps([0,1]));document.getElementById("profileImagePreview").src=a(i.user.profile_image)}d("Profile updated!","success")}catch(i){d(i.message,"error")}});window.previewProfileImage=Q;window.toggleNotifications=q;window.markAllRead=D;window.toggleSidebar=S;window.filterByCategory=A;window.detectUserLocation=k;window.loadListings=y;window.showSection=f;window.markRead=P;window.openOfferModalById=R;window.closeOfferModal=M;window.clearCartUI=j;window.removeFromCart=U;window.placeOrder=H;window.updateModalTotal=L;
