import"./auth-BVt79YaJ.js";/* empty css              */var e=`http://127.0.0.1:5001`;document.addEventListener(`DOMContentLoaded`,()=>{let e=getUser();if(!e||e.role!==`farmer`){window.location.href=`auth.html`;return}document.getElementById(`userName`).textContent=e.name,document.getElementById(`profileName`).value=e.name,document.getElementById(`profilePhone`).value=e.phone,document.getElementById(`profileRole`).value=e.role,document.getElementById(`profileLocation`).value=e.location||``,e.profile_image&&(document.getElementById(`profileImagePreview`).src=l(e.profile_image)),r(),u(),d(),i()}),document.querySelectorAll(`.sidebar__link`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let n=e.target.dataset.section;t(n)})});function t(e){document.querySelectorAll(`.sidebar__link`).forEach(e=>e.classList.remove(`active`)),document.querySelector(`[data-section="${e}"]`)?.classList.add(`active`),document.getElementById(`listingsSection`).style.display=e===`listings`?`block`:`none`,document.getElementById(`offersSection`).style.display=e===`offers`?`block`:`none`,document.getElementById(`receivedOrdersSection`).style.display=e===`received_orders`?`block`:`none`,document.getElementById(`addSection`).style.display=e===`add`?`block`:`none`,document.getElementById(`profileSection`).style.display=e===`profile`?`block`:`none`,e===`received_orders`&&f()}function n(){document.getElementById(`sidebar`).classList.toggle(`open`)}async function r(){try{let e=await api.get(`/stats/farmer`);document.getElementById(`statTotalListings`).textContent=e.total_listings,document.getElementById(`statActiveListings`).textContent=e.active_listings,document.getElementById(`statTotalOffers`).textContent=e.total_offers,document.getElementById(`statRevenue`).textContent=`₹${e.total_revenue.toLocaleString(`en-IN`)}`}catch(e){console.error(`Stats error:`,e.message)}}async function i(){try{let e=await api.get(`/notifications`),t=document.getElementById(`notifBadge`),n=document.getElementById(`notifList`);if(e.unread_count>0?(t.style.display=`flex`,t.textContent=e.unread_count>9?`9+`:e.unread_count):t.style.display=`none`,e.notifications.length===0){n.innerHTML=`<p style="padding:1rem;color:var(--gray-500);text-align:center;">No notifications</p>`;return}n.innerHTML=e.notifications.slice(0,20).map(e=>`
                    <div class="notification-item ${e.is_read?``:`notification-item--unread`}" onclick="markRead('${e.id}', this)">
                        <span class="notification-item__icon">${e.type===`offer_received`?`💰`:e.type===`offer_accepted`?`✅`:`❌`}</span>
                        <div>
                            <p class="notification-item__text">${e.message}</p>
                            <small class="notification-item__time">${c(e.created_at)}</small>
                        </div>
                    </div>
                `).join(``)}catch(e){console.error(`Notification error:`,e.message)}}function a(){document.getElementById(`notifDropdown`).classList.toggle(`active`)}async function o(e,t){try{await api.put(`/notifications/${e}/read`),t.classList.remove(`notification-item--unread`),i()}catch{}}async function s(){try{await api.put(`/notifications/read-all`),i(),showToast(`All notifications marked as read`,`success`)}catch{}}function c(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4);if(n<1)return`Just now`;if(n<60)return`${n}m ago`;let r=Math.floor(n/60);return r<24?`${r}h ago`:`${Math.floor(r/24)}d ago`}document.addEventListener(`click`,e=>{let t=document.getElementById(`notifDropdown`),n=document.querySelector(`.notification-bell`);t.classList.contains(`active`)&&!t.contains(e.target)&&!n.contains(e.target)&&t.classList.remove(`active`)});function l(t){return t?t.startsWith(`http`)?t:e+t:`https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=200&fit=crop`}async function u(){try{let e=(await api.get(`/listings/my/listings`)).listings||[],t=document.getElementById(`myListingsGrid`);if(e.length===0){t.innerHTML=`
                        <div class="empty-state">
                            <div class="empty-state__icon">📦</div>
                            <h3 class="empty-state__title">No listings yet</h3>
                            <p class="empty-state__text">Start by adding your first produce listing</p>
                            <button class="btn btn--primary" onclick="showSection('add')">Add Listing</button>
                        </div>
                    `;return}t.innerHTML=e.map(e=>`
                    <div class="card">
                        <img src="${l(e.image)}" 
                             alt="${e.crop_name}" class="card__image">
                        <div class="card__content">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <h3 class="card__title">${e.crop_name}</h3>
                                <span class="badge badge--${e.status}">${e.status}</span>
                            </div>
                            <div class="card__meta">
                                📍 ${e.location}
                            </div>
                            <p style="color: var(--gray-600); margin-bottom: 1rem;">
                                ${e.quantity} ${e.unit}
                            </p>
                            <div class="card__price">
                                ₹${e.price} <span>per ${e.unit}</span>
                            </div>
                            <div class="card__footer">
                                <button class="btn btn--secondary btn--sm" onclick="toggleStatus('${e.id}', '${e.status}')">
                                    ${e.status===`available`?`✓ Mark Sold`:`↺ Mark Available`}
                                </button>
                                <button class="btn btn--error btn--sm" onclick="deleteListing('${e.id}')">
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join(``)}catch(e){showToast(e.message,`error`)}}async function d(){try{let e=(await api.get(`/offers/received`)).offers||[],t=document.getElementById(`offersTableBody`),n=document.getElementById(`noOffersMessage`),r=document.getElementById(`offersTable`);if(e.length===0){r.style.display=`none`,n.style.display=`block`;return}r.style.display=`table`,n.style.display=`none`,t.innerHTML=e.map(e=>`
                    <tr>
                        <td><strong>${e.listing?.crop_name||`N/A`}</strong></td>
                        <td>
                            ${e.buyer?.name||`Unknown`}<br>
                            <small style="color: var(--gray-500);">${e.buyer?.phone||``}</small>
                        </td>
                        <td>₹${e.listing?.price||0}</td>
                        <td><strong style="color: var(--primary-600);">₹${e.offer_price}</strong></td>
                        <td style="max-width: 200px;">${e.message||`-`}</td>
                        <td><span class="badge badge--${e.status}">${e.status}</span></td>
                        <td>
                            ${e.status===`pending`?`
                                <div class="offers-table__actions">
                                    <button class="btn btn--success btn--sm" onclick="acceptOffer('${e.id}')">✓ Accept</button>
                                    <button class="btn btn--error btn--sm" onclick="rejectOffer('${e.id}')">✗ Reject</button>
                                </div>
                            `:e.status===`accepted`?`
                                <a href="https://wa.me/91${e.buyer?.phone}" target="_blank" class="btn btn--whatsapp btn--sm">
                                    WhatsApp
                                </a>
                            `:`-`}
                        </td>
                    </tr>
                `).join(``)}catch(e){showToast(e.message,`error`)}}async function f(){try{let e=(await api.get(`/orders/farmer`)).orders||[],t=document.getElementById(`receivedOrdersTableBody`),n=document.getElementById(`noReceivedOrdersMessage`),r=document.getElementById(`receivedOrdersTable`);if(e.length===0){r.style.display=`none`,n.style.display=`block`;return}r.style.display=`table`,n.style.display=`none`,t.innerHTML=e.map(e=>{let t=e.total_amount,n=e.status||`pending`;return`
                    <tr>
                        <td><small>#${e.id.substring(e.id.length-8)}</small></td>
                        <td>
                            ${e.buyer?.name||`Unknown`}<br>
                            <small style="color: var(--gray-500);">${e.buyer?.phone||``}</small>
                        </td>
                        <td>
                            ${e.items.map(e=>`${e.crop_name} (${e.quantity}${e.unit})`).join(`, `)}
                        </td>
                        <td><strong>₹${t}</strong></td>
                        <td style="max-width: 200px;"><small>${e.shipping_address}</small></td>
                        <td>
                            <span class="badge badge--${n}">${n}</span>
                            ${e.payment_status===`completed`?`<br><small style="color:var(--success-600)">● Paid</small>`:``}
                        </td>
                        <td>
                            <div class="offers-table__actions">
                                ${n===`pending`?`
                                    <button class="btn btn--success btn--sm" onclick="updateOrderStatus('${e.id}', 'accepted')">✓ Accept</button>
                                    <button class="btn btn--error btn--sm" onclick="updateOrderStatus('${e.id}', 'rejected')">✗ Reject</button>
                                `:n===`accepted`?`
                                    <button class="btn btn--primary btn--sm" onclick="updateOrderStatus('${e.id}', 'shipped')">🚢 Ship</button>
                                `:n===`shipped`?`
                                    <button class="btn btn--accent btn--sm" onclick="updateOrderStatus('${e.id}', 'delivered')">✅ Deliver</button>
                                `:`-`}
                            </div>
                        </td>
                    </tr>
                `}).join(``)}catch(e){showToast(e.message,`error`)}}async function p(e,t){try{await api.request(`/orders/${e}/status`,{method:`PATCH`,body:JSON.stringify({status:t})}),showToast(`Order #${e.substring(e.length-8)} marked as ${t}`,`success`),f(),r()}catch(e){console.error(`Status Update Error:`,e),showToast(e.message,`error`)}}document.getElementById(`addListingForm`).addEventListener(`submit`,async e=>{e.preventDefault();let n=new FormData;n.append(`cropName`,document.getElementById(`cropName`).value),n.append(`quantity`,document.getElementById(`quantity`).value),n.append(`unit`,document.getElementById(`unit`).value),n.append(`price`,document.getElementById(`price`).value),n.append(`location`,document.getElementById(`location`).value),n.append(`description`,document.getElementById(`description`).value);let i=document.getElementById(`image`).files[0];i&&n.append(`image`,i);try{await api.postForm(`/listings`,n),showToast(`Listing created successfully!`,`success`),e.target.reset(),t(`listings`),u(),r()}catch(e){showToast(e.message,`error`)}});async function m(e,t){let n=t===`available`?`sold`:`available`;try{await api.put(`/listings/${e}`,{status:n}),showToast(`Listing marked as ${n}`,`success`),u(),r()}catch(e){showToast(e.message,`error`)}}async function h(e){if(confirm(`Are you sure you want to delete this listing?`))try{await api.delete(`/listings/${e}`),showToast(`Listing deleted`,`success`),u(),r()}catch(e){showToast(e.message,`error`)}}async function g(e){try{await api.put(`/offers/${e}/accept`),showToast(`Offer accepted! Listing marked as sold.`,`success`),d(),u(),r()}catch(e){showToast(e.message,`error`)}}async function _(e){try{await api.put(`/offers/${e}/reject`),showToast(`Offer rejected`,`info`),d()}catch(e){showToast(e.message,`error`)}}function v(e){let t=e.target.files[0];if(t){let e=new FileReader;e.onload=function(e){document.getElementById(`profileImagePreview`).src=e.target.result},e.readAsDataURL(t)}}document.getElementById(`profileForm`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData;t.append(`name`,document.getElementById(`profileName`).value),t.append(`location`,document.getElementById(`profileLocation`).value);let n=document.getElementById(`profileImageInput`).files[0];n&&t.append(`profileImage`,n);try{let e=await api.putForm(`/auth/profile`,t);saveSession(getToken(),e.user),document.getElementById(`userName`).textContent=e.user.name,showToast(`Profile updated!`,`success`)}catch(e){showToast(e.message,`error`)}}),window.showSection=t,window.toggleSidebar=n,window.toggleNotifications=a,window.markRead=o,window.markAllRead=s,window.toggleStatus=m,window.deleteListing=h,window.acceptOffer=g,window.rejectOffer=_,window.updateOrderStatus=p,window.previewProfileImage=v;