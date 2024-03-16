let sparkInterval;
function spark(e, opt_properties) {
	let mouseX, mouseY;
	let event = e;
	if (!e) {
		event = window.event;
	}
	if (event && (event.pageX || event.pageY)) {
		mouseX = event.pageX;
		mouseY = event.pageY;
	}
	else if (event && (event.clientX || event.clientY))    {
		mouseX = event.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		mouseY = event.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}
	const defaultProperties = {color: `random`, mouseX: mouseX, mouseY: mouseY, hw: 30, sparks: 8, sw: 8, time: 400};
	const randInt = (min, max) => {return Math.floor(Math.random() * (max - min + 1)) + min;}
  const c = Object.assign(defaultProperties, opt_properties);
	const col = c.color === 'random' ? `rgb(${randInt(0,255)}, ${randInt(0,255)}, ${randInt(0,255)})` : c.color;
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 100 100");
	svg.setAttribute("style", `width: 100%; height: 100%; position: absolute; height: ${c.hw}px; width: ${c.hw}px; transform: translate(-50%,-50%); left: ${c.mouseX}px; top: ${c.mouseY}px; z-index: 99999`);
	for (let i = 0; i < c.sparks; i++) {
		svg.insertAdjacentHTML('afterbegin', `<path d="M50 50 50 ${50 - c.sw/2}" stroke="${col}" stroke-linecap="round" stroke-width="${c.sw}" fill="none" transform="rotate(${((360 / c.sparks) * i) - (180 / c.sparks)} 50 50)"><animate attributeName="d" values="M50 50 50 ${50 - c.sw/2}; M50 ${50 - c.sw} 50 ${c.sw/2}; M50 ${c.sw/2} 50 ${c.sw/2}" dur="${c.time}ms" begin="0s" repeatCount="0" fill="freeze" /></path>`);
	}
	document.body.appendChild(svg);
	setTimeout(() => {svg?.remove();}, c.time);
}
document.addEventListener("click", (event) => {spark(event, {color: 'random', hw: 60}); clearInterval(sparkInterval);});
document.addEventListener("mousemove", (event) => {spark(event, {color: 'random'}); clearInterval(sparkInterval);});
document.addEventListener("touchmove", (event) => {const touch = event.touches[0]; // Get the first touch point
  const x = touch.clientX; // Get the x coordinate relative to the viewport
  const y = touch.clientY; // Get the y coordinate relative to the viewport
	spark({x, y}, {color: 'random'}); clearInterval(sparkInterval);});

function infiniteSparkle() {
	sparkInterval = setInterval(()=> {
		const boundingBox = document.getElementById('getMe').getBoundingClientRect();
		spark(undefined, {color: 'random', mouseX: boundingBox.left + window.scrollX, mouseY: boundingBox.top + window.scrollY});
	}, 50);
}
infiniteSparkle();
