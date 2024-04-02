import { GUI } from 'https://cdn.skypack.dev/dat.gui'

const CONFIG = {
  explode: false,
  border: 4,
  radius: 12,
  width: 50,
  height: 40,
  x: 0,
  y: 0,
  alpha: 0,
  blur: 14,
}

const CTRL = new GUI({
  width: 220
})

const UPDATE = () => {
  for (const key of Object.keys(CONFIG)) {
    if (key !== 'explode') {
      document.documentElement.style.setProperty(`--${key}`, CONFIG[key])
    }
  }
}

const TOGGLE_EXPLODE = () => {
  const exploded = CONFIG.explode
  document.body.toggleAttribute('data-exploded')
  if (!exploded) {
    // Need to tear down the explosion
    document.body.toggleAttribute('data-imploding')
    const TRANSITION = document.getAnimations()
    Promise.all([...TRANSITION.map(t => t.finished)]).then(() => {document.body.toggleAttribute('data-imploding')})
  }
}

CTRL.add(CONFIG, 'explode').name('Explode?').onChange(TOGGLE_EXPLODE)
CTRL.add(CONFIG, 'border', 1, 30, 1).name('Border width (px)').onChange(UPDATE)
CTRL.add(CONFIG, 'radius', 1, 500, 1).name('Border radius (px)').onChange(UPDATE)
CTRL.add(CONFIG, 'width', 10, 100, 1).name('Width (vmin)').onChange(UPDATE)
CTRL.add(CONFIG, 'height', 10, 100, 1).name('Height (vmin)').onChange(UPDATE)
CTRL.add(CONFIG, 'alpha', 0, 1, 0.01).name('Mask Alpha').onChange(UPDATE)
CTRL.add(CONFIG, 'blur', 0, 50, 1).name('Backdrop Blur').onChange(UPDATE)
CTRL.add(CONFIG, 'x', -100, 100, 1).name('Translate X (%)').onChange(UPDATE)
CTRL.add(CONFIG, 'y', -100, 100, 1).name('Translate Y (%)').onChange(UPDATE)

UPDATE()
