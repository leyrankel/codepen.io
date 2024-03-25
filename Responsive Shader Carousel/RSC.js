/*********
 * made by Matthias Hurrle (@atzedent)
 *
 * Based on the work of: @noirsociety
 * "Responsive Image Carousel (Animation)"
 * https://codepen.io/noirsociety/pen/ZEwLGXB
 *
 * This implementation adds the following features:
 * - background images rendered from GLSL shaders (two versions: low and full resolution)
 * - play/pause button to start/stop the shader animation
 * - swipe gestures on mobile
 * - keyboard navigation (left/right arrow keys) and spacebar to play/pause
 *
 * Some less obvious changes:
 * - despite paused, run animation on resize to adjust to the new resolution
 * - regenerate the images with full resolution on orientation change
 *
 */

let dpr = Math.max(1, window.devicePixelRatio);

const vertexSource = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

in vec4 position;

void main(void) {
    gl_Position = position;
}
`;

function compile(shader, source) {
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
}

let canvas,
  gl,
  shaders = [],
  programs = [],
  vertices,
  buffer;

function setup() {
  canvas = document.createElement("canvas");

  gl = canvas.getContext("webgl2");
  const vs = gl.createShader(gl.VERTEX_SHADER);

  compile(vs, vertexSource);

  shaders = Array.from(
    document.querySelectorAll("script[type='x-shader/x-fragment']")
  );
  programs = shaders.map(() => gl.createProgram());

  for (let i = 0; i < shaders.length; i++) {
    let addr = gl.createShader(gl.FRAGMENT_SHADER);
    let program = programs[i];

    compile(addr, shaders[i].textContent);
    gl.attachShader(program, vs);
    gl.attachShader(program, addr);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
  }

  vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

  buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  for (const program of programs) {
    const position = gl.getAttribLocation(program, "position");

    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // uniforms come here...
    program.resolution = gl.getUniformLocation(program, "resolution");
    program.time = gl.getUniformLocation(program, "time");
  }
}

function draw(now, program) {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // uniforms come here...
  gl.uniform2f(program.resolution, canvas.width, canvas.height);
  gl.uniform1f(program.time, now * 1e-3);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length * 0.5);
}

let running = false,
  then = 0,
  af = null;

function loop(now, index) {
  if (running) {
    draw(now + then, programs[index]);
    af = requestAnimationFrame((t) => loop(t, index));
  } else {
    then = now;
    cancelAnimationFrame(af);
  }
}

function removeCanvas() {
  const canvas = document.querySelector("canvas");
  running = false;

  if (canvas) {
    canvas.remove();
  }
}

function setXOff(slider, value) {
  if (!slider) {
    slider = document.querySelector(".slider");
  }

  slider.style.setProperty("--x-off", `${value}%`);
}

function hookEvents() {
  const slider = document.querySelector(".slider");

  // The primary navigation buttons
  function activate(e) {
    const items = document.querySelectorAll(".slide");
    if (e.target.closest(".nav")) {
      setXOff(slider, 0);

      setTimeout(
        () => {
          e.target.matches(".next") && slider.append(items[0]);
          e.target.matches(".prev") && slider.prepend(items[items.length - 1]);

          // Cleanup
          removeCanvas();
          document
            .querySelectorAll(".slide .more use")
            .forEach((p) => p.setAttribute("xlink:href", "#play"));
        },
        running ? 1000 : 0
      );
    }
  }

  // Allow swiping on mobile
  let sliding = false;
  let origX = 0;

  function slide(e) {
    if (!sliding) return;

    const { touches } = e;
    const first = touches[0];
    const val = first.screenX - origX;

    setXOff(slider, Math.max(-50, Math.min(50, val)));

    if (val < -50) {
      sliding = false;
      setXOff(slider, 0);
      document.querySelector(".next").click();
    } else if (val > 50) {
      sliding = false;
      setXOff(slider, 0);
      document.querySelector(".prev").click();
    }
  }

  document.addEventListener("click", activate);
  document.addEventListener("touchmove", slide);
  document.addEventListener("touchstart", (e) => {
    if (running) return;
    sliding = true;
    origX = e.touches[0].screenX;
  });
  document.addEventListener("touchend", () => {
    if (running) return;
    sliding = false;
    setXOff(null, 0);
  });

  document.addEventListener("keydown", (e) => {
    const items = document.querySelectorAll(".slide");

    if (e.key === "ArrowRight") {
      document.querySelector(".next").click();
    } else if (e.key === "ArrowLeft") {
      document.querySelector(".prev").click();
    } else if (e.key === " ") {
      const button = items[1].querySelector(".more");
      button.click();
    }
  });

  function setupPlayButton() {
    const listItems = document.querySelectorAll(".slide");

    for (const item of listItems) {
      const button = item.querySelector(".more");

      button.addEventListener("click", (e) => {
        const slide = e.target.closest(".slide");
        running = !running;

        // Toggle the play/pause icon
        button
          .querySelector("use")
          .setAttribute("xlink:href", running ? "#pause" : "#play");

        if (!running) {
          // Bring back the thumbnails
          setXOff(slider, 0);
          return;
        }

        // Hide the thumbnails
        setXOff(slider, 100);

        if (slide.querySelector("canvas")) {
          running = true;
          loop(0, slide.dataset.shaderIndex);
        } else {
          // Set up the canvas and start the animation
          animate(slide);
        }
      });
    }
  }

  setupPlayButton();
}

function animate(slide) {
  const shaderIndex = slide.dataset.shaderIndex;
  const visual = slide.querySelector(".visual");

  resizeInner();
  running = true;
  loop(0, shaderIndex);
  visual.append(canvas);
}

async function init() {
  console.clear();
  hookEvents();
  setup();
  resize();

  // Render the shaders to background images of the slides
  return new Promise((resolve) => {
    for (let i = 0; i < programs.length; i++) {
      // Decrease the resolution of all but the first two shaders to improve performance
      if (i > 1) {
        dpr = Math.max(1, 0.25 * window.devicePixelRatio);
        resize();
      }
      draw(0, programs[i]);
      const img = canvas.toDataURL();
      const slide = document.querySelectorAll(".slide")[i];
      slide.style.backgroundImage = `url(${img})`;
      slide.dataset.shaderIndex = i;
      slide.dataset.rerendered = `${canvas.width}x${canvas.height}`;
      slide.querySelector(".title").textContent = shaders[i].dataset.title;
    }

    // Reset the resolution to full
    dpr = Math.max(1, window.devicePixelRatio);
    // When the images are loaded, regenerate the images with full resolution
    setTimeout(async () => await regenerateImagesWithFullResolution(), 2000);
    resolve();
  });
}

async function regenerateImagesWithFullResolution(all = false) {
  return new Promise((resolve) => {
    const slides = document.querySelectorAll(".slide");

    resize();

    for (const slide of slides) {
      const shaderIndex = slide.dataset.shaderIndex;

      // Skip the first two shaders in the initial run (if all is false)
      // since they are already rendered with full resolution
      if (!all && shaderIndex < 2) continue;
      requestAnimationFrame(() => renderBackground(slide));
    }

    resolve();
  });
}

function renderBackground(slide) {
  const shaderIndex = slide.dataset.shaderIndex;

  draw(0, programs[shaderIndex]);

  const img = canvas.toDataURL();

  slide.style.backgroundImage = `url(${img})`;
  slide.dataset.rerendered = `${canvas.width}x${canvas.height}`;
  slide.classList.toggle("rerendered"); // help certain browsers to update the background image
}

function size(width, height) {
  canvas.width = width;
  canvas.height = height;

  gl.viewport(0, 0, width, height);
}

function resizeInner() {
  const { innerWidth: width, innerHeight: height } = window;

  size(width * dpr, height * dpr);
}

function resize() {
  const { width, height } = window.screen;

  size(width * dpr, height * dpr);
}

window.onresize = () => {
  resizeInner();

  if (running) return;

  // Run the shader animation on the current slide in order to
  // adjust to the new resolution
  document.querySelectorAll(".slide").forEach((slide) => {
    if (slide.querySelector("canvas")) {
      running = true;
      loop(0, slide.dataset.shaderIndex);
      running = false;
    }
  });
};

window.onorientationchange = async () => {
  // Regenerate the images with the new resolution
  resize();
  await regenerateImagesWithFullResolution(true);
};

window.addEventListener("load", async () => await init());
