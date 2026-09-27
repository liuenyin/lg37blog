// Shared, framework-independent Live2D companion. See README.md for model setup.
const ROOT = new URL('./', import.meta.url);
const scripts = new Map();
const pref = {
  get() { try { return localStorage.getItem('ln-companion-collapsed'); } catch { return null; } },
  set(value) { try { localStorage.setItem('ln-companion-collapsed', String(value)); } catch {} },
};
function loadScript(src) {
  if (scripts.has(src)) return scripts.get(src);
  const pending = new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    const timer = setTimeout(() => { tag.remove(); reject(new Error('Runtime timed out')); }, 20000);
    tag.src = src;
    tag.onload = () => { clearTimeout(timer); resolve(); };
    tag.onerror = () => { clearTimeout(timer); tag.remove(); reject(new Error('Runtime unavailable')); };
    document.head.append(tag);
  }).catch(error => { scripts.delete(src); throw error; });
  scripts.set(src, pending);
  return pending;
}
const CSS = `
  :host{position:fixed;right:18px;bottom:16px;z-index:40;font:14px/1.6 "Segoe UI","Microsoft YaHei",sans-serif;color:#55423f;contain:layout style;--pink:#f5e5e8}
  *{box-sizing:border-box} [hidden]{display:none!important}
  button,a{font:inherit;color:inherit}button{cursor:pointer;border:1px solid #e4cfd2;background:#fffaf9;border-radius:16px;min-height:34px;padding:5px 12px}
  button:hover{background:var(--pink)}button:focus-visible,a:focus-visible,canvas:focus-visible{outline:2px solid #aa657d;outline-offset:3px}
  .panel{width:210px;max-width:calc(100vw - 24px)}.top{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 8px}
  .handle{border:0;background:#fffaf9e8;cursor:grab;touch-action:none;font-size:13px;user-select:none}.handle:active{cursor:grabbing}
  .close{width:34px;padding:0;font-size:20px}.stage{height:260px;width:100%;position:relative}
  canvas{display:block;width:100%;height:100%;touch-action:pan-y}.status{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;color:#796469;pointer-events:none}
  .tools{display:flex;gap:6px;justify-content:center;align-items:center}.tools button{font-size:13px}.credit{font-size:13px;padding:4px}
  .bubble{margin:0 0 10px;padding:11px 14px;background:#fffaf9f5;border:1px solid #ead7dc;border-radius:15px;box-shadow:0 4px 16px #6b43520a;overflow-wrap:anywhere}
  .launcher{box-shadow:0 3px 15px #6b435212;padding:8px 15px;border-radius:22px}.launcher::before{content:'✧';color:#a7627c;margin-right:6px}
  @media(max-width:600px){:host{right:10px;bottom:10px}.panel{width:168px}.stage{height:208px}}
  @media(prefers-color-scheme:dark){.bubble,.launcher,.handle,.close,.tools button{box-shadow:0 2px 12px #0001}}
`;
class MarchCompanion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
      <button class="launcher" hidden aria-expanded="false">三月七</button>
      <section class="panel" hidden aria-label="三月七看板娘">
        <p class="bubble" role="status" hidden></p>
        <div class="top"><button class="handle" title="拖动位置；方向键微调，Home 复位">三月七</button><button class="close" aria-label="收起看板娘">×</button></div>
        <div class="stage"><canvas tabindex="0" role="button" aria-label="与三月七打招呼"></canvas><span class="status"></span></div>
        <div class="tools"><button class="talk">打招呼</button><button class="expression">换表情</button><a class="credit" target="_blank" rel="noopener noreferrer" hidden>来源</a></div>
      </section>`;
    this.$ = selector => this.shadowRoot.querySelector(selector);
  }
  connectedCallback() {
    // Astro may briefly disconnect a persisted element while swapping pages.
    clearTimeout(this.disconnectTimer);
    if (this.active) return;
    this.active = true;
    this.abort = new AbortController();
    this.events = new AbortController();
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.boot();
  }
  disconnectedCallback() {
    this.disconnectTimer = setTimeout(() => {
      if (this.isConnected) return;
      this.active = false;
      this.abort.abort(); this.events.abort(); clearTimeout(this.bubbleTimer);
      this.app?.destroy(false, { children: true, texture: true, baseTexture: true });
      this.app = null; this.model = null; this.loading = null;
    }, 0);
  }
  on(target, name, handler) { target.addEventListener(name, handler, { signal: this.events.signal }); }
  async boot() {
    try {
      const response = await fetch(new URL('config.json', ROOT), { signal: this.abort.signal });
      if (!response.ok) return;
      this.config = await response.json();
      // No placeholder avatar or third-party requests until an authorized model is configured.
      if (!this.active || !this.config.enabled || !this.config.model) return;
      this.$('.handle').textContent = this.config.name || '三月七';
      this.$('.launcher').textContent = this.config.name || '三月七';
      if (this.config.attributionUrl) {
        const credit = new URL(this.config.attributionUrl);
        if (credit.protocol === 'https:') { this.$('.credit').href = credit.href; this.$('.credit').hidden = false; }
      }
      this.on(this.$('.launcher'), 'click', () => this.setCollapsed(false));
      this.on(this.$('.close'), 'click', () => { this.setCollapsed(true); this.$('.launcher').focus(); });
      this.on(this.$('.talk'), 'click', () => this.greet());
      this.on(this.$('.expression'), 'click', () => this.expression());
      this.on(this.$('canvas'), 'click', () => this.greet());
      this.on(this.$('canvas'), 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.greet(); } });
      this.on(this, 'keydown', e => { if (e.key === 'Escape') { this.setCollapsed(true); this.$('.launcher').focus(); } });
      this.on(document, 'visibilitychange', () => this.syncTicker());
      this.on(this.reduced, 'change', () => this.syncTicker());
      this.on(window, 'resize', () => { this.fit(); this.clampPosition(); });
      this.on(window, 'pointermove', e => {
        if (!this.model || this.collapsed || this.reduced.matches || document.hidden || e.pointerType === 'touch') return;
        const r = this.$('canvas').getBoundingClientRect();
        this.model.focus((e.clientX - r.left) * this.app.screen.width / r.width, (e.clientY - r.top) * this.app.screen.height / r.height);
      });
      this.dragSetup();
      const saved = pref.get();
      this.setCollapsed(saved === null ? matchMedia('(max-width: 600px)').matches || this.reduced.matches : saved === 'true', false);
    } catch (error) { if (error.name !== 'AbortError') console.warn('Companion configuration unavailable.'); }
  }
  setCollapsed(value, save = true) {
    this.collapsed = value;
    this.$('.panel').hidden = value;
    this.$('.launcher').hidden = !value;
    this.$('.launcher').setAttribute('aria-expanded', String(!value));
    this.style.left = ''; this.style.top = ''; this.style.right = ''; this.style.bottom = '';
    if (save) pref.set(value);
    if (!value) this.start();
    this.syncTicker();
  }
  async start() {
    if (this.model) { this.fit(); this.syncTicker(); return; }
    if (this.loading) return;
    this.loading = true;
    this.$('.status').textContent = '正在赶来…';
    this.$('.status').hidden = false;
    const signal = this.abort.signal;
    let pendingModel;
    try {
      if (!window.PIXI) await loadScript('https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js');
      if (!window.Live2DCubismCore) await loadScript('https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js');
      if (!window.PIXI.live2d) await loadScript('https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js');
      if (signal.aborted) return;
      const PIXI = window.PIXI;
      this.app = new PIXI.Application({ view: this.$('canvas'), width: 210, height: 260, backgroundAlpha: 0, antialias: true, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, autoStart: false });
      this.app.ticker.maxFPS = 30;
      pendingModel = await PIXI.live2d.Live2DModel.from(new URL(this.config.model, ROOT).href, { autoInteract: false, autoUpdate: true, motionPreload: 'IDLE' });
      if (signal.aborted) { pendingModel.destroy(); return; }
      this.model = pendingModel;
      this.app.stage.addChild(this.model);
      this.$('.expression').disabled = !this.model.internalModel.motionManager.expressionManager;
      this.$('.status').hidden = true;
      this.fit(); this.syncTicker();
      if (!this.collapsed) this.say(this.config.greeting);
    } catch (error) {
      if (signal.aborted) return;
      this.app?.destroy(false, { children: true, texture: true, baseTexture: true });
      this.app = null; this.model = null;
      this.$('.status').textContent = '暂时没能加载，收起后可以重试。';
      console.warn('Live2D companion failed to load.', error);
    } finally { if (!signal.aborted) this.loading = false; }
  }
  fit() {
    if (!this.model || this.collapsed) return;
    const { width, height } = this.$('.stage').getBoundingClientRect();
    this.app.renderer.resize(width, height);
    const naturalWidth = this.model.internalModel.width;
    const naturalHeight = this.model.internalModel.height;
    this.model.scale.set(Math.min(width / naturalWidth, height / naturalHeight) * 0.97);
    this.model.anchor.set(0.5, 1);
    this.model.position.set(width / 2, height);
    this.app.render();
  }
  syncTicker() {
    if (!this.app || !this.model) return;
    const moving = !this.collapsed && !document.hidden && !this.reduced.matches;
    this.model.autoUpdate = moving;
    if (moving) this.app.start();
    else { this.app.stop(); this.app.render(); }
  }
  say(text) {
    if (!text) return;
    this.$('.bubble').textContent = text;
    this.$('.bubble').hidden = false;
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => { this.$('.bubble').hidden = true; }, 5000);
    this.clampPosition();
  }
  greet() {
    const messages = this.config.messages?.length ? this.config.messages : [this.config.greeting];
    this.messageIndex = ((this.messageIndex ?? -1) + 1) % messages.length;
    this.say(messages[this.messageIndex]);
    this.expression();
  }
  expression() {
    if (!this.model?.internalModel.motionManager.expressionManager) return;
    this.model.expression().then(() => {
      if (this.reduced.matches && this.model) { this.model.update(300); this.app?.render(); }
    }).catch(() => {});
  }
  positionAt(x, y) {
    const rect = this.getBoundingClientRect();
    this.style.right = 'auto'; this.style.bottom = 'auto';
    this.style.left = `${Math.max(8, Math.min(x, innerWidth - rect.width - 8))}px`;
    this.style.top = `${Math.max(8, Math.min(y, innerHeight - rect.height - 8))}px`;
  }
  clampPosition() { if (this.style.left) { const r = this.getBoundingClientRect(); this.positionAt(r.left, r.top); } }
  dragSetup() {
    const handle = this.$('.handle');
    let drag;
    this.on(handle, 'pointerdown', e => {
      if (e.button !== 0) return;
      const r = this.getBoundingClientRect(); drag = { x: e.clientX - r.left, y: e.clientY - r.top };
      handle.setPointerCapture(e.pointerId);
    });
    this.on(handle, 'pointermove', e => { if (drag) this.positionAt(e.clientX - drag.x, e.clientY - drag.y); });
    this.on(handle, 'pointerup', () => { drag = null; });
    this.on(handle, 'pointercancel', () => { drag = null; });
    this.on(handle, 'lostpointercapture', () => { drag = null; });
    this.on(handle, 'keydown', e => {
      const delta = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[e.key];
      if (delta) { e.preventDefault(); const r = this.getBoundingClientRect(); this.positionAt(r.left + delta[0], r.top + delta[1]); }
      if (e.key === 'Home') { e.preventDefault(); this.style.left = ''; this.style.top = ''; this.style.right = ''; this.style.bottom = ''; }
    });
  }
}
if (!customElements.get('march-companion')) customElements.define('march-companion', MarchCompanion);
