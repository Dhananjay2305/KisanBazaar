const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/api-DqiYm43F.js","assets/api-CDGBb-Nk.css"])))=>i.map(i=>d[i]);
import{r as h,s as o}from"./api-DqiYm43F.js";import{a as _}from"./auth-DlKCV7tk.js";import{_ as $}from"./preload-helper-ckwbz45p.js";document.addEventListener("DOMContentLoaded",async()=>{try{const e=await _("farmer");if(!e){localStorage.removeItem("token"),localStorage.removeItem("user"),window.location.replace("auth.html");return}document.getElementById("userName").textContent=e.name,document.getElementById("profileName").value=e.name,document.getElementById("profileEmail").value=e.email||"",document.getElementById("profilePhone").value=e.phone||"",document.getElementById("profileRole").value=e.role,document.getElementById("profileLocation").value=e.location||"",e.profile_image&&(document.getElementById("profileImagePreview").src=h(e.profile_image)),document.getElementById("image").addEventListener("change",I),d(),g(),b(),f();const t=["listings","offers","received_orders","add","profile"],n=window.location.hash.replace("#","");t.includes(n)&&u(n)}catch(e){console.error("Farmer dashboard initialization failed:",e),o(e.message||"Connection offline. Retrying in background...","error")}finally{document.documentElement.classList.remove("auth-checking")}});document.querySelectorAll(".sidebar__link").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const n=t.currentTarget.dataset.section;u(n)})});window.addEventListener("hashchange",()=>{const e=["listings","offers","received_orders","add","profile"],t=window.location.hash.replace("#","");e.includes(t)&&u(t)});function u(e){var n,a;(n=document.getElementById("sidebar"))==null||n.classList.remove("open"),["listings","offers","received_orders","add","profile"].includes(e)&&(document.querySelectorAll(".sidebar__link").forEach(i=>i.classList.remove("active")),(a=document.querySelector(`[data-section="${e}"]`))==null||a.classList.add("active"),document.getElementById("listingsSection").style.display=e==="listings"?"block":"none",document.getElementById("offersSection").style.display=e==="offers"?"block":"none",document.getElementById("receivedOrdersSection").style.display=e==="received_orders"?"block":"none",document.getElementById("addSection").style.display=e==="add"?"block":"none",document.getElementById("profileSection").style.display=e==="profile"?"block":"none",e==="received_orders"&&E(),window.location.hash!==`#${e}`&&(window.location.hash=e))}function B(){const e=document.getElementById("sidebar"),t=document.getElementById("mobileOverlay");e.classList.toggle("open"),t&&(t.style.display=e.classList.contains("open")?"block":"none")}async function d(){try{const e=await api.get("/stats/farmer");document.getElementById("statTotalListings").textContent=e.total_listings,document.getElementById("statActiveListings").textContent=e.active_listings,document.getElementById("statTotalOffers").textContent=e.total_offers,document.getElementById("statRevenue").textContent=`₹${e.total_revenue.toLocaleString("en-IN")}`}catch(e){console.error("Stats error:",e.message)}}async function f(){try{const e=await api.get("/notifications"),t=document.getElementById("notifBadge"),n=document.getElementById("notifList");if(e.unread_count>0?(t.style.display="flex",t.textContent=e.unread_count>9?"9+":e.unread_count):t.style.display="none",e.notifications.length===0){n.innerHTML='<p style="padding:1rem;color:var(--gray-500);text-align:center;">No notifications</p>';return}n.innerHTML=e.notifications.slice(0,20).map(a=>`
                    <div class="notification-item ${a.is_read?"":"notification-item--unread"}" onclick="markRead('${a.id}', this)">
                        <span class="notification-item__icon">${a.type==="offer_received"?"💰":a.type==="offer_accepted"?"✅":"❌"}</span>
                        <div>
                            <p class="notification-item__text">${a.message}</p>
                            <small class="notification-item__time">${O(a.created_at)}</small>
                        </div>
                    </div>
                `).join("")}catch(e){console.error("Notification error:",e.message)}}function L(){document.getElementById("notifDropdown").classList.toggle("active")}async function S(e,t){try{await api.put(`/notifications/${e}/read`),t.classList.remove("notification-item--unread"),f()}catch{}}async function k(){try{await api.put("/notifications/read-all"),f(),o("All notifications marked as read","success")}catch{}}function O(e){const t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4);if(n<1)return"Just now";if(n<60)return`${n}m ago`;const a=Math.floor(n/60);return a<24?`${a}h ago`:`${Math.floor(a/24)}d ago`}document.addEventListener("click",e=>{const t=document.getElementById("notifDropdown"),n=document.querySelector(".notification-bell");t.classList.contains("active")&&!t.contains(e.target)&&!n.contains(e.target)&&t.classList.remove("active")});function I(e){const t=e.target.files[0],n=document.getElementById("listingImagePreview"),a=document.getElementById("listingImageName");if(!t){n.style.display="none",n.removeAttribute("src"),a.textContent="";return}if(!t.type.startsWith("image/")){o("Please choose a JPEG, PNG, WebP, or GIF image.","error"),e.target.value="",n.style.display="none",a.textContent="";return}const i=new FileReader;i.onload=s=>{n.src=s.target.result,n.style.display="block"},i.readAsDataURL(t),a.textContent=t.name}function x(){const e=document.getElementById("listingImagePreview");e.style.display="none",e.removeAttribute("src"),document.getElementById("listingImageName").textContent=""}async function g(){try{const t=(await api.get("/listings/my/listings")).listings||[],n=document.getElementById("myListingsGrid");if(t.length===0){n.innerHTML=`
                        <div class="empty-state">
                            <div class="empty-state__icon">📦</div>
                            <h3 class="empty-state__title">No listings yet</h3>
                            <p class="empty-state__text">Start by adding your first produce listing</p>
                            <button class="btn btn--primary" onclick="showSection('add')">Add Listing</button>
                        </div>
                    `;return}n.innerHTML=t.map(a=>`
                    <div class="card">
                        <img src="${h(a.image)}" 
                             alt="${a.crop_name}" class="card__image">
                        <div class="card__content">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <h3 class="card__title">${a.crop_name}</h3>
                                <span class="badge badge--${a.status}">${a.status}</span>
                            </div>
                            <div class="card__meta">
                                📍 ${a.location}
                            </div>
                            <p style="color: var(--gray-600); margin-bottom: 1rem;">
                                ${a.quantity} ${a.unit}
                            </p>
                            <div class="card__price">
                                ₹${a.price} <span>per ${a.unit}</span>
                            </div>
                            <div class="card__footer">
                                <button class="btn btn--secondary btn--sm" onclick="toggleStatus('${a.id}', '${a.status}')">
                                    ${a.status==="available"?"✓ Mark Sold":"↺ Mark Available"}
                                </button>
                                <button class="btn btn--error btn--sm" onclick="deleteListing('${a.id}')">
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join("")}catch(e){o(e.message,"error")}}async function b(){try{const t=(await api.get("/offers/received")).offers||[],n=document.getElementById("offersTableBody"),a=document.getElementById("noOffersMessage"),i=document.getElementById("offersTable");if(t.length===0){i.style.display="none",a.style.display="block";return}i.style.display="table",a.style.display="none",n.innerHTML=t.map(s=>{var c,r,p,l,m;return`
                    <tr>
                        <td><strong>${((c=s.listing)==null?void 0:c.crop_name)||"N/A"}</strong></td>
                        <td>
                            ${((r=s.buyer)==null?void 0:r.name)||"Unknown"}<br>
                            <small style="color: var(--gray-500);">${((p=s.buyer)==null?void 0:p.phone)||""}</small>
                        </td>
                        <td>₹${((l=s.listing)==null?void 0:l.price)||0}</td>
                        <td><strong style="color: var(--primary-600);">₹${s.offer_price}</strong></td>
                        <td style="max-width: 200px;">${s.message||"-"}</td>
                        <td><span class="badge badge--${s.status}">${s.status}</span></td>
                        <td>
                            ${s.status==="pending"?`
                                <div class="offers-table__actions">
                                    <button class="btn btn--success btn--sm" onclick="acceptOffer('${s.id}')">✓ Accept</button>
                                    <button class="btn btn--error btn--sm" onclick="rejectOffer('${s.id}')">✗ Reject</button>
                                </div>
                            `:s.status==="accepted"?`
                                <a href="https://wa.me/91${(m=s.buyer)==null?void 0:m.phone}" target="_blank" class="btn btn--whatsapp btn--sm">
                                    WhatsApp
                                </a>
                            `:"-"}
                        </td>
                    </tr>
                `}).join("")}catch(e){o(e.message,"error")}}async function E(){try{const t=(await api.get("/orders/farmer")).orders||[],n=document.getElementById("receivedOrdersTableBody"),a=document.getElementById("noReceivedOrdersMessage"),i=document.getElementById("receivedOrdersTable");if(t.length===0){i.style.display="none",a.style.display="block";return}i.style.display="table",a.style.display="none",n.innerHTML=t.map(s=>{var l,m;const c=s.total_amount,r=s.status||"pending";return`
                    <tr>
                        <td><small>#${s.id.substring(s.id.length-8)}</small></td>
                        <td>
                            ${((l=s.buyer)==null?void 0:l.name)||"Unknown"}<br>
                            <small style="color: var(--gray-500);">${((m=s.buyer)==null?void 0:m.phone)||""}</small>
                        </td>
                        <td>
                            ${s.items.map(y=>`${y.crop_name} (${y.quantity}${y.unit})`).join(", ")}
                        </td>
                        <td><strong>₹${c}</strong></td>
                        <td style="max-width: 200px;"><small>${s.shipping_address}</small></td>
                        <td>
                            <span class="badge badge--${r}">${r}</span>
                            ${s.payment_status==="completed"?'<br><small style="color:var(--success-600)">● Paid</small>':""}
                        </td>
                        <td>
                            <div class="offers-table__actions">
                                ${r==="pending"?`
                                    <button class="btn btn--success btn--sm" onclick="updateOrderStatus('${s.id}', 'accepted')">✓ Accept</button>
                                    <button class="btn btn--error btn--sm" onclick="updateOrderStatus('${s.id}', 'rejected')">✗ Reject</button>
                                `:r==="accepted"?`
                                    <button class="btn btn--primary btn--sm" onclick="updateOrderStatus('${s.id}', 'shipped')">🚢 Ship</button>
                                `:r==="shipped"?`
                                    <button class="btn btn--accent btn--sm" onclick="updateOrderStatus('${s.id}', 'delivered')">✅ Deliver</button>
                                `:"-"}
                            </div>
                        </td>
                    </tr>
                `}).join("")}catch(e){o(e.message,"error")}}async function A(e,t){try{const n=await api.request(`/orders/${e}/status`,{method:"PATCH",body:JSON.stringify({status:t})});o(`Order #${e.substring(e.length-8)} marked as ${t}`,"success"),E(),d()}catch(n){console.error("Status Update Error:",n),o(n.message,"error")}}function v(e){const t=document.getElementById("createListingBtn"),n=t==null?void 0:t.querySelector(".btn-text");!t||!n||(t.disabled=e,n.innerHTML=e?'<span class="loading-spinner"></span> Uploading...':"✓ Create Listing")}function w(e){const t=document.getElementById("listingFormError");if(!e){t.style.display="none",t.textContent="";return}t.textContent=e,t.style.display="block"}document.getElementById("addListingForm").addEventListener("submit",async e=>{e.preventDefault(),w("");const t=new FormData;t.append("cropName",document.getElementById("cropName").value.trim()),t.append("category",document.getElementById("category").value),t.append("quantity",document.getElementById("quantity").value),t.append("unit",document.getElementById("unit").value),t.append("price",document.getElementById("price").value),t.append("location",document.getElementById("location").value.trim()),t.append("description",document.getElementById("description").value.trim());const n=document.getElementById("image").files[0];n&&t.append("image",n),v(!0);try{await api.postForm("/listings",t),o("Listing created successfully!","success"),e.target.reset(),x(),u("listings"),g(),d()}catch(a){w(a.message),o(a.message,"error")}finally{v(!1)}});async function T(e,t){const n=t==="available"?"sold":"available";try{await api.put(`/listings/${e}`,{status:n}),o(`Listing marked as ${n}`,"success"),g(),d()}catch(a){o(a.message,"error")}}async function P(e){if(confirm("Are you sure you want to delete this listing?"))try{await api.delete(`/listings/${e}`),o("Listing deleted","success"),g(),d()}catch(t){o(t.message,"error")}}async function D(e){try{await api.put(`/offers/${e}/accept`),o("Offer accepted! Listing marked as sold.","success"),b(),g(),d()}catch(t){o(t.message,"error")}}async function M(e){try{await api.put(`/offers/${e}/reject`),o("Offer rejected","info"),b()}catch(t){o(t.message,"error")}}function C(e){const t=e.target.files[0];if(t){const n=new FileReader;n.onload=function(a){document.getElementById("profileImagePreview").src=a.target.result},n.readAsDataURL(t)}}document.getElementById("profileForm").addEventListener("submit",async e=>{var a;e.preventDefault();const t=new FormData;t.append("name",document.getElementById("profileName").value),t.append("email",document.getElementById("profileEmail").value),t.append("phone",document.getElementById("profilePhone").value),t.append("location",document.getElementById("profileLocation").value);const n=(a=document.getElementById("profileImageInput"))==null?void 0:a.files[0];n&&t.append("profileImage",n);try{const i=await api.putForm("/auth/profile",t);if(window.saveSession(window.getToken(),i.user),document.getElementById("userName").textContent=i.user.name,i.user.profile_image){const{resolveImageUrl:s}=await $(async()=>{const{resolveImageUrl:c}=await import("./api-DqiYm43F.js").then(r=>r.i);return{resolveImageUrl:c}},__vite__mapDeps([0,1]));document.getElementById("profileImagePreview").src=s(i.user.profile_image)}o("Profile updated!","success")}catch(i){o(i.message,"error")}});window.showSection=u;window.toggleSidebar=B;window.toggleNotifications=L;window.markRead=S;window.markAllRead=k;window.toggleStatus=T;window.deleteListing=P;window.acceptOffer=D;window.rejectOffer=M;window.updateOrderStatus=A;window.previewProfileImage=C;window.previewListingImage=I;
