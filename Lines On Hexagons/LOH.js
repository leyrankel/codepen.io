"use strict";

let canv, ctx; // canvas and context
let canvGrid;

let maxx, maxy; // canvas dimensions
let grid, nbx, nby; // grid, number of cols - rows
let offsx, offsy;
let radius;
let ui, uiv;

const MIN_NB_CELLS = 10; // NOT accurate limits, just for order of magnitude
const MAX_NB_CELLS = 100;
let withMargin; // grid completely covers canvas, or empty margin around it ?
/* table relProbaNbPoints gives the RELATIVE probability used to attribute 0 to 3 points
to each side of an hexagon.
I should contained integer values in the range 0..20.
*/
const tbRelProbaNbPoints = [
  [0, 1, 0, 0], // allways 1
  [0, 0, 1, 0], // allways 2
  [0, 0, 0, 1], // allways 3
  [0, 1, 1, 0], // 1-2
  [0, 1, 0, 1], // 1-3
  [0, 0, 2, 1], // 2-3
  [0, 1, 3, 1]
]; // never 0, same chance 1 and 3, 3 times more chances to choose 2

let geometryChoice;
let concentric;
let uncentered;
let internRegularity; // only meaningful if concentric
let drawSpeed;

let rndStruct, rndCol, rndGen; // random numbers generators for structure, colors and general use
let loops;
// for animation
let messages;

// shortcuts for Math.
const mrandom = Math.random;
const mfloor = Math.floor;
const mround = Math.round;
const mceil = Math.ceil;
const mabs = Math.abs;
const mmin = Math.min;
const mmax = Math.max;

const mPI = Math.PI;
const mPIS2 = Math.PI / 2;
const mPIS3 = Math.PI / 3;
const m2PI = Math.PI * 2;
const m2PIS3 = (Math.PI * 2) / 3;
const msin = Math.sin;
const mcos = Math.cos;
const matan2 = Math.atan2;

const mhypot = Math.hypot;
const msqrt = Math.sqrt;

const rac3 = msqrt(3);
const rac3s2 = rac3 / 2;

/* based on a function found at https://www.grc.com/otg/uheprng.htm
and customized to my needs

use :
  x = Mash('1213'); // returns a resettable, reproducible pseudo-random number generator function
  x = Mash();  // like line above, but uses Math.random() for a seed
  x();         // returns pseudo-random number in range [0..1[;
  x.reset();   // re-initializes the sequence with the same seed. Even if Mash was invoked without seed, will generate the same sequence.
  x.seed;      // retrieves the internal seed actually used. May be useful if no seed or non-string seed provided to Mash
               be careful : this internal seed is a String, even if it may look like a number. Changing or omitting any single digit will produce a completely different sequence
  x.intAlea(max) returns integer in the range [0..max[
  x.intAlea(min, max) returns integer in the range [min..max[
  x.alea(max) returns float in the range [0..max[
  x.alea(min, max) returns float in the range [min..max[
*/

/*	============================================================================
      This is based upon Johannes Baagoe's carefully designed and efficient hash
      function for use with JavaScript.  It has a proven "avalanche" effect such
      that every bit of the input affects every bit of the output 50% of the time,
      which is good.	See: http://baagoe.com/en/RandomMusings/hash/avalanche.xhtml
      ============================================================================
    */
/* seed may be almost anything not evaluating to false */
function Mash(seed) {
  let n = 0xefc8249d;
  let intSeed = (seed || Math.random()).toString();

  function mash(data) {
    if (data) {
      data = data.toString();
      for (var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    } else n = 0xefc8249d;
  }
  mash(intSeed); // initial value based on seed

  let mmash = () => mash("A"); // could as well be 'B' or '!' or any non falsy value
  mmash.reset = () => {
    mash();
    mash(intSeed);
  };
  Object.defineProperty(mmash, "seed", { get: () => intSeed });
  mmash.intAlea = function (min, max) {
    if (typeof max == "undefined") {
      max = min;
      min = 0;
    }
    return mfloor(min + (max - min) * this());
  };
  mmash.alea = function (min, max) {
    // random number [min..max[ . If no max is provided, [0..min[

    if (typeof max == "undefined") return min * this();
    return min + (max - min) * this();
  };

  return mmash;
} // Mash
//------------------------------------------------------------------------
function lerp(p0, p1, alpha) {
  return {
    x: alpha * p1.x + (1 - alpha) * p0.x,
    y: alpha * p1.y + (1 - alpha) * p0.y
  };
} //lerp
//------------------------------------------------------------------------
function distance(p0, p1) {
  return mhypot(p1.x - p0.x, p1.y - p0.y);
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function splitC(cubic, alpha) {
  // split cubic
  /* cubic is an array of 4 points definining a cubic Bézier curve
      this function cuts the cubic into two parts and returns the two parts
       at an intermediate point defined by alpha (0..1)
       The intermediate point is pf (end of 1st part === start of second part )
       caution : alpha is not a length ratio, it is only the value of the t variable of the parametric equation of the curve
       caution : some of the returned points actually are points of the input data, not copies.
      */
  const pa = lerp(cubic[0], cubic[1], alpha); // Casteljau's algorithm
  const pb = lerp(cubic[1], cubic[2], alpha);
  const pc = lerp(cubic[2], cubic[3], alpha);
  const pd = lerp(pa, pb, alpha);
  const pe = lerp(pb, pc, alpha);
  const pf = lerp(pd, pe, alpha);
  return [
    [cubic[0], pa, pd, pf],
    [pf, pe, pc, cubic[3]]
  ];
} // splitC
//------------------------------------------------------------------------
// User Interface (controls)
//------------------------------------------------------------------------
function toggleMenu() {
  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
    this.innerHTML = "close controls ";
  } else {
    menu.classList.add("hidden");
    this.innerHTML = "controls";
  }
} // toggleMenu

//------------------------------------------------------------------------

function getCoerce(name, min, max, isInt) {
  let parse = isInt ? parseInt : parseFloat;
  let ctrl = ui[name];
  let x = parse(ctrl.value, 10);
  if (isNaN(x)) {
    x = uiv[name];
  }
  x = mmax(x, min);
  x = mmin(x, max);
  ctrl.value = uiv[name] = x;
}

//------------------------------------------------------------------------
function prepareUI() {
  // toggle menu handler

  document.querySelector("#controls").addEventListener("click", toggleMenu);

  ui = {}; // User Interface HTML elements
  uiv = {}; // User Interface values of controls

  [
    "autodimension",
    "twidth",
    "theight",
    "geometry",
    "randompattern",
    "withmargin",
    "drawspeed",
    "concentric",
    "centered",
    "regularity",
    "displaygrid",
    "cellsize",
    "cellsizerandom"
  ].forEach((ctrlName) => (ui[ctrlName] = document.getElementById(ctrlName)));

  registerControl("twidth", readCoerced, "change");
  registerControl("theight", readCoerced, "change");
  //      registerControl("size", readUIFloat, "input", fake);
  //      registerControl("density", readUIFloat, "input", fake);
  registerControl("geometry", readUIInt, "change", mouseClick);
  registerControl("autodimension", readAutoDim, "input", mouseClick);
  registerControl("randompattern", readRandomPattern, "input", mouseClick);
  registerControl("withmargin", readUICheck, "input", mouseClick);
  registerControl("concentric", readConcentric, "input", mouseClick);
  registerControl("centered", readUICheck, "input", mouseClick);
  registerControl("regularity", readCoerced, "change", mouseClick);
  registerControl("displaygrid", readDisplayGrid, "input");
  registerControl("cellsizerandom", readCellSizeRandom, "input", mouseClick);
  registerControl("cellsize", readCoerced, "change", mouseClick);
  registerControl("drawspeed", readDrawSpeed, "input");

  readUI();
} // prepareUI

//------------------------------------------------------------------------
function readUI() {
  if (ui.registered) {
    for (const ctrl in ui.registered) ui.registered[ctrl].readF();
  }
} // readUI

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function registerControl(
  controlName,
  readFunction,
  changeEvent,
  changedFunction
) {
  /* provides simple way to associate controls with their read / update / changeEvent / changed functions
      since many (but not all) controls work almost the same way */
  /* changeEvent and changedFunction are optional */

  const ctrl = ui[controlName];
  ui.registered = ui.registered || [];
  ui.registered.push(ctrl); // NEVER register a control twice !!!
  ctrl.readF = readFunction;
  if (changeEvent) {
    ctrl.addEventListener(changeEvent, (event) => {
      readFunction.call(ctrl);
      if (changedFunction) changedFunction.call(ctrl, event);
    });
  }
} // registerControl
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readUIFloat() {
  uiv[this.id] = parseFloat(this.value);
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readUIInt(ctrl, event) {
  uiv[this.id] = parseInt(this.value);
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readUICheck(ctrl, event) {
  uiv[this.id] = this.checked;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readCoerced() {
  /* the element will be read with getCoerce with values given by its min, max and step attributes
        (integer value if step == 1)
      */
  let min = this.getAttribute("min");
  let max = this.getAttribute("max");
  let step = this.getAttribute("step");
  getCoerce(this.id, min, max, step == 1);
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readAutoDim() {
  if ((uiv.autodimension = ui.autodimension.checked)) {
    ui.twidth.disabled = true;
    ui.theight.disabled = true;
    ui.twidth.value = mfloor(window.innerWidth);
    ui.theight.value = mfloor(window.innerHeight);
  } else {
    ui.twidth.disabled = false;
    ui.theight.disabled = false;
  }
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readRandomPattern() {
  if ((uiv.randompattern = ui.randompattern.checked)) {
    ui.geometry.disabled = true;
  } else {
    ui.geometry.disabled = false;
  }
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readConcentric() {
  if ((uiv.concentric = ui.concentric.checked)) {
    ui.centered.disabled = ui.regularity.disabled = false;
  } else {
    ui.centered.disabled = ui.regularity.disabled = true;
  }
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readCellSizeRandom() {
  if ((uiv.cellsizerandom = ui.cellsizerandom.checked)) {
    ui.cellsize.disabled = true;
  } else {
    ui.cellsize.disabled = false;
  }
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readDisplayGrid() {
  if ((uiv.displaygrid = ui.displaygrid.checked)) {
    canvGrid.style.zIndex = 10;
  } else {
    canvGrid.style.zIndex = -10;
  }
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readDrawSpeed() {
  readCoerced.call(ui.drawspeed);
  drawSpeed = (10 + 1990 * uiv.drawspeed * uiv.drawspeed) / 1000;
} //readDrawSpeed
//------------------------------------------------------------------------
class Cell {
  static xs = [-0.5, 0.5, 1, 0.5, -0.5, -1];
  static ys = [-msqrt(3) / 2, -msqrt(3) / 2, 0, msqrt(3) / 2, msqrt(3) / 2, 0];
  static xperp = [
    0,
    -msqrt(3) / 2,
    -msqrt(3) / 2,
    0,
    msqrt(3) / 2,
    msqrt(3) / 2
  ];
  static yperp = [1, 0.5, -0.5, -1, -0.5, 0.5];

  constructor(kx, ky) {
    this.kx = kx;
    this.odd = this.kx & 1; // 0 for even, 1 for odd
    this.ky = ky;
  }
  setNeighbors() {
    this.neighbors = [];
    for (let dir = 0; dir < 6; ++dir) {
      let kx = this.kx + [0, 1, 1, 0, -1, -1][dir];
      let ky =
        this.ky +
        [
          [-1, -1, 0, 1, 0, -1],
          [-1, 0, 1, 1, 1, 0]
        ][this.odd][dir];
      this.neighbors[dir] = grid[ky] && grid[ky][kx]; // may be undefined if line or Cell do no exist
    }
  } // setNeighbors

  flattenDots() {
    this.flatDots = [];
    for (let k = 0; k < 6; ++k) {
      if (this.dots[k]) this.flatDots = this.flatDots.concat(this.dots[k]);
    }
  } // flattenDots

  makeConnectables() {
    this.connectables = [[]];
    this.flatDots.forEach((dot) => {
      if (!dot.closed) this.connectables[0].push(dot);
    });
    this.actives = this.connectables[0].slice(); // ordered list of dots excluding closed one
  } // makeConnectables

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  pickNextDot(dotin, direct) {
    /* manages the 'connectables' property wich tells which points may be connected together
          without cutting a previously created connection
      /* normally, dotin and dotout should be at indexes(k0-k1) with different parities */

    let kcon = 0; // index of subset of 'connectables' which contains dotin et dotout
    let k0, k1;
    for (let kcon = 0; kcon < this.connectables.length; ++kcon) {
      k0 = this.connectables[kcon].indexOf(dotin);
      if (k0 == -1) continue;
      if (concentric && rndStruct.intAlea(internRegularity) != 0) {
        // generate more or less concentric loops
        if (direct) {
          k1 = (k0 + 1) % this.connectables[kcon].length; //
        } else {
          k1 =
            (k0 + this.connectables[kcon].length - 1) %
            this.connectables[kcon].length; // turning the opposite way
        }
      } else {
        // not concentric loops
        /* pick up a random point in same connectable set - with different parity */
        k1 =
          rndStruct.intAlea(this.connectables[kcon].length / 2) * 2 +
          ((k0 & 1) ^ 1);
      }
      const dotout = this.connectables[kcon][k1];
      if (k1 < k0) [k0, k1] = [k1, k0];
      // put apart points associated with kin and kout
      let narr = this.connectables[kcon].splice(k0, k1 + 1 - k0);
      // remove kin and kout from 'connectables' since they now are used
      narr.shift();
      narr.pop();
      if (narr.length > 0) this.connectables.push(narr); // the rest becomes a new 'connectable' subset
      if (this.connectables[kcon].length == 0)
        this.connectables.splice(kcon, 1); // remove subset if empty
      return dotout; // that's all folks
    } // for kcon
  } // Cell.pickNextDot
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  nextcw(dot) {
    /* returns next dot close to this one
          suitable to start a new loop from
          (returns false if point is not suitable)
          */
    let k = this.actives.indexOf(dot);
    let ndot = this.actives[(k + 1) % this.actives.length];
    if (ndot.loop) return false;
    return ndot;
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  nextccw(dot) {
    /* returns next dot close to this one
          suitable to start a new loop from
          (returns false if point is not suitable)
          */
    let k = this.actives.indexOf(dot);
    let ndot = this.actives[
      (k + this.actives.length - 1) % this.actives.length
    ];
    if (ndot.loop) return false;
    return ndot;
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  toBezier(p0, p1) {
    /* calculates Bezier curve from p0 to p1 */
    const ztd = 0.5; // coefficient for straight lines
    const zdt = 0.2; // coefficient for U-turn

    let pa, pb; // control points of the Bézier curve
    let dx, dy, dd, din, dout;
    let kCommVert;

    let bin = p0.kedge;
    let bout = p1.kedge;
    switch (
      mabs(bout - bin) // turning angle
    ) {
      case 0: // U-turn
        dx = p1.x - p0.x;
        dy = p1.y - p0.y;
        dd = zdt * radius;

        pa = {
          x: p0.x + Cell.xperp[bin] * dd,
          y: p0.y + Cell.yperp[bin] * dd
        };
        pb = {
          x: p1.x + Cell.xperp[bout] * dd,
          y: p1.y + Cell.yperp[bout] * dd
        };
        break;
      case 1:
      case 5:
        /* 120 degrees : curve around a vertex
  compute distances from p0 and p1 to that vertex and use these distances
  to compute position of intermediate Bezier control points pa and pb
  */
        if (bout - bin == -1 || bout - bin == 5) {
          kCommVert = bin;
        } else {
          kCommVert = bout;
        }

        din = distance(this.vertices[kCommVert], p0);
        dout = distance(this.vertices[kCommVert], p1);

        dd = 0.75;

        pa = {
          x: p0.x + Cell.xperp[bin] * dd * dout,
          y: p0.y + Cell.yperp[bin] * dd * dout
        };
        pb = {
          x: p1.x + Cell.xperp[bout] * dd * din,
          y: p1.y + Cell.yperp[bout] * dd * din
        };

        break;

      case 2:
      case 4: // 60 degrees
        dd = 0.6 * radius; // probably not the smartest way
        pa = {
          x: p0.x + Cell.xperp[bin] * dd,
          y: p0.y + Cell.yperp[bin] * dd
        };
        pb = {
          x: p1.x + Cell.xperp[bout] * dd,
          y: p1.y + Cell.yperp[bout] * dd
        };
        break;
      case 3: // straightforward
        dd = ztd * radius; // probably not the smartest way
        pa = {
          x: p0.x + Cell.xperp[bin] * dd,
          y: p0.y + Cell.yperp[bin] * dd
        };
        pb = {
          x: p1.x + Cell.xperp[bout] * dd,
          y: p1.y + Cell.yperp[bout] * dd
        };

        break;
    } // switch (turning angle)

    return [p0, pa, pb, p1];
  } // toBezier

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  size() {
    // sets actual vertices coordinates
    this.xc = offsx + this.kx * 1.5 * radius;
    this.yc =
      offsy + this.ky * radius * msqrt(3) + 0.5 * this.odd * radius * msqrt(3);
    this.vertices = [];
    for (let k = 0; k < 6; ++k) {
      this.vertices[k] = {
        x: this.xc + Cell.xs[k] * radius,
        y: this.yc + Cell.ys[k] * radius
      };
    } // for k

    for (let kedge = 0; kedge < 6; ++kedge) {
      if (!this.ndots[kedge]) continue;
      let p0 = this.vertices[kedge];
      let p1 = this.vertices[(kedge + 1) % 6];
      let matdots = [[1 / 2], [3 / 8, 5 / 8], [9 / 32, 1 / 2, 23 / 32]][
        this.ndots[kedge] - 1
      ];
      for (let kdot = 0; kdot < this.ndots[kedge]; ++kdot) {
        Object.assign(this.dots[kedge][kdot], lerp(p0, p1, matdots[kdot]));
      }
    } // for kedge
  } // size

  draw(ctx) {
    // with current strokeStyle and lineWidth and fillStyle
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let k = 1; k < 6; ++k) {
      ctx.lineTo(this.vertices[k].x, this.vertices[k].y);
    } // for k
    ctx.closePath();
    ctx.stroke();
    // draw dots
    for (let k = 0; k < 6; ++k) {
      if (!this.dots[k]) continue;
      this.dots[k].forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, mmax(3, radius / 25), 0, m2PI);
        ctx.fill();
      });
    }
  } // draw
} // class Cell

//------------------------------------------------------------------------
class Dot {
  constructor(cell, kedge, index) {
    /* kedge = index of edge where the dot is (0=top, turning clockwise)
         index = index of dot on edge */
    this.cell = cell;
    this.kedge = kedge;
    this.index = index;
    // this.other will come later
  } // constructor
} // class Dot

//------------------------------------------------------------------------
class Loop {
  constructor() {
    this.pairs = [];
  }

  build(dot) {
    this.start = dot;
    while (true) {
      if (!this.extend(true)) break; // extend at the end until blocked
      if (this.pairs[0][0].other == this.pairs.at(-1)[1]) {
        // or closed loop !
        this.closed = true;
        break;
      }
    }
    if (!this.closed)
      do;
      while (this.extend(false)); // if not closed extend at the beginning
    /* mark involved dots as belonging to this path */
    this.pairs.forEach((p) => {
      p[0].loop = p[1].loop = this;
    });
  }

  extend(direct) {
    /* appends a new piece at the end of loop (if direct == true)
        or at the beginning (if direct == false)
         returns true if actually extended, false if impossible to extend
        */
    let dot0, dot1;
    if (this.pairs.length == 0) dot0 = this.start;
    else if (direct) dot0 = this.pairs.at(-1)[1].other;
    else dot0 = this.pairs[0][0].other;
    if (!dot0) return false; // can't go that way
    if (dot0.closed) return false;
    dot1 = dot0.cell.pickNextDot(dot0, direct);
    if (direct) this.pairs.push([dot0, dot1]);
    else this.pairs.unshift([dot1, dot0]);
    return true;
  } // extend

  toBezier() {
    // turns the pairs found by "build" into array of arrays of 4 points to draw bezier curve
    this.bezier = [];
    this.pairs.forEach((pair) => {
      this.bezier.push(pair[0].cell.toBezier(pair[0], pair[1]));
    });
    delete this.pairs; // don't need it any more
    /* estimates the length of every segement in bezier for animation.
        No accuracy needed, so every cubic is splitted into 4 parts and every part estimated as a straight line */
    this.lengths = this.bezier.map((cubic) => {
      const dec0 = splitC(cubic, 0.5);
      const dec1 = splitC(dec0[0], 0.5);
      const dec2 = splitC(dec0[1], 0.5);
      return (
        distance(dec1[0][0], dec1[0][3]) +
        distance(dec1[1][0], dec1[1][3]) +
        distance(dec2[0][0], dec2[0][3]) +
        distance(dec2[1][0], dec2[1][3])
      );
    });

    // calculate total length

    return this.bezier;
  }

  createPath() {
    /* creates a canvas path from this.bezier - segments of path will be added later when time comes */
    this.path = new Path2D();
    this.path.moveTo(this.bezier[0][0].x, this.bezier[0][0].y);
    this.color = `hsl(${rndCol.intAlea(360)} 100% 60%)`;
    this.nextToDraw = 0;
    this.pathLength = 0; // nothing drawn yet
    this.prevTime = performance.now();
    this.pos = 0;
  }

  drawPath(time) {
    let alpha, frag, nPath, pos, idx;

    let dt = time - this.prevTime;
    this.prevTime = time;

    if (this.nextToDraw < this.bezier.length) {
      this.pos += dt * drawSpeed; // potition me must draw up to

      while (
        this.nextToDraw < this.bezier.length &&
        this.pos >= this.pathLength + this.lengths[this.nextToDraw]
      ) {
        idx = this.nextToDraw;
        this.path.bezierCurveTo(
          this.bezier[idx][1].x,
          this.bezier[idx][1].y,
          this.bezier[idx][2].x,
          this.bezier[idx][2].y,
          this.bezier[idx][3].x,
          this.bezier[idx][3].y
        );
        this.pathLength += this.lengths[this.nextToDraw];
        ++this.nextToDraw;
      }
    }
    nPath = new Path2D(this.path);
    if (this.nextToDraw < this.bezier.length) {
      // append nPath a fragment of current cubic
      alpha = (this.pos - this.pathLength) / this.lengths[this.nextToDraw];
      frag = splitC(this.bezier[this.nextToDraw], alpha)[0];
      nPath.bezierCurveTo(
        frag[1].x,
        frag[1].y,
        frag[2].x,
        frag[2].y,
        frag[3].x,
        frag[3].y
      );
    }
    ctx.lineWidth = radius / 30;
    ctx.strokeStyle = this.color;
    ctx.stroke(nPath);
    if (this.nextToDraw >= this.bezier.length) return false; // all done;
    return true;
  } // drawPath
} // class Loop

//------------------------------------------------------------------------

function createGrid() {
  let nbCells;
  if (uiv.cellsizerandom) {
    nbCells = rndGen.alea(MIN_NB_CELLS, MAX_NB_CELLS);
  } else {
    nbCells =
      msqrt(uiv.cellsize) * MIN_NB_CELLS +
      (1 - msqrt(uiv.cellsize)) * MAX_NB_CELLS;
  }
  radius = msqrt((((maxx * maxy) / nbCells) * 2) / 3 / msqrt(3));

  for (let nbTries = 0; nbTries < 100; ++nbTries) {
    if (withMargin) {
      nbx = mfloor(((maxx - 20) / radius + 0.5) / 1.5);
      nby = mfloor((maxy - 20) / radius / msqrt(3) - 0.5) + 1;
    } else {
      nbx = mceil((maxx / radius - 0.5) / 1.5) + 1;
      nby = mceil(maxy / radius / msqrt(3) + 0.5);
    }
    if (nbx > 1 && nby > 1) break; // found good values
    radius *= 0.95; // cheat with radius to revoid failure with very long (or narrow) canvases
  } // for nbTries
  if (nbx <= 1 || nby <= 1) return false; // can't find good values!

  offsx = (maxx - radius * (0.5 + 1.5 * nbx)) / 2 + radius; // center of leftmost cell
  offsy =
    (maxy - radius * msqrt(3) * (0.5 + nby)) / 2 + (radius * msqrt(3)) / 2; // center of topmost cell

  grid = new Array(nby)
    .fill(0)
    .map((v, ky) => new Array(nbx).fill(0).map((v, kx) => new Cell(kx, ky)));

  grid.forEach((line) => line.forEach((cell) => cell.setNeighbors()));

  // set dots on edges
  let tbNbPoints = []; // number of points to choose from for this geometryChoice
  if (uiv.randompattern) {
    geometryChoice = rndGen.intAlea(tbRelProbaNbPoints.length);
    ui.geometry.value = geometryChoice;
  } else geometryChoice = uiv.geometry;
  tbRelProbaNbPoints[geometryChoice].forEach((frq, nb) => {
    for (let k = 0; k < frq; ++k) tbNbPoints.push(nb);
  }); // tbRelProbaNbPoints.forEach

  // define number of dots on every edge of cell
  grid.forEach((line) =>
    line.forEach((cell) => {
      cell.ndots = cell.ndots || [];
      for (let dir = 0; dir < 6; ++dir) {
        if (cell.ndots[dir]) continue; // dots already set
        let other = cell.neighbors[dir];
        if (!other) continue; // no neighbor on this edge, no dot
        other.ndots = other.ndots || [];
        let otherDir = (dir + 3) % 6;
        let nbdots = (cell.ndots[dir] = other.ndots[otherDir] =
          tbNbPoints[rndStruct.intAlea(tbNbPoints.length)]);

        /* actual dots are will be created later, aftur reduction of number of cells with odd number of dots */
      } // for dir
    })
  );

  let odds = [];
  grid.forEach((line) =>
    line.forEach((cell) => {
      let nb = cell.ndots.reduce((s, v) => s + v);
      if (nb & 1) odds.push(cell);
    })
  );

  // actually create dots
  grid.forEach((line) =>
    line.forEach((cell) => {
      for (let dir = 0; dir < 6; ++dir) {
        let nbdots = cell.ndots[dir];
        if (!nbdots) continue; // no dots, nothing to do
        let other = cell.neighbors[dir]; // always exists since there are dots
        let otherDir = (dir + 3) % 6;

        /* actual dots are created - both for this cell the the other */
        cell.dots = cell.dots || [];
        if (cell.dots[dir]) continue; // this edge already processed
        cell.dots[dir] = [];
        other.dots = other.dots || [];
        other.dots[otherDir] = [];
        for (let kdot = 0; kdot < nbdots; ++kdot) {
          cell.dots[dir][kdot] = new Dot(cell, dir, kdot);
          cell.dots[dir][kdot].other = other.dots[otherDir][
            nbdots - 1 - kdot
          ] = new Dot(other, otherDir, nbdots - 1 - kdot);
          other.dots[otherDir][nbdots - 1 - kdot].other = cell.dots[dir][kdot];
        } // for kdot
      } // for dir
    })
  );

  grid.forEach((line) => line.forEach((cell) => cell.flattenDots()));

  /*  now "close" 1 dot in every cell with an odd number of dots
       with contrainst : dot.other must NOT be closed too
      */
  if (odds.length && !closeOne(0)) throw "unbelievable !!! ";

  // actual vertices and dots coordinates
  grid.forEach((line) => line.forEach((cell) => cell.size()));

  grid.forEach((line) => line.forEach((cell) => cell.makeConnectables()));

  return createLoops();

  function closeOne(kodds) {
    const cell = odds[kodds];
    const dotsOrder = cell.flatDots.slice();
    while (dotsOrder.length) {
      let dot = dotsOrder.splice(rndStruct.intAlea(dotsOrder.length), 1)[0]; // one dot at random, and remove it from dotsOrder
      if (!dot.other || !dot.other.closed) {
        // try this dot
        dot.closed = true;
        if (kodds == odds.length - 1) return true; // all done
        if (closeOne(kodds + 1)) return true; // if success, return from recursion
        delete dot.closed; // this dot not suitable, try another (if any)
      }
    }
    return false; // no suitable dot at this level, try next at calling reursion level
  } // closeOne
} // createGrid

function createLoops() {
  let loops = [];
  let cell;
  // choosing starting point and creating 1st loop
  if (uncentered) {
    cell = grid[rndStruct.intAlea(nby)][rndStruct.intAlea(nbx)]; // anywhere
  } else {
    cell = grid[mfloor((nby - 1) / 2)][mfloor((nbx - 1) / 2)]; // centered
  }
  while (cell.connectables[0].length == 0) {
    // bad luck !!! let us try again
    cell = grid[rndStruct.intAlea(nby)][rndStruct.intAlea(nbx)]; // anywhere
  }

  let loop = new Loop();
  loop.build(cell.connectables[0][mfloor(cell.connectables[0].length / 2)]);
  loops.push(loop);
  loop.toBezier();

  let kLoop = 0; // index to search loops
  while (kLoop < loops.length) {
    let sl = loops[kLoop];
    /* search dot in loop with free neighbor to start new loop from*/
    let foundDot;
    for (let k = 0; k < sl.bezier.length; ++k) {
      let dot0 = sl.bezier[k][0];
      let dot1 = sl.bezier[k][3];
      if ((foundDot = dot0.cell.nextcw(dot0))) break;
      if ((foundDot = dot1.cell.nextccw(dot1))) break;
      if ((foundDot = dot0.cell.nextccw(dot0))) break;
      if ((foundDot = dot1.cell.nextcw(dot1))) break;
    }
    if (!foundDot) ++kLoop;
    // nothing more to be found on this loop
    else {
      let loop = new Loop();
      loop.build(foundDot);
      loops.push(loop);
      loop.toBezier();
    }
  } // while kLoop
  // last loops for the sake of completeness, though it is useless most times
  grid.forEach((line) =>
    line.forEach((cell) =>
      cell.actives.forEach((dot) => {
        if (!dot.loop) {
          let loop = new Loop();
          loop.build(dot);
          loops.push(loop);
          loop.toBezier();
        }
      })
    )
  );

  return loops;
} // createLoops

function drawGrid() {
  let ctx = canvGrid.getContext("2d");
  ctx.strokeStyle = ctx.fillStyle = "#8ff";
  ctx.clearRect(0, 0, maxx, maxy);
  ctx.lineWidth = 0.5;
  grid.forEach((line) => line.forEach((cell) => cell.draw(ctx)));
} // drawGrid
//------------------------------------------------------------------------

let animate;
{
  // scope for animate

  let animState = 0;

  animate = function (tStamp) {
    let message;

    message = messages.shift();
    if (message && message.message == "reset") animState = 0;
    if (message && message.message == "click") animState = 0;
    window.requestAnimationFrame(animate);

    switch (animState) {
      case 0: // create
        if (startOver()) ++animState;

        break;

      case 1: // draw
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, maxx, maxy);
        let alive = false;
        loops.forEach((loop) => (alive |= loop.drawPath(tStamp)));
        if (!alive) {
          ++animState;
        }
        break;

      case 2: // just wait...
        break;
    } // switch
  }; // animate
} // scope for animate

//------------------------------------------------------------------------
//------------------------------------------------------------------------

function startOver() {
  readUI();

  if (uiv.autodimension) {
    maxx = window.innerWidth;
    maxy = window.innerHeight;
  } else {
    maxx = uiv.twidth;
    maxy = uiv.theight;
  }
  canv.width = canvGrid.width = maxx;
  canv.height = canvGrid.height = maxy;

  let translatex = "0px";
  let translatey = "0px";
  if (canv.width < window.innerWidth) {
    translatex = "-50%";
    canv.style.left = "50%";
  } else {
    canv.style.left = "0px";
  }
  if (canv.height < window.innerHeight) {
    translatey = "-50%";
    canv.style.top = "50%";
  } else {
    canv.style.top = "0px";
  }
  canv.style.transform = `translate(${translatex}, ${translatey})`;
  ["width", "height", "top", "left", "transform"].forEach(
    (prop) => (canvGrid.style[prop] = canv.style[prop])
  );

  withMargin = uiv.withmargin;
  concentric = uiv.concentric;
  uncentered = !uiv.centered;
  internRegularity =
    uiv.regularity <= 5 ? uiv.regularity : 5 + (95 / 5) * (uiv.regularity - 5);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, maxx, maxy);

  rndStruct = Mash();
  rndCol = Mash();
  rndGen = Mash();

  if (!(loops = createGrid())) return false;
  drawGrid();

  loops.forEach((loop) => {
    loop.createPath();
  });

  return true;
} // startOver

//------------------------------------------------------------------------

function mouseClick(event) {
  messages.push({ message: "click" });
} // mouseClick

//------------------------------------------------------------------------
//------------------------------------------------------------------------
// beginning of execution

{
  canv = document.createElement("canvas");
  canv.style.position = "absolute";
  document.body.appendChild(canv);
  ctx = canv.getContext("2d");
  canv.setAttribute("title", "click me");
} // création CANVAS
{
  canvGrid = document.createElement("canvas");
  canvGrid.style.position = "absolute";
  document.body.appendChild(canvGrid);
  canvGrid.setAttribute("title", "click me");
} // création CANVAS

messages = [{ message: "reset" }];

prepareUI();
toggleMenu.call(document.querySelector("#controls"));
messages = [{ message: "reset" }]; // remove messages inserted during
canv.addEventListener("click", mouseClick);
canvGrid.addEventListener("click", mouseClick);
requestAnimationFrame(animate);
