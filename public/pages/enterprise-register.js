import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderEnterpriseRegister() {
    return {
        html: `
        ${renderNavbar('enterprise')}
        <main style="padding-top:calc(var(--nav-height) + var(--space-12));min-height:100vh;background:radial-gradient(circle at 50% 10%, rgba(0,255,150,0.08) 0%, transparent 60%), linear-gradient(160deg,#03140c 0%,#051a0f 50%,#03140c 100%);padding-bottom:var(--space-16);display:flex;align-items:center;justify-content:center;position:relative">
            <div style="position:absolute;inset:0;background-image:url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%2300ff9d\\' fill-opacity=\\'0.02\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');pointer-events:none"></div>
            <div class="container" style="max-width:640px;width:100%;margin:0 auto;position:relative;z-index:2">
                
                <div style="text-align:center;margin-bottom:var(--space-8)">
                    <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg, rgba(0,255,150,0.1), rgba(0,0,0,0));color:#00ff9d;margin-bottom:var(--space-4);border:1px solid rgba(0,255,150,0.3);box-shadow:0 0 30px rgba(0,255,150,0.15)">
                        <span class="material-symbols-outlined" style="font-size:2.5rem">corporate_fare</span>
                    </div>
                    <h1 class="font-serif" style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:var(--fw-bold);color:#fff;margin-bottom:var(--space-3)">Enterprise API Access Request</h1>
                    <p style="color:var(--color-slate-400);font-size:1.05rem;line-height:1.6">Request institutional access to TerraShield’s ecological intelligence platform.</p>
                </div>

                <div id="enterprise-form-card" style="background:rgba(0,40,30,0.55);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(0,255,150,0.15);border-radius:var(--radius-xl);padding:var(--space-10);box-shadow:0 0 50px rgba(0,255,150,0.1), inset 0 0 20px rgba(0,255,150,0.02)">
                    <style>
                        #enterprise-form input::placeholder, #enterprise-form textarea::placeholder {
                            color: rgba(255,255,255,0.55);
                        }
                        #enterprise-form select option {
                            background: #051a0f;
                            color: #ffffff;
                        }
                    </style>
                    <form id="enterprise-form">
                        
                        <div style="margin-bottom:var(--space-5)">
                            <label style="display:block;font-size:0.85rem;font-weight:600;color:#e8fff5;margin-bottom:var(--space-2)">Company / Organization Name <span style="color:#ff4d4d">*</span></label>
                            <input type="text" id="ent-company" required style="width:100%;color:#ffffff;background:rgba(0, 35, 25, 0.8);border:1px solid rgba(0, 255, 150, 0.2);padding:0.75rem 1rem;border-radius:var(--radius-md);outline:none;font-size:0.95rem;transition:border-color 0.2s, box-shadow 0.2s" onfocus="this.style.borderColor='#00ff9d';this.style.boxShadow='0 0 8px rgba(0,255,150,0.2)'" onblur="this.style.borderColor='rgba(0, 255, 150, 0.2)';this.style.boxShadow='none'" placeholder="e.g. Acme Environmentals" />
                        </div>

                        <div style="margin-bottom:var(--space-5)">
                            <label style="display:block;font-size:0.85rem;font-weight:600;color:#e8fff5;margin-bottom:var(--space-2)">Organization Type <span style="color:#ff4d4d">*</span></label>
                            <select id="ent-type" required style="width:100%;color:#ffffff;background:rgba(0, 35, 25, 0.8);border:1px solid rgba(0, 255, 150, 0.2);padding:0.75rem 1rem;border-radius:var(--radius-md);outline:none;font-size:0.95rem;transition:border-color 0.2s, box-shadow 0.2s" onfocus="this.style.borderColor='#00ff9d';this.style.boxShadow='0 0 8px rgba(0,255,150,0.2)'" onblur="this.style.borderColor='rgba(0, 255, 150, 0.2)';this.style.boxShadow='none'">
                                <option value="" disabled selected>Select organization type...</option>
                                <option value="government">Government / Public Sector</option>
                                <option value="ngo">NGO / Non-Profit</option>
                                <option value="research">Research Institution</option>
                                <option value="private">Private Company</option>
                                <option value="agency">Environmental Agency</option>
                            </select>
                        </div>

                        <div style="margin-bottom:var(--space-5)">
                            <label style="display:block;font-size:0.85rem;font-weight:600;color:#e8fff5;margin-bottom:var(--space-2)">Official Work Email <span style="color:#ff4d4d">*</span></label>
                            <input type="email" id="ent-email" required style="width:100%;color:#ffffff;background:rgba(0, 35, 25, 0.8);border:1px solid rgba(0, 255, 150, 0.2);padding:0.75rem 1rem;border-radius:var(--radius-md);outline:none;font-size:0.95rem;transition:border-color 0.2s, box-shadow 0.2s" onfocus="this.style.borderColor='#00ff9d';this.style.boxShadow='0 0 8px rgba(0,255,150,0.2)'" onblur="this.style.borderColor='rgba(0, 255, 150, 0.2)';this.style.boxShadow='none'" placeholder="name@organization.com" />
                        </div>

                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-5)">
                            <div>
                                <label style="display:block;font-size:0.85rem;font-weight:600;color:#e8fff5;margin-bottom:var(--space-2)">Country <span style="color:#ff4d4d">*</span></label>
                                <input type="text" id="ent-country" required style="width:100%;color:#ffffff;background:rgba(0, 35, 25, 0.8);border:1px solid rgba(0, 255, 150, 0.2);padding:0.75rem 1rem;border-radius:var(--radius-md);outline:none;font-size:0.95rem;transition:border-color 0.2s, box-shadow 0.2s" onfocus="this.style.borderColor='#00ff9d';this.style.boxShadow='0 0 8px rgba(0,255,150,0.2)'" onblur="this.style.borderColor='rgba(0, 255, 150, 0.2)';this.style.boxShadow='none'" placeholder="Country" />
                            </div>
                            <div>
                                <label style="display:block;font-size:0.85rem;font-weight:600;color:#e8fff5;margin-bottom:var(--space-2)">State / Region</label>
                                <input type="text" id="ent-state" style="width:100%;color:#ffffff;background:rgba(0, 35, 25, 0.8);border:1px solid rgba(0, 255, 150, 0.2);padding:0.75rem 1rem;border-radius:var(--radius-md);outline:none;font-size:0.95rem;transition:border-color 0.2s, box-shadow 0.2s" onfocus="this.style.borderColor='#00ff9d';this.style.boxShadow='0 0 8px rgba(0,255,150,0.2)'" onblur="this.style.borderColor='rgba(0, 255, 150, 0.2)';this.style.boxShadow='none'" placeholder="Optional" />
                            </div>
                        </div>

                        <div style="margin-bottom:var(--space-5)">
                            <label style="display:block;font-size:0.85rem;font-weight:600;color:#e8fff5;margin-bottom:var(--space-2)">Intended Use Case <span style="color:#ff4d4d">*</span></label>
                            <textarea id="ent-usecase" required rows="3" style="width:100%;color:#ffffff;background:rgba(0, 35, 25, 0.8);border:1px solid rgba(0, 255, 150, 0.2);padding:0.75rem 1rem;border-radius:var(--radius-md);outline:none;font-size:0.95rem;transition:border-color 0.2s, box-shadow 0.2s;resize:vertical" onfocus="this.style.borderColor='#00ff9d';this.style.boxShadow='0 0 8px rgba(0,255,150,0.2)'" onblur="this.style.borderColor='rgba(0, 255, 150, 0.2)';this.style.boxShadow='none'" placeholder="Describe how you plan to use TerraShield data..."></textarea>
                        </div>
                        
                        <div style="margin-bottom:var(--space-6)">
                            <label style="display:block;font-size:0.85rem;font-weight:600;color:#e8fff5;margin-bottom:var(--space-2)">Estimated API Usage Volume</label>
                            <select id="ent-volume" style="width:100%;color:#ffffff;background:rgba(0, 35, 25, 0.8);border:1px solid rgba(0, 255, 150, 0.2);padding:0.75rem 1rem;border-radius:var(--radius-md);outline:none;font-size:0.95rem;transition:border-color 0.2s, box-shadow 0.2s" onfocus="this.style.borderColor='#00ff9d';this.style.boxShadow='0 0 8px rgba(0,255,150,0.2)'" onblur="this.style.borderColor='rgba(0, 255, 150, 0.2)';this.style.boxShadow='none'">
                                <option value="low">Low (< 10k requests/mo)</option>
                                <option value="moderate" selected>Moderate (10k - 100k requests/mo)</option>
                                <option value="high">High (> 100k requests/mo)</option>
                            </select>
                        </div>

                        <div style="margin-bottom:var(--space-4);display:flex;align-items:flex-start;gap:12px">
                            <input type="checkbox" id="ent-sandbox" style="margin-top:4px;accent-color:#2edd82" />
                            <label for="ent-sandbox" style="font-size:0.85rem;font-weight:600;color:#e8fff5;cursor:pointer;user-select:none">Request immediate Sandbox Key access for testing.</label>
                        </div>

                        <div style="margin-bottom:var(--space-8);display:flex;align-items:flex-start;gap:12px">
                            <input type="checkbox" id="ent-terms" required style="margin-top:4px;accent-color:#2edd82" />
                            <label for="ent-terms" style="font-size:0.85rem;font-weight:600;color:#e8fff5;cursor:pointer;user-select:none">I accept the Terms of Service & Ecological Data Policy. <span style="color:#ff4d4d">*</span></label>
                        </div>

                        <button id="ent-submit-btn" type="submit" style="width:100%;background:linear-gradient(90deg, #00c97b, #00ff9d);color:#002b1f;border:none;border-radius:var(--radius-md);padding:1rem;font-size:1rem;font-weight:bold;cursor:pointer;transition:all 0.3s ease;box-shadow:0 0 20px rgba(0,255,150,0.3);display:flex;align-items:center;justify-content:center;gap:8px" onmouseover="this.style.boxShadow='0 0 30px rgba(0,255,150,0.5)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='0 0 20px rgba(0,255,150,0.3)';this.style.transform='translateY(0)'">
                            <span id="ent-btn-text">Submit Enterprise Request</span>
                            <span id="ent-btn-icon" class="material-symbols-outlined" style="font-size:1.2rem">send</span>
                        </button>
                    </form>

                    <!-- Success State -->
                    <div id="enterprise-success" style="display:none;flex-direction:column;align-items:center;text-align:center;padding:var(--space-6) 0">
                        <div style="width:80px;height:80px;border-radius:50%;background:rgba(46,221,130,0.1);color:#2edd82;display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-6);box-shadow:0 0 30px rgba(46,221,130,0.2)">
                            <span class="material-symbols-outlined" style="font-size:3rem">check_circle</span>
                        </div>
                        <h2 style="font-size:1.75rem;font-weight:bold;color:#fff;margin-bottom:var(--space-3);font-family:serif">Request Submitted Successfully</h2>
                        <p style="color:var(--color-slate-400);font-size:1.05rem;line-height:1.6;margin-bottom:var(--space-6)">
                           Your enterprise access request has been received.<br/>
                           Our team will review your application and contact you within 24–48 hours.
                        </p>
                        <div style="background:rgba(255,255,255,0.05);border:1px dashed rgba(255,255,255,0.2);padding:1rem 2rem;border-radius:var(--radius-md);margin-bottom:var(--space-8)">
                           <span style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--color-slate-500);display:block;margin-bottom:4px">Application Tracking ID</span>
                           <span id="ent-app-id" style="font-size:1.25rem;font-weight:bold;color:#2edd82;letter-spacing:2px;font-family:monospace">TS-ENT-XXXXX</span>
                        </div>
                        <a href="#/" style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:0.75rem 1.5rem;border-radius:var(--radius-md);font-weight:bold;text-decoration:none;transition:all 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                            Return to Home
                        </a>
                    </div>
                </div>

            </div>
        </main>
        ${renderFooter()}
        `,
        init: () => {
            const form = document.getElementById('enterprise-form');
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const btn = document.getElementById('ent-submit-btn');
                const btnText = document.getElementById('ent-btn-text');
                const btnIcon = document.getElementById('ent-btn-icon');

                // Loading state
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
                btnText.textContent = 'Processing request...';
                btnIcon.textContent = 'progress_activity';
                btnIcon.style.animation = 'spin 1.5s linear infinite';

                // Simulated delay exactly 1.5 seconds
                setTimeout(() => {
                    const randomId = 'TS-ENT-' + Math.floor(10000 + Math.random() * 90000);

                    form.style.display = 'none';
                    document.getElementById('ent-app-id').textContent = randomId;

                    const successView = document.getElementById('enterprise-success');
                    successView.style.display = 'flex';
                    successView.style.opacity = '0';
                    successView.style.transition = 'opacity 0.4s ease';

                    setTimeout(() => {
                        successView.style.opacity = '1';
                    }, 50);
                }, 1500);
            });
        }
    };
}
