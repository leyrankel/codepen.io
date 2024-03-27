const dropdownButton = document.querySelector(".notification__center > button");
const notificationsContainer = document.querySelector(
	".notifications__container"
);
const notifications = document.querySelectorAll(".notification__item");
const deleteButton = document.getElementsByClassName("delete");
const likeButton = document.getElementsByClassName("like");
const timeElement = document.querySelector(".time");

let i = 0;

for (i = 0; i < deleteButton.length; i++) {
	deleteButton[i].addEventListener("click", function () {
		this.parentElement.parentElement.style.animation = "slideout 1s forwards";
	});
}

for (i = 0; i < likeButton.length; i++) {
	likeButton[i].addEventListener("click", function () {
		this.style.animation = "none";
		this.textContent = "✔";
		this.style.color = "#60c91a";
	});
}

dropdownButton.addEventListener("click", function () {
	for (const notification of notifications) {
		notification.style.animation = "none";
	}

	for (const like of likeButton) {
		like.textContent = "❤︎";
		like.style.color = "#ed054e";
		like.style.animation = "heartbeat 1s infinite forwards";
	}

	if (dropdownButton.getAttribute("aria-expanded") === "true") {
		dropdownButton.setAttribute("aria-expanded", "false");
	} else {
		dropdownButton.setAttribute("aria-expanded", "true");
	}

	notificationsContainer.classList.toggle("hidden");
});

setCurrentTime();
setInterval(setCurrentTime, 60 * 1000);

function setCurrentTime() {
	const currentDate = new Date();
	let hours = currentDate.getHours() + "";
	if (hours.length <= 1) {
		hours = 0 + hours;
	}
	let minutes = currentDate.getMinutes() + "";
	if (minutes.length <= 1) {
		minutes = 0 + minutes;
	}

	timeElement.textContent = `${hours} : ${minutes}`;
}
