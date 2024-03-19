gsap.to("div", {
  rotateY: 180,
  ease: "power3.out",
  duration: 1,
  stagger: {
    each: 0.02,
    repeat: -1,
    yoyo: true
  }
});
