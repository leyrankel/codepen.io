//gsap.registerPlugin(GSDevTools);

const circles = select(".circles");
const circleFullScreen = select(".fullscreen");
const circleTop = select(".top");
const circleBottom = select(".bottom");

const circleInnerMedium = select(".inner.medium");
const circleInnerSmall = select(".inner.small");
const circleInnerClipPath = select(".inner.clip-path");

const circleFullScreenRect = getRect(circleFullScreen);
const circleTopRect = getRect(circleTop);
const circleBottomRect = getRect(circleBottom);
const circleInnerClipPathRect = getRect(circleInnerClipPath);

const circlesOverlap = 50;

const labels = {
  scene1: "scene1",
  scene2: "scene2"
};

const tl = gsap.timeline({
  id: "circles",
  scrollTrigger: {
    trigger: ".scrollTarget",
    start: "top top",
    end: "bottom 100%",
    scrub: 1,
    markers: { color: "white" }
  }
});

tl.addLabel(labels.scene1, 0);

tl.play();

tl.set(
  circleFullScreen,
  {
    scale: (window.innerWidth * 1.4) / circleFullScreenRect.width
  },
  labels.scene1
);

tl.set(
  [circleInnerMedium, circleInnerSmall],
  { scale: 0, opacity: 1 },
  labels.scene1
);

tl.addLabel(labels.scene1, 0);

tl.pause(labels.scene1);

tl.to(
  circleFullScreen,
  { scale: 1, duration: 0.5, delay: 0.25 },
  labels.scene1
);

tl.addLabel(labels.scene2, 0.7);

tl.set(
  circleFullScreen,
  {
    opacity: 0
  },
  labels.scene2
);

tl.to(
  circleTop,
  {
    y: (circleTopRect.height / 2 - circlesOverlap) * -1,
    duration: 1
  },
  labels.scene2
);

tl.to(
  circleInnerClipPath,
  {
    y: (circleInnerClipPathRect.height - circlesOverlap * 2) * -1,
    duration: 1
  },
  labels.scene2
);

tl.to(
  circleBottom,
  { y: circleTopRect.height / 2 - circlesOverlap, duration: 1 },
  labels.scene2
);

tl.to(circleInnerMedium, { scale: 1, duration: 1 }, `${labels.scene2}+=0.5`);

tl.to(circleInnerSmall, { scale: 1, duration: 1.2 }, `${labels.scene2}+=1`);

//GSDevTools.create({ animation: tl });
