import"./auth-BVt79YaJ.js";/* empty css              */var e=`http://127.0.0.1:5001`,t=null,n=[],r=null;function i(){if(!navigator.geolocation){showToast(`Geolocation not supported`,`error`);return}showToast(`Detecting location...`,`info`),navigator.geolocation.getCurrentPosition(e=>{r={lat:e.coords.latitude,lng:e.coords.longitude},showToast(`Location updated! Sorting by distance...`,`success`),document.getElementById(`priceSort`).value=`distance`,_()},e=>{showToast(`Location error: `+e.message,`error`)})}function a(e,t,n,r){if(!e||!t||!n||!r)return null;let i=(n-e)*Math.PI/180,a=(r-t)*Math.PI/180,o=Math.sin(i/2)*Math.sin(i/2)+Math.cos(e*Math.PI/180)*Math.cos(n*Math.PI/180)*Math.sin(a/2)*Math.sin(a/2);return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}document.addEventListener(`DOMContentLoaded`,()=>{let e=getUser();if(!e||e.role!==`buyer`){window.location.href=`auth.html`;return}document.getElementById(`userName`).textContent=e.name,document.getElementById(`profileName`).value=e.name,document.getElementById(`profilePhone`).value=e.phone,document.getElementById(`profileRole`).value=e.role,document.getElementById(`profileLocation`).value=e.location||``,c(),_(),C(),l(),b(),window.location.hash===`#cart`&&o(`cart`)}),document.querySelectorAll(`.sidebar__link`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=e.target.dataset.section;o(t)})});function o(e){document.querySelectorAll(`.sidebar__link`).forEach(e=>e.classList.remove(`active`)),document.querySelector(`[data-section="${e}"]`)?.classList.add(`active`),document.getElementById(`browseSection`).style.display=e===`browse`?`block`:`none`,document.getElementById(`offersSection`).style.display=e===`offers`?`block`:`none`,document.getElementById(`ordersSection`).style.display=e===`orders`?`block`:`none`,document.getElementById(`cartSection`).style.display=e===`cart`?`block`:`none`,document.getElementById(`profileSection`).style.display=e===`profile`?`block`:`none`,e===`cart`?E():e===`orders`&&A()}function s(){document.getElementById(`sidebar`).classList.toggle(`open`)}async function c(){try{let e=await api.get(`/stats/buyer`);document.getElementById(`statTotalOffers`).textContent=e.total_offers,document.getElementById(`statAccepted`).textContent=e.accepted_offers,document.getElementById(`statPending`).textContent=e.pending_offers,document.getElementById(`statRejected`).textContent=e.rejected_offers}catch(e){console.error(`Stats error:`,e.message)}}async function l(){try{let e=await api.get(`/notifications`),t=document.getElementById(`notifBadge`),n=document.getElementById(`notifList`);if(e.unread_count>0?(t.style.display=`flex`,t.textContent=e.unread_count>9?`9+`:e.unread_count):t.style.display=`none`,e.notifications.length===0){n.innerHTML=`<p style="padding:1rem;color:var(--gray-500);text-align:center;">No notifications</p>`;return}n.innerHTML=e.notifications.slice(0,20).map(e=>`
                    <div class="notification-item ${e.is_read?``:`notification-item--unread`}" onclick="markRead('${e.id}', this)">
                        <span class="notification-item__icon">${e.type===`offer_received`?`💰`:e.type===`offer_accepted`?`✅`:`❌`}</span>
                        <div>
                            <p class="notification-item__text">${e.message}</p>
                            <small class="notification-item__time">${p(e.created_at)}</small>
                        </div>
                    </div>
                `).join(``)}catch(e){console.error(`Notification error:`,e.message)}}function u(){document.getElementById(`notifDropdown`).classList.toggle(`active`)}async function d(e,t){try{await api.put(`/notifications/${e}/read`),t.classList.remove(`notification-item--unread`),l()}catch{}}async function f(){try{await api.put(`/notifications/read-all`),l(),showToast(`All notifications marked as read`,`success`)}catch{}}function p(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4);if(n<1)return`Just now`;if(n<60)return`${n}m ago`;let r=Math.floor(n/60);return r<24?`${r}h ago`:`${Math.floor(r/24)}d ago`}document.addEventListener(`click`,e=>{let t=document.getElementById(`notifDropdown`),n=document.querySelector(`.notification-bell`);t.classList.contains(`active`)&&!t.contains(e.target)&&!n.contains(e.target)&&t.classList.remove(`active`)});function m(e,t){document.querySelectorAll(`.category-pill`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),document.getElementById(`searchCrop`).value=t,_()}function h(t){return t?t.startsWith(`http`)?t:e+t:`https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=200&fit=crop`}function g(t,n=`Farmer`){return t?t.startsWith(`http`)?t:e+t:`https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=10B981&color=fff`}async function _(){let e=document.getElementById(`listingsGrid`);e.innerHTML=`<div class="spinner" style="margin: 2rem auto;"></div>`;try{let t=document.getElementById(`searchCrop`).value,i=document.getElementById(`searchLocation`).value,o=`/listings?status=available`;t&&(o+=`&crop=${encodeURIComponent(t)}`),i&&(o+=`&location=${encodeURIComponent(i)}`),n=(await api.get(o)).listings||[],n.forEach(e=>{r&&e.farmerId?.coordinates&&(e.distance=a(r.lat,r.lng,e.farmerId.coordinates.lat,e.farmerId.coordinates.lng))});let s=document.getElementById(`priceSort`).value;if(s===`low`?n.sort((e,t)=>e.price-t.price):s===`high`?n.sort((e,t)=>t.price-e.price):s===`distance`&&r&&n.sort((e,t)=>(e.distance||9999)-(t.distance||9999)),n.length===0){e.innerHTML=`
                        <div class="empty-state" style="grid-column: 1/-1;">
                            <div class="empty-state__icon">🔍</div>
                            <h3 class="empty-state__title">No listings found</h3>
                            <p class="empty-state__text">Try adjusting your filters or check back later</p>
                        </div>
                    `;return}e.innerHTML=n.map(e=>`
                    <div class="card">
                        <img src="${h(e.image)}" 
                             alt="${e.crop_name}" class="card__image">
                        <div class="card__content">
                            <h3 class="card__title">${e.crop_name}</h3>
                            <div class="card__meta">
                                📍 ${e.location}
                            </div>
                            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">
                                ${e.quantity} ${e.unit} available
                            </p>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <img src="${g(e.farmer?.profile_image,e.farmer?.name)}" alt="Farmer" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                                <p style="color: var(--gray-500); font-size: 0.875rem; margin: 0;">
                                    by ${e.farmer?.name||`Farmer`}
                                </p>
                            </div>
                            ${e.distance===void 0?`<div style="margin-bottom:1rem;"></div>`:`<p style="color: var(--primary-600); font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem;">📏 ${e.distance.toFixed(1)} km away</p>`}
                            <div class="card__price">
                                ₹${e.price} <span>per ${e.unit}</span>
                            </div>
                            <div class="card__footer">
                                <button class="btn btn--primary btn--sm" onclick="openOfferModalById('${e.id}')">
                                    🛒 Buy Now
                                </button>
                                <a href="listing.html?id=${e.id}" class="btn btn--secondary btn--sm">
                                    View Details
                                </a>
                            </div>
                        </div>
                    </div>
                `).join(``)}catch(t){e.innerHTML=`<p style="color: var(--error);">Error loading listings: ${t.message}</p>`}}var v=JSON.parse(localStorage.getItem(`cart`)||`[]`),y=null;function b(){let e=document.getElementById(`cartBadge`);e&&(v.length>0?(e.style.display=`inline-block`,e.textContent=v.length):e.style.display=`none`)}function x(){localStorage.setItem(`cart`,JSON.stringify(v)),b()}function S(){if(!y)return;let e=(parseInt(document.getElementById(`buyQuantity`).value)||0)*y.price;document.getElementById(`modalTotalPrice`).textContent=`₹${e}`}async function C(){try{let e=(await api.get(`/offers/sent`)).offers||[],t=document.getElementById(`offersTableBody`),n=document.getElementById(`noOffersMessage`),r=document.getElementById(`offersTable`);if(e.length===0){r.style.display=`none`,n.style.display=`block`;return}r.style.display=`table`,n.style.display=`none`,t.innerHTML=e.map(e=>{let t=e.listing?.farmer||{},n=t.phone||``;return`
                    <tr>
                        <td><strong>${e.listing?.crop_name||`N/A`}</strong></td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="${g(t.profile_image,t.name)}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                                <div>
                                    ${t.name||`Unknown`}<br>
                                    <small style="color: var(--gray-500);">${t.location||``}</small>
                                </div>
                            </div>
                        </td>
                        <td>${e.quantity||1} ${e.listing?.unit||``}</td>
                        <td><strong style="color: var(--primary-600);">₹${e.offer_price*(e.quantity||1)}</strong></td>
                        <td><span class="badge badge--${e.status}">${e.status}</span></td>
                        <td>
                            ${e.status===`accepted`?`
                                <div style="display: flex; gap: 0.5rem;">
                                    <a href="https://wa.me/91${n}" target="_blank" class="btn btn--whatsapp btn--sm">
                                        WhatsApp
                                    </a>
                                    <a href="tel:+91${n}" class="btn btn--call btn--sm">
                                        📞 Call
                                    </a>
                                </div>
                            `:`-`}
                        </td>
                    </tr>
                `}).join(``)}catch(e){showToast(e.message,`error`)}}function w(e){let t=n.find(t=>t.id===e);t&&(y=t,document.getElementById(`buyListingId`).value=t.id,document.getElementById(`modalUnit`).textContent=t.unit,document.getElementById(`modalMaxQty`).textContent=t.quantity,document.getElementById(`buyQuantity`).max=t.quantity,document.getElementById(`buyQuantity`).value=1,document.getElementById(`modalListingInfo`).innerHTML=`
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img src="${h(t.image)}" 
                         style="width: 60px; height: 60px; border-radius: 0.5rem; object-fit: cover;">
                    <div style="flex: 1;">
                        <strong>${t.crop_name}</strong><br>
                        <span style="color: var(--gray-500);">₹${t.price} per ${t.unit}</span><br>
                        <span style="color: var(--gray-500);">📍 ${t.location}</span>
                    </div>
                    <div style="text-align: right; border-left: 1px solid var(--gray-200); padding-left: 1rem;">
                        <img src="${g(t.farmer?.profile_image,t.farmer?.name)}" alt="Farmer" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-bottom: 0.25rem;"><br>
                        <small style="color: var(--gray-500);">${t.farmer?.name||`Farmer`}</small>
                    </div>
                </div>
            `,S(),document.getElementById(`offerModal`).classList.add(`active`))}function T(){document.getElementById(`offerModal`).classList.remove(`active`),document.getElementById(`buyForm`).reset(),y=null}document.getElementById(`buyForm`).addEventListener(`submit`,e=>{if(e.preventDefault(),!y)return;let t=parseInt(document.getElementById(`buyQuantity`).value),n=document.getElementById(`buyMessage`).value,r=v.find(e=>e.listing_id===y.id);r?(r.quantity+=t,r.quantity>y.quantity&&(r.quantity=y.quantity)):v.push({listing_id:y.id,crop_name:y.crop_name,price:y.price,quantity:t,unit:y.unit,image:y.image,farmer_id:y.farmer_id||y.farmer?.id,farmer_name:y.farmer?.name||`Farmer`,farmer_image:y.farmer?.profile_image||``,message:n}),x(),showToast(`Added to cart!`,`success`),T()});function E(){let e=document.getElementById(`cartList`),t=document.getElementById(`cartEmpty`),n=document.getElementById(`cartTable`),r=document.getElementById(`cartFooter`);if(v.length===0){n.style.display=`none`,r.style.display=`none`,t.style.display=`block`;return}n.style.display=`table`,r.style.display=`flex`,t.style.display=`none`;let i=0;e.innerHTML=v.map((e,t)=>{let n=e.price*e.quantity;return i+=n,`
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <img src="${h(e.image)}" style="width: 40px; height: 40px; border-radius: 0.25rem; object-fit: cover;">
                                <div>
                                    <strong>${e.crop_name}</strong><br>
                                    <div style="display: flex; align-items: center; gap: 0.25rem; margin-top: 0.25rem;">
                                        <img src="${g(e.farmer_image,e.farmer_name)}" style="width: 16px; height: 16px; border-radius: 50%; object-fit: cover;">
                                        <small style="color: var(--gray-500);">by ${e.farmer_name}</small>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>${e.quantity} ${e.unit}</td>
                        <td>₹${e.price}</td>
                        <td><strong>₹${n}</strong></td>
                        <td>
                            <button class="btn btn--sm btn--secondary" onclick="removeFromCart(${t})" style="color: var(--error); padding:0.25rem 0.5rem; font-size:0.8rem;">Remove</button>
                        </td>
                    </tr>
                `}).join(``),document.getElementById(`cartTotalAmount`).textContent=`₹${i}`}function D(e){v.splice(e,1),x(),E()}function O(){confirm(`Are you sure you want to empty your cart?`)&&(v=[],x(),E())}function k(){v.length!==0&&(window.location.href=`checkout.html`)}async function A(){try{let e=(await api.get(`/orders/buyer`)).orders||[],t=document.getElementById(`ordersTableBody`),n=document.getElementById(`noOrdersMessage`),r=document.getElementById(`ordersTable`);if(e.length===0){r.style.display=`none`,n.style.display=`block`;return}r.style.display=`table`,n.style.display=`none`,t.innerHTML=e.map(e=>`
                    <tr>
                        <td><small>#${e.id.substring(e.id.length-8)}</small></td>
                        <td>${new Date(e.created_at).toLocaleDateString()}</td>
                        <td>
                            ${e.items.map(e=>`${e.crop_name} (${e.quantity}${e.unit})`).join(`, `)}
                        </td>
                        <td><strong>₹${e.total_amount}</strong></td>
                        <td><span class="badge badge--${e.payment_status===`completed`?`accepted`:`pending`}">${e.payment_status===`completed`?`Paid`:`Pending`}</span></td>
                        <td>${e.payment_method||`N/A`}</td>
                    </tr>
                `).join(``)}catch(e){showToast(e.message,`error`)}}document.getElementById(`searchCrop`).addEventListener(`input`,()=>{clearTimeout(t),t=setTimeout(()=>_(),500)}),document.getElementById(`searchLocation`).addEventListener(`input`,()=>{clearTimeout(t),t=setTimeout(()=>_(),500)}),document.getElementById(`priceSort`).addEventListener(`change`,()=>_()),document.getElementById(`profileForm`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`profileName`).value,n=document.getElementById(`profileLocation`).value;try{let e=await api.put(`/auth/profile`,{name:t,location:n});saveSession(getToken(),e.user),document.getElementById(`userName`).textContent=e.user.name,showToast(`Profile updated!`,`success`)}catch(e){showToast(e.message,`error`)}}),window.toggleNotifications=u,window.markAllRead=f,window.toggleSidebar=s,window.filterByCategory=m,window.detectUserLocation=i,window.loadListings=_,window.showSection=o,window.markRead=d,window.openOfferModalById=w,window.closeOfferModal=T,window.clearCartUI=O,window.removeFromCart=D,window.placeOrder=k,window.updateModalTotal=S;