// Initialize audio context and nodes globally
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;
let gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

function playBeep(pitch, duration) {
	// Create oscillator if not already created
	if (!oscillator) {
		oscillator = audioContext.createOscillator();
		oscillator.connect(gainNode);
	} else {
		// If oscillator is already started, return
		if (oscillator.state !== "stopped") {
			return;
		}
	}

	// Set pitch (in Hz)
	oscillator.frequency.value = pitch;

	// Start oscillator
	oscillator.start();

	// Set volume to full
	gainNode.gain.setValueAtTime(1, audioContext.currentTime);

	// Fade out
	gainNode.gain.exponentialRampToValueAtTime(
		0.001,
		audioContext.currentTime + duration / 1000
	);

	// Stop oscillator after duration
	setTimeout(function () {
		if (oscillator && oscillator.state !== "closed") {
			oscillator.stop();
			oscillator = null; // Reset oscillator
		}
	}, duration);
}

let int2, int3, int4, int5;

let bloops = false;
let soundOn = false;

function addBloops() {
	if (!bloops) {
		if (document.querySelector(".line").classList.contains("active")) {
			int2 = setInterval(() => {
				playBeep(220, 30);
			}, sliderValue / 2);
		}
		if (document.querySelector(".tri").classList.contains("active")) {
			int3 = setInterval(() => {
				playBeep(330, 30);
			}, sliderValue / 3);
		}
		if (document.querySelector(".square").classList.contains("active")) {
			int4 = setInterval(() => {
				playBeep(440, 30);
			}, sliderValue / 4);
		}
		if (document.querySelector(".pent").classList.contains("active")) {
			int5 = setInterval(() => {
				playBeep(220, 30);
			}, sliderValue / 5);
		}
		bloops = true;
	}
}
function clearSounds() {
	clearInterval(int2);
	clearInterval(int3);
	clearInterval(int4);
	clearInterval(int5);
}

function addSound(muted = false) {
	if (soundOn || muted) {
		document.querySelector("#a2").removeEventListener("repeatEvent", addBloops);
		document.querySelector("#an2").beginElement();
		document.querySelector("#aan2").beginElement();
		clearSounds();
		soundOn = false;
		bloops = false;
	} else {
		document.querySelector("#a2").addEventListener("repeatEvent", addBloops);
		document.querySelector("#an1").beginElement();
		document.querySelector("#aan1").beginElement();
		soundOn = true;
	}
}

// Get all buttons
const buttons = document.querySelectorAll(".shapeSelections button");

// Loop through each button and add click event listener
buttons.forEach((button) => {
	button.addEventListener("click", () => {
		// Toggle active class for the clicked button
		button.classList.toggle("active");
		clearSounds();
		addSound(true);

		if (button.classList.contains("pent")) {
			document.querySelector("#p5").classList.toggle("gonezo");
			document.querySelector("#c5").classList.toggle("gonezo");
		} else if (button.classList.contains("square")) {
			document.querySelector("#p4").classList.toggle("gonezo");
			document.querySelector("#c4").classList.toggle("gonezo");
		} else if (button.classList.contains("tri")) {
			document.querySelector("#p3").classList.toggle("gonezo");
			document.querySelector("#c3").classList.toggle("gonezo");
		} else if (button.classList.contains("line")) {
			document.querySelector("#p2").classList.toggle("gonezo");
			document.querySelector("#c2").classList.toggle("gonezo");
		}
	});
});

let sliderValue = 2000;
// Get the slider element
const slider = document.querySelector(".slider");
// Get the span element for displaying slider value
const sliderValueSpan = document.querySelector(".slider-value");
// Get all SVG elements with the "move" class
const moveElements = document.querySelectorAll(".move");


// Add an input event listener to the slider
slider.addEventListener("input", function () {
	// Get the slider value
	sliderValue = this.value;
	addSound(true);
	// Update the span element to display the current slider value
	sliderValueSpan.textContent = sliderValue;
	// Update the animation duration for each SVG element with the "move" class
	moveElements.forEach((element) => {
		// Update the animation duration based on the slider value
		element.setAttribute("dur", sliderValue + "ms");
	});
});
