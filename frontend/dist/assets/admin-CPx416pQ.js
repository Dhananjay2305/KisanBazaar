const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/api-DqiYm43F.js","assets/api-CDGBb-Nk.css"])))=>i.map(i=>d[i]);
import{s as o,a as d,f as u,b as p,r as h}from"./api-DqiYm43F.js";import{_ as P}from"./preload-helper-ckwbz45p.js";import{b as $}from"./auth-DlKCV7tk.js";import"./push-notifications-CQmv0i8S.js";window.toggleMobileSidebar=function(){document.querySelector(".admin-sidebar").classList.toggle("mobile-open"),document.getElementById("adminMobileOverlay").classList.toggle("active")};window.closeMobileSidebar=function(){document.querySelector(".admin-sidebar").classList.remove("mobile-open"),document.getElementById("adminMobileOverlay").classList.remove("active")};window.doLogout=async function(a){a.preventDefault(),localStorage.removeItem("token"),localStorage.removeItem("user");try{const{supabase:t}=await P(async()=>{const{supabase:e}=await import("./api-DqiYm43F.js").then(n=>n.e);return{supabase:e}},__vite__mapDeps([0,1]));await t.auth.signOut()}catch{}window.location.href="admin-login.html"};window.sendTestPushNotification=async function(){const a=document.getElementById("btnTestPush"),t=a.innerHTML;a.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Sending...',a.disabled=!0;try{const e=window.location.hostname.includes("localhost")?"http://localhost:5001/api/push/send":"/_/backend/api/push/send";(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:"FarmDirect Admin Broadcast",body:"This is a test notification sent from the Admin Panel!"})})).ok?alert("Broadcast notification sent successfully!"):alert("Failed to send broadcast notification.")}catch(e){console.error(e),alert("Error sending notification: "+e.message)}finally{a.innerHTML=t,a.disabled=!1}};let s={},m=[];document.addEventListener("DOMContentLoaded",async()=>{var a;try{const t=await $();if(!t){localStorage.removeItem("token"),localStorage.removeItem("user"),window.location.href="admin-login.html";return}const e=document.getElementById("adminUserInfo"),n=document.getElementById("adminAvatar");e&&t.name&&(e.textContent=t.name),n&&t.name&&(n.textContent=t.name.charAt(0).toUpperCase()),(a=document.getElementById("adminProductImage"))==null||a.addEventListener("change",M);const r=["dashboard","orders","products","customers","payments","support","analytics"],i=window.location.hash.replace("#","");r.includes(i)?l(i):l("dashboard")}catch(t){console.error("Admin dashboard initialization failed:",t),o(t.message||"Connection offline. Retrying in background...","error")}window.addEventListener("hashchange",()=>{const t=window.location.hash.replace("#","");validViews.includes(t)&&l(t)}),window.switchView=l,window.deleteProduct=O,window.updateOrderStatus=x,window.openAddProductModal=F,window.openEditProductModal=D,window.closeModal=I,window.openAddFarmerModal=H,window.closeFarmerModal=C});function M(a){const t=a.target.files[0],e=document.getElementById("adminProductImagePreview"),n=document.getElementById("adminProductImageName");if(!e)return;if(!t){e.style.display="none",e.removeAttribute("src"),n&&(n.textContent="");return}if(!t.type.startsWith("image/")){o("Please choose a JPEG, PNG, or WebP image.","error"),a.target.value="";return}const r=new FileReader;r.onload=i=>{e.src=i.target.result,e.style.display="block"},r.readAsDataURL(t),n&&(n.textContent=t.name)}function v(a=""){const t=document.getElementById("adminProductImagePreview"),e=document.getElementById("adminProductImage"),n=document.getElementById("adminProductImageName");e&&(e.value=""),a?(t.src=h(a),t.style.display="block",n&&(n.textContent="Current image (choose a file to replace)")):(t.style.display="none",t.removeAttribute("src"),n&&(n.textContent=""))}function y(a,t="Save Product"){const e=document.getElementById("saveProductBtn");e&&(e.disabled=a,e.innerHTML=a?'<span class="loading-spinner"></span> Saving...':t)}async function l(a){if(!["dashboard","orders","products","customers","payments","support","analytics"].includes(a))return;document.querySelectorAll(".admin-nav__item").forEach(n=>{var r;n.classList.remove("active"),(r=n.getAttribute("onclick"))!=null&&r.includes(a)&&n.classList.add("active")});const e={dashboard:"Dashboard Overview",orders:"Orders Management",products:"Product Catalog",customers:"Customer Management",payments:"Payment Tracking",support:"Customer Support",analytics:"Detailed Analytics"};switch(document.getElementById("pageTitle").innerText=e[a]||"Admin Panel",document.querySelectorAll(".view-section").forEach(n=>n.classList.remove("active")),document.getElementById(`view-${a}`).classList.add("active"),a){case"dashboard":await T();break;case"orders":await w();break;case"products":await g();break;case"customers":await E();break;case"payments":await A();break;case"support":await S();break;case"analytics":await k();break}window.location.hash!==`#${a}`&&(window.location.hash=a)}async function T(){try{const a=await d.get("/admin/stats"),t=document.getElementById("dashboardStats");t.innerHTML=`
            <div class="stat-card admin-stat">
                <div class="stat-card__icon stat-card__icon--blue"><i class="fa-solid fa-users"></i></div>
                <div class="stat-card__info">
                    <h4>Total Users</h4>
                    <p>${a.usersCount}</p>
                </div>
            </div>
            <div class="stat-card admin-stat">
                <div class="stat-card__icon stat-card__icon--green"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                <div class="stat-card__info">
                    <h4>Revenue</h4>
                    <p>${u(a.revenue)}</p>
                </div>
            </div>
            <div class="stat-card admin-stat">
                <div class="stat-card__icon stat-card__icon--orange"><i class="fa-solid fa-cart-shopping"></i></div>
                <div class="stat-card__info">
                    <h4>Total Orders</h4>
                    <p>${a.ordersCount}</p>
                </div>
            </div>
            <div class="stat-card admin-stat">
                <div class="stat-card__icon stat-card__icon--purple"><i class="fa-solid fa-clock"></i></div>
                <div class="stat-card__info">
                    <h4>Pending Orders</h4>
                    <p>${a.pendingOrdersCount}</p>
                </div>
            </div>
        `,L(a)}catch(a){o("Error loading dashboard: "+a.message,"error")}}function L(a){const t=document.getElementById("dashboardOrdersChart").getContext("2d"),e=document.getElementById("dashboardRevenueChart").getContext("2d");s.dashOrders&&s.dashOrders.destroy(),s.dashRevenue&&s.dashRevenue.destroy();const n=a.recentOrders.slice(0,7).reverse();s.dashOrders=new Chart(t,{type:"line",data:{labels:n.map(r=>new Date(r.created_at).toLocaleDateString()),datasets:[{label:"Order Value",data:n.map(r=>r.total_amount),borderColor:"#22c55e",tension:.4,fill:!0,backgroundColor:"rgba(34, 197, 94, 0.1)"}]},options:{responsive:!0,plugins:{legend:{display:!1}}}}),s.dashRevenue=new Chart(e,{type:"doughnut",data:{labels:["Farmers","Buyers"],datasets:[{data:[a.roleStats.farmer,a.roleStats.buyer],backgroundColor:["#22c55e","#3b82f6"]}]},options:{responsive:!0}})}async function w(){try{const{orders:a}=await d.get("/admin/orders"),t=document.getElementById("ordersTableBody");t.innerHTML=a.map(e=>{var n;return`
            <tr>
                <td>#${e.id.slice(-6)}</td>
                <td>${((n=e.buyer)==null?void 0:n.name)||"Guest"}</td>
                <td>${p(e.created_at)}</td>
                <td>${u(e.total_amount)}</td>
                <td><span class="status-badge ${e.status}">${e.status.toUpperCase()}</span></td>
                <td>
                    <select onchange="updateOrderStatus('${e.id}', this.value)" class="form-select" style="padding: 0.25rem; font-size: 0.8rem; width: auto;">
                        <option value="pending" ${e.status==="pending"?"selected":""}>Pending</option>
                        <option value="shipped" ${e.status==="shipped"?"selected":""}>Shipped</option>
                        <option value="completed" ${e.status==="completed"?"selected":""}>Completed</option>
                        <option value="cancelled" ${e.status==="cancelled"?"selected":""}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `}).join("")}catch(a){o("Error loading orders: "+a.message,"error")}}async function g(){try{const{products:a}=await d.get("/admin/products");m=a||[];const t=document.getElementById("productsTableBody");if(!m.length){t.innerHTML='<tr><td colspan="7" style="text-align:center;padding:2rem;color:#6b7280;">No products yet. Click "Add Product" to create one.</td></tr>';return}t.innerHTML=m.map(e=>{var n;return`
            <tr>
                <td><img src="${h(e.image)}" alt="${e.crop_name}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover;"></td>
                <td><strong>${e.crop_name}</strong><br><small style="color:#6b7280;">${e.category||"—"}</small></td>
                <td>${((n=e.farmer)==null?void 0:n.name)||"Unknown"}</td>
                <td>${u(e.price)}/${e.unit}</td>
                <td>${e.quantity} ${e.unit}</td>
                <td><span class="status-badge ${e.status==="available"?"completed":"cancelled"}">${e.status}</span></td>
                <td>
                    <button type="button" class="action-btn" title="Edit" onclick="openEditProductModal('${e.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button type="button" class="action-btn delete" title="Delete" onclick="deleteProduct('${e.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `}).join("")}catch(a){o("Error loading products: "+a.message,"error")}}async function E(){try{const{customers:a}=await d.get("/admin/customers"),t=document.getElementById("customersTableBody");t.innerHTML=a.map(e=>`
            <tr>
                <td><strong>${e.name||"No Name"}</strong><br><small>${e.phone||""}</small></td>
                <td><span class="status-badge ${e.role==="farmer"?"shipped":"completed"}">${e.role.toUpperCase()}</span></td>
                <td>${e.location||"N/A"}</td>
                <td>${p(e.created_at)}</td>
            </tr>
        `).join("")}catch(a){o("Error loading customers: "+a.message,"error")}}async function A(){try{const{payments:a}=await d.get("/admin/payments"),t=document.getElementById("paymentsTableBody");t.innerHTML=a.map(e=>`
            <tr>
                <td>TRX-${e.id.slice(-8).toUpperCase()}</td>
                <td>#${e.id.slice(-6)}</td>
                <td>${u(e.total_amount)}</td>
                <td>${p(e.created_at)}</td>
                <td><span class="status-badge ${e.payment_status==="completed"?"completed":"pending"}">${e.payment_status.toUpperCase()}</span></td>
            </tr>
        `).join("")}catch(a){o("Error loading payments: "+a.message,"error")}}async function S(){const a=document.getElementById("supportTableBody");try{const{messages:t}=await d.get("/admin/support");if(!t||t.length===0){a.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:3rem;color:#6b7280;">
                <i class="fa-solid fa-headset" style="font-size:2rem;display:block;margin-bottom:0.75rem;color:#d1d5db;"></i>
                No support messages yet
            </td></tr>`;return}a.innerHTML=t.map(e=>{var n;return`
            <tr>
                <td>${((n=e.user)==null?void 0:n.name)||"Guest"}</td>
                <td>${e.subject||"N/A"}</td>
                <td>${(e.message||"").slice(0,50)}${(e.message||"").length>50?"...":""}</td>
                <td>${p(e.created_at)}</td>
                <td><span class="status-badge pending">NEW</span></td>
            </tr>
        `}).join("")}catch{a.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:2rem;color:#dc2626;">
            Support messages table not found. Run supabase_setup.sql to enable this feature.
        </td></tr>`}}async function k(){var a;try{const t=await d.get("/admin/stats"),e=document.getElementById("salesGrowthChart").getContext("2d");s.growth&&s.growth.destroy();const n=[...t.recentOrders||[]].reverse().slice(-10);s.growth=new Chart(e,{type:"bar",data:{labels:n.map(c=>new Date(c.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})),datasets:[{label:"Revenue (₹)",data:n.map(c=>c.total_amount),backgroundColor:"rgba(34, 197, 94, 0.7)",borderColor:"#16a34a",borderWidth:1,borderRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0}}}});const r=document.getElementById("userRolesChart").getContext("2d");s.roles&&s.roles.destroy(),s.roles=new Chart(r,{type:"pie",data:{labels:["Farmers","Buyers"],datasets:[{data:[t.roleStats.farmer,t.roleStats.buyer],backgroundColor:["#16a34a","#2563eb"],borderWidth:0}]},options:{responsive:!0,plugins:{legend:{position:"bottom"}}}});const i=(a=document.getElementById("orderCompletionChart"))==null?void 0:a.getContext("2d");if(i){s.completion&&s.completion.destroy();const c=t.pendingOrdersCount,_=t.ordersCount-c;s.completion=new Chart(i,{type:"doughnut",data:{labels:["Completed","Pending"],datasets:[{data:[_,c],backgroundColor:["#10b981","#f59e0b"],borderWidth:0}]},options:{responsive:!0,plugins:{legend:{position:"bottom"}},cutout:"65%"}})}}catch(t){o("Error loading analytics: "+t.message,"error")}}async function O(a){if(confirm("Are you sure you want to delete this product?"))try{await d.delete(`/admin/products/${a}`),o("Product deleted","success"),g()}catch(t){o("Delete failed: "+t.message,"error")}}async function x(a,t){try{await d.patch(`/orders/${a}`,{status:t}),o("Order status updated","success"),w()}catch(e){o("Update failed: "+e.message,"error")}}function F(){document.getElementById("modalOverlay").style.display="flex",document.getElementById("productModal").style.display="block",document.getElementById("productModalTitle").innerText="Add New Product",document.getElementById("productId").value="",document.getElementById("adminProductForm").reset(),document.getElementById("adminProductImage").required=!0,v(),B()}function D(a){const t=m.find(e=>e.id===a);if(!t){o("Product not found. Refresh the page.","error");return}document.getElementById("modalOverlay").style.display="flex",document.getElementById("productModal").style.display="block",document.getElementById("productModalTitle").innerText="Edit Product",document.getElementById("productId").value=t.id,document.getElementById("adminProductImage").required=!1,B().then(()=>{document.getElementById("farmerId").value=t.farmer_id}),document.getElementById("cropName").value=t.crop_name||"",document.getElementById("quantity").value=t.quantity??"",document.getElementById("unit").value=t.unit||"kg",document.getElementById("price").value=t.price??"",document.getElementById("description").value=t.description||"",document.getElementById("location").value=t.location||"",document.getElementById("category").value=t.category||"vegetables",v(t.image)}function I(){document.getElementById("modalOverlay").style.display="none",document.getElementById("productModal").style.display="none"}async function B(){const a=document.getElementById("farmerId");try{const{farmers:t}=await d.get("/farmers/all");a.innerHTML=t.map(e=>`<option value="${e.id}">${e.name} (${e.location||"No location"})</option>`).join("")}catch{a.innerHTML='<option value="">Error loading farmers</option>'}}var f;(f=document.getElementById("adminProductForm"))==null||f.addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("productId").value,e=!!t;y(!0);try{const n=new FormData(a.target);e?(await d.putForm(`/admin/listings/${t}`,n),o("Product updated successfully","success")):(await d.postForm("/admin/listings",n),o("Product added successfully","success")),I(),g()}catch(n){o(n.message||"Save failed","error")}finally{y(!1,e?"Update Product":"Save Product")}});function H(){document.getElementById("modalOverlay").style.display="flex",document.getElementById("addFarmerModal").style.display="block",document.getElementById("adminFarmerForm").reset()}function C(){document.getElementById("modalOverlay").style.display="none",document.getElementById("addFarmerModal").style.display="none"}var b;(b=document.getElementById("adminFarmerForm"))==null||b.addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("saveFarmerBtn"),e=t.innerHTML;try{t.disabled=!0,t.innerHTML='<span class="loading-spinner"></span> Creating...';const n=Object.fromEntries(new FormData(a.target).entries());await d.createFarmerAsAdmin(n),o("Farmer added successfully!","success"),C(),E()}catch(n){o(n.message||"Failed to add farmer","error")}finally{t.disabled=!1,t.innerHTML=e}});
