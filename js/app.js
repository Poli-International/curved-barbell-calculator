'use strict';

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Piercing presets: typical anatomy span range, recommended gauge, clearance, standard sizes
const PRESETS = [
  {
    id: 'rook',
    name: 'Rook',
    icon: '👂',
    desc: 'Antihelix cartilage fold — upper inner ear',
    typicalMin: 5, typicalMax: 9,
    gauge: '16g (1.2 mm)',
    gaugeNote: 'Most rooks are pierced at 16g. 18g is possible for delicate anatomy.',
    clearanceFresh: 5,
    clearanceHealed: 3,
    standardSizes: [6, 7, 8, 9, 10, 12],
  },
  {
    id: 'daith',
    name: 'Daith',
    icon: '🔵',
    desc: 'Innermost cartilage fold — crus of helix',
    typicalMin: 7, typicalMax: 11,
    gauge: '16g (1.2 mm) or 14g (1.6 mm)',
    gaugeNote: 'Daith anatomy varies considerably. 14g is more common for long-term wear stability.',
    clearanceFresh: 6,
    clearanceHealed: 4,
    standardSizes: [7, 8, 9, 10, 11, 12, 14],
  },
  {
    id: 'snug',
    name: 'Snug',
    icon: '🔶',
    desc: 'Anti-helix cartilage — mid inner ear rim',
    typicalMin: 6, typicalMax: 10,
    gauge: '16g (1.2 mm)',
    gaugeNote: 'Snug is anatomy-dependent. The ridge must be prominent enough to support the barbell.',
    clearanceFresh: 5,
    clearanceHealed: 3,
    standardSizes: [7, 8, 9, 10, 11, 12],
  },
  {
    id: 'conch',
    name: 'Conch (curved)',
    icon: '🐚',
    desc: 'Bowl of the ear — inner or outer conch',
    typicalMin: 7, typicalMax: 12,
    gauge: '16g or 14g (1.2–1.6 mm)',
    gaugeNote: 'Curved barbells are one option for conch; rings are also common. 14g recommended for longevity.',
    clearanceFresh: 6,
    clearanceHealed: 4,
    standardSizes: [8, 9, 10, 11, 12, 14],
  },
  {
    id: 'eyebrow',
    name: 'Eyebrow / Anti-eyebrow',
    icon: '✏️',
    desc: 'Surface-type curved barbell through brow ridge',
    typicalMin: 7, typicalMax: 10,
    gauge: '16g (1.2 mm)',
    gaugeNote: 'Eyebrow piercings are surface-type. Use an anatomically shaped curved barbell — straight bars cause migration.',
    clearanceFresh: 6,
    clearanceHealed: 4,
    standardSizes: [8, 9, 10, 11, 12],
  },
  {
    id: 'navel',
    name: 'Navel / Belly button',
    icon: '💛',
    desc: 'Upper rim of the navel',
    typicalMin: 9, typicalMax: 14,
    gauge: '14g (1.6 mm)',
    gaugeNote: 'Navel piercings are almost always done at 14g. 12g exists for premium thick-tissue anatomy.',
    clearanceFresh: 7,
    clearanceHealed: 5,
    standardSizes: [10, 11, 12, 13, 14, 16],
  },
];

// Standard curved barbell internal lengths (mm) in common production sizes
const ALL_SIZES = [6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20];

// ─── UI state ─────────────────────────────────────────────────────
const piercingTypeSel  = document.getElementById('piercing-type');
const measurementInput = document.getElementById('anatomy-mm');
const healingStage     = document.getElementById('healing-stage');
const calcBtn          = document.getElementById('calc-btn');
const resultArea       = document.getElementById('results');
const presetInfo       = document.getElementById('preset-info');

// Populate piercing type select
PRESETS.forEach(p => {
  piercingTypeSel.insertAdjacentHTML('beforeend', `<option value="${escHtml(p.id)}">${escHtml(p.icon)} ${escHtml(p.name)}</option>`);
});

piercingTypeSel.addEventListener('change', updatePresetInfo);
updatePresetInfo();

function updatePresetInfo() {
  const preset = PRESETS.find(p => p.id === piercingTypeSel.value);
  if (!preset) { presetInfo.innerHTML = ''; return; }
  presetInfo.innerHTML = `
    <div class="preset-card">
      <div class="preset-name">${escHtml(preset.icon)} ${escHtml(preset.name)}</div>
      <div class="preset-desc">${escHtml(preset.desc)}</div>
      <div class="preset-detail">
        <span class="detail-lbl">Typical anatomy span:</span>
        <span class="detail-val">${preset.typicalMin}–${preset.typicalMax} mm</span>
      </div>
      <div class="preset-detail">
        <span class="detail-lbl">Standard gauge:</span>
        <span class="detail-val">${escHtml(preset.gauge)}</span>
      </div>
      <div class="preset-gauge-note">${escHtml(preset.gaugeNote)}</div>
    </div>`;
}

calcBtn.addEventListener('click', calculate);

function calculate() {
  const preset  = PRESETS.find(p => p.id === piercingTypeSel.value);
  const span    = parseFloat(measurementInput.value);
  const stage   = healingStage.value;

  if (!preset) return;

  if (isNaN(span) || span < 1 || span > 40) {
    resultArea.innerHTML = `<div class="err-card">Enter a valid anatomy measurement between 1 and 40 mm.</div>`;
    return;
  }

  const clearance    = stage === 'fresh' ? preset.clearanceFresh : preset.clearanceHealed;
  const recommended  = span + clearance;

  // Find the next standard size at or above the recommended length
  const bestFit = ALL_SIZES.find(s => s >= recommended) || ALL_SIZES[ALL_SIZES.length - 1];
  const nextUp  = ALL_SIZES.find(s => s > bestFit) || null;

  resultArea.innerHTML = buildResult(preset, span, stage, clearance, recommended, bestFit, nextUp);
}

function buildResult(preset, span, stage, clearance, recommended, bestFit, nextUp) {
  const stageLabel = stage === 'fresh' ? 'fresh / unhealed' : 'healed';
  const nextUpHtml = nextUp
    ? `<div class="size-option size-option--alt"><div class="size-val">${nextUp} mm</div><div class="size-lbl">Next size up — extra comfort margin</div></div>`
    : '';

  return `
    <div class="result-card">
      <div class="result-header">
        <span class="result-icon">${escHtml(preset.icon)}</span>
        <div>
          <div class="result-title">${bestFit} mm internal length</div>
          <div class="result-sub">${escHtml(preset.name)} — ${escHtml(stageLabel)} tissue</div>
        </div>
      </div>

      <div class="calc-breakdown">
        <div class="calc-row">
          <span class="calc-lbl">Anatomy span (measured)</span>
          <span class="calc-val">${span} mm</span>
        </div>
        <div class="calc-row">
          <span class="calc-lbl">Clearance (${escHtml(stageLabel)})</span>
          <span class="calc-val">+ ${clearance} mm</span>
        </div>
        <div class="calc-row calc-row--total">
          <span class="calc-lbl">Recommended minimum length</span>
          <span class="calc-val">${recommended.toFixed(1)} mm</span>
        </div>
      </div>

      <div class="size-options">
        <div class="size-option size-option--primary">
          <div class="size-val">${bestFit} mm</div>
          <div class="size-lbl">Recommended — nearest standard size</div>
        </div>
        ${nextUpHtml}
      </div>

      <div class="result-gauge-note">
        <strong>Gauge:</strong> ${escHtml(preset.gauge)} — ${escHtml(preset.gaugeNote)}
      </div>

      <div class="result-advice">
        For ${escHtml(stage === 'fresh' ? 'fresh piercings' : 'healed piercings')},
        ${stage === 'fresh'
          ? 'the extra clearance allows for swelling during initial healing. Do not downsize before the piercing is fully healed.'
          : 'a snugger fit reduces leverage and movement. Only downsize once healing is confirmed by your piercer.'}
        Always use implant-grade material — <a href="https://poliinternational.com/bioflex/" target="_blank" rel="noopener noreferrer">BioFlex® polymer</a>
        or ASTM F136 titanium for initial piercings.
      </div>
    </div>`;
}
