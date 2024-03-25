function toastMe(properties) {
	const defaultProperties = {
		element: document.querySelector('.toasterHolder'),
		toastTime: 2000,
		toastColor: null,
		crustColor: null,
		messageTime: 4000,
		messageWidth: '300%',
		message: 'mmmmm... nice toasty message 😋'
	};
	const t = Object.assign(defaultProperties, properties);
	const randInt = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	let burnHue = randInt(-40, 10);
	let toastColor = !t.toastColor ? `rgb(${210 + burnHue}, ${180 + burnHue}, ${140 + burnHue})` : t.toastColor;
	let crustColor = !t.crustColor ? `rgb(${210 + burnHue - 50}, ${180 + burnHue - 50}, ${140 + burnHue - 50})` : t.crustColor;
	let elt = t.element;
	let toasterMessageHolder = document.createElement('div');
	toasterMessageHolder.style.height = '100px';
	toasterMessageHolder.style.width = '100px';
	toasterMessageHolder.style.position = 'relative';
	toasterMessageHolder.style.transition = '200ms';
	toasterMessageHolder.style.transitionProperty = 'height';
	// create message div
	let div = document.createElement('div');
	div.classList.add('toastMessage');
	div.innerText = t.message;
	div.style.background = toastColor;
	div.style.top = '0%';
	div.style.left = '100%';
	div.style.height = '100%';
	div.style.width = '300%';
	div.style.position = 'absolute';
	div.style.borderTop = `8px solid ${crustColor}`;
	div.style.borderLeft = `8px solid ${crustColor}`;
	div.style.overflow = 'auto';
	div.style.borderRadius = '20px 0 0 0';
	div.style.transition = 'left 100ms ease';
	div.style.padding = '10px';
	div.style.zIndex = 2;
	
	let toastSVGIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	toastSVGIcon.setAttribute('viewBox', '0 0 20 20');
	toastSVGIcon.style.height = '24px';
	toastSVGIcon.style.width = '24px';
	toastSVGIcon.style.position = 'absolute';
	toastSVGIcon.style.bottom = '28px';
	toastSVGIcon.style.right = '28px';
	
	let toastSVGIconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
	toastSVGIconPath.setAttribute('d', 'M 16 15 Q 16 9 15 7 C 16 6 16 4 13 4 L 7 4 C 4 4 4 6 5 7 Q 4 9 4 15 C 4 17 16 17 16 15 Z');
	toastSVGIconPath.setAttribute('stroke', 'rgba(255,255,255,0.2)');
	toastSVGIconPath.setAttribute('stroke-width', '2');
	toastSVGIconPath.setAttribute('stroke-dasharray', '45.0792');
	toastSVGIconPath.setAttribute('fill', 'none');
	
	let toastSVGIconAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
	toastSVGIconAnim.setAttribute('attributeName', 'stroke-dashoffset');
	toastSVGIconAnim.setAttribute('values', '0; 45.0792');
	toastSVGIconAnim.setAttribute('begin', '0s');
	toastSVGIconAnim.setAttribute('dur', `${t.messageTime}ms`);
	toastSVGIconAnim.setAttribute("repeatCount", "none");
	toastSVGIconAnim.setAttribute("fill", "freeze");
	toastSVGIconAnim.addEventListener("endEvent", ()=> {
		toasterMessageHolder.style.height = '0px';
		setTimeout(()=> {
			toasterMessageHolder?.remove();
		}, 200);
	});
	toastSVGIconPath.appendChild(toastSVGIconAnim);
	toastSVGIcon.appendChild(toastSVGIconPath);
	toasterMessageHolder.appendChild(div);
	// create svg
	let toastSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	toastSVG.setAttribute('viewBox', '0 0 40 40');
	toastSVG.style.height = '100%';
	toastSVG.style.height = '100%';
	toastSVG.style.positino = 'relative';
	let toaster = document.createElementNS("http://www.w3.org/2000/svg", "path");
	let toasterAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
	toaster.classList.add('toaster');
	toaster.setAttribute('fill', 'silver');
	toaster.setAttribute('stroke', '#000');
	toaster.setAttribute('stroke-linecap', 'round');
	toaster.setAttribute('d', 'M 4 44 V 40 C 4 38 5 38 8 37 Q 20 34 32 37 C 35 38 36 38 36 40 V 44 Z M 11 38 Q 20 37 29 38 M 11 40 Q 20 39 29 40');
	toasterAnim.id = "toasterUp";
	toasterAnim.setAttribute('attributeName', 'transform');
	toasterAnim.setAttribute('type', 'translate');
	toasterAnim.setAttribute('values', '0 10; 0 0');
	toasterAnim.setAttribute('dur', `${t.toastTime / 5}ms`);
	toasterAnim.setAttribute('begin', '0s');
	toasterAnim.setAttribute('repeatCount', 'none');
	toaster.appendChild(toasterAnim);
	toastSVG.appendChild(toaster);
	const toastGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
	toastGroup.setAttribute("stroke", "#bb7b3e");
	
	toastGroup.setAttribute("fill", toastColor);
	let toastId = `t${randInt(0,1000)}o${randInt(0,1000)}a${randInt(0,1000)}s${randInt(0,1000)}t`;
	// Create toast path
	const toastPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
	toastPath.setAttribute("id", toastId);
	toastPath.setAttribute("d", "M 14 25 Q 14 19 15 17 C 14 16 14 14 17 14 L 23 14 C 26 14 26 16 25 17 Q 26 19 26 25 C 26 27 14 27 14 25z");
	toastPath.setAttribute("stroke-linejoin", "round");
	toastPath.setAttribute("stroke-linecap", "round");
	const toastBG = document.createElementNS("http://www.w3.org/2000/svg", "use");
	toastBG.setAttribute('href', `#${toastId}`);
	toastBG.setAttribute('transform', 'translate(0.7 0.7)');
	toastBG.setAttribute('fill', crustColor);
	toastBG.setAttribute('stroke', crustColor);
	toastGroup.appendChild(toastBG);
	toastGroup.appendChild(toastPath);
	// Create animateTransforms for toast
	const upAnimateTransform = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
	upAnimateTransform.setAttribute("attributeName", "transform");
	upAnimateTransform.setAttribute("type", "translate");
	upAnimateTransform.setAttribute("values", "0 40; 0 0");
	upAnimateTransform.setAttribute("dur", `${t.toastTime / 3}ms`);
	upAnimateTransform.setAttribute("begin", "0s");
	upAnimateTransform.setAttribute("repeatCount", "none");
	upAnimateTransform.setAttribute("keyTimes", "0;1");
	upAnimateTransform.setAttribute("keySplines", "0.95 0.01 0.76 0.99");
	upAnimateTransform.setAttribute("calcMode", "spline");
	upAnimateTransform.setAttribute("fill", "freeze");
	toastGroup.appendChild(upAnimateTransform);
	const rotateAnimateTransform = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
	rotateAnimateTransform.setAttribute("attributeName", "transform");
	rotateAnimateTransform.setAttribute("type", "rotate");
	rotateAnimateTransform.setAttribute("values", `0 20 20; ${(Math.random() > 0.5 ? 360 : -360) * randInt(1,2)} 20 20`);
	rotateAnimateTransform.setAttribute("dur", `${t.toastTime / 3}ms`);
	rotateAnimateTransform.setAttribute("begin", `${t.toastTime / 5}ms`);
	rotateAnimateTransform.setAttribute("repeatCount", "none");
	rotateAnimateTransform.setAttribute("keyTimes", "0;1");
	rotateAnimateTransform.setAttribute("keySplines", "0.8 0.22 0.14 0.7");
	rotateAnimateTransform.setAttribute("calcMode", "spline");
	rotateAnimateTransform.setAttribute("fill", "freeze");
	rotateAnimateTransform.setAttribute("additive", "sum");
	toastGroup.appendChild(rotateAnimateTransform);
	const scaleAnimateTransform = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
	scaleAnimateTransform.setAttribute("attributeName", "transform");
	scaleAnimateTransform.setAttribute("type", "scale");
	scaleAnimateTransform.setAttribute("values", "1 1; 10 10");
	scaleAnimateTransform.setAttribute("dur", "1s");
	scaleAnimateTransform.setAttribute("begin", `${t.toastTime / 2.25}ms`);
	scaleAnimateTransform.setAttribute("repeatCount", "none");
	scaleAnimateTransform.setAttribute("keyTimes", "0;1");
	scaleAnimateTransform.setAttribute("keySplines", "1 0 0 1");
	scaleAnimateTransform.setAttribute("calcMode", "spline");
	scaleAnimateTransform.setAttribute("fill", "freeze");
	scaleAnimateTransform.setAttribute("additive", "sum");
	toastGroup.appendChild(scaleAnimateTransform);
	const messageTriggerAnimate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
	messageTriggerAnimate.setAttribute("attributeName", "x");
	messageTriggerAnimate.setAttribute("values", "0;0");
	messageTriggerAnimate.setAttribute("begin", `${t.toastTime / 2}ms`);
	messageTriggerAnimate.setAttribute("dur", `${t.toastTime / 5}ms`);
	messageTriggerAnimate.setAttribute("repeatCount", "none");
	messageTriggerAnimate.addEventListener("endEvent", ()=> {
		div.appendChild(toastSVGIcon);
		div.style.left = '-200%';
	});
	toastPath.appendChild(messageTriggerAnimate);
	toastGroup.appendChild(toastPath);
	toastSVG.appendChild(toastGroup);
	toasterMessageHolder.appendChild(toastSVG);
	
	elt.prepend(toasterMessageHolder);
}

toastMe();

document.querySelector('.newMsg').addEventListener('click', ()=> {
	const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
	let randomMsgs = [
    "Feelin' toasty!",
    "Stay toasty!",
    "Toastiness achieved!",
    "Feelin' warm and toasty!",
    "Toasty vibes all around!",
    "Keepin' it toasty!",
    "Embrace the toasty warmth!",
    "Let's get toasty!",
    "Toastiness level: maximum!"
];
	toastMe({message: randomMsgs[randInt(0,randomMsgs.length-1)]});
})
