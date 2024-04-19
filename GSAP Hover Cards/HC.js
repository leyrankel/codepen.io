gsap.set(".information", { yPercent: -100 });

gsap.utils.toArray(".container").forEach((container) => {
	let info = container.querySelector(".information"),
		pics = container.querySelector(".pics img"),
		tl = gsap.timeline({ paused: true });

	tl
		.to(info, { yPercent: 0, ease: "back.out" })
		.from(pics, { zIndex: "3" }, 0.25)
		.to(
			pics,
			{ duration: 0.4, y: -90, ease: "back.out(3)", opacity: 1, zIndex: "4" },
			0.45
		);

	container.addEventListener("mouseenter", () => tl.play());
	container.addEventListener("mouseleave", () => tl.reverse());
});
