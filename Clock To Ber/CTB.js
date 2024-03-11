window.addEventListener("DOMContentLoaded",() => {
	const c = new Clock18(".clock");
});

class Clock18 {
	constructor(el) {
		this.el = document.querySelector(el);

		this.init();
	}
	init() {
		this.timeUpdate();
	}
	get datetimeAsObject() {
		const date = new Date();
		const Y = date.getFullYear();
		const M = date.getMonth() + 1;
		const D = date.getDate();
		const h = date.getHours();
		const m = date.getMinutes();
		const s = date.getSeconds();

		return {Y,M,D,h,m,s};
	}
	get datetimeAsString() {
		const [Mt,Mo,Dt,Do,Yth,Yh,Yt,Yo,ht,ho,mt,mo,st,so,ap,m] = this.datetimeDigits;
		const date = `${Mt}${Mo}/${Dt}${Do}/${Yth}${Yh}${Yt}${Yo}`;
		const time = `${ht}${ho}:${mt}${mo}:${st}${so} ${ap}${m}`;

		return `${date} ${time}`.trim();
	}
	get datetimeDigits() {
		let {Y,M,D,h,m,s} = this.datetimeAsObject;
		// year
		const YYYY = `${Y}`.split("");
		// month
		let MM = `${M}`.split("");
		if (M < 10) MM.unshift(" ");
		// day
		let DD = `${D}`.split("");
		if (D < 10) DD.unshift(" ");
		// meridiem
		const ap = h > 11 ? "P" : "A";
		if (h > 12) h -= 12;
		if (h === 0) h = 12;
		// hour
		let hh = `${h}`.split("");
		if (h < 10) hh.unshift(" ");
		// minute
		let mm = `${m}`.split("");
		if (m < 10) mm.unshift("0");
		// second
		let ss = `${s}`.split("");
		if (s < 10) ss.unshift("0");

		return [...MM,...DD,...YYYY,...hh,...mm,...ss,ap,"M"];
	}
	timeUpdate() {
		// update the `title`
		this.el?.setAttribute("title", this.datetimeAsString);
		// update the digits
		this.datetimeDigits.forEach((digit,i) => {
			const digitEl = this.el.querySelectorAll("[data-digit]")[i];
			if (!digitEl) return;

			digitEl.setAttribute("data-digit",digit);
		});
		// loop
		clearTimeout(this.timeUpdateLoop);
		this.timeUpdateLoop = setTimeout(this.timeUpdate.bind(this),1e3);
	}
}
