const { Anchor, Box, TAU } = Zdog;

const sineOut = (t) => Math.sin((t * Math.PI) / 2);

(() => {
	const element = document.querySelector("canvas");
	const context = element.getContext("2d");
	const { width, height } = element;
	const zoom = 8;

	const columns = 7;
	const rows = 7;

	const jumps = [1, 1, 1, -1, -1, -1, 2, -2];
	const lift = 3;
	const size = 5;
	const gap = 6;
	const innerSize = size / 2.5;

	const root = new Anchor();

	const colors = {
		boxes: {
			color: "hsl(209 34% 30%)",
			leftFace: "hsl(209 61% 16%)",
			frontFace: "hsl(211 39% 23%)"
		},
		box: {
			color: "hsl(202 83% 41%)",
			x: "hsl(199 84% 55%)",
			y: "hsl(196 94% 67%)"
		}
	};

	const { color, leftFace, frontFace } = colors.boxes;

	const boxes = new Anchor({
		addTo: root
	});

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < columns; j++) {
			const x = j * gap;
			const z = i * gap * -1;

			new Box({
				addTo: boxes,
				color,
				leftFace,
				frontFace,
				stroke: 0,
				width: size,
				height: size,
				depth: size,
				translate: {
					x,
					z
				}
			});
		}
	}

	boxes.translate.y = size / 2 + innerSize / 2;

	const box = new Box({
		addTo: root,
		color: colors.box.color,
		rightFace: colors.box.x,
		leftFace: colors.box.x,
		topFace: colors.box.y,
		bottomFace: colors.box.y,
		stroke: 0,
		width: innerSize,
		height: innerSize,
		depth: innerSize
	});

	context.lineCap = "round";
	context.lineJoin = "round";

	const render = () => {
		context.clearRect(0, 0, width, height);
		context.save();
		context.translate(width / 2, height / 2);
		context.scale(zoom, zoom);
		root.renderGraphCanvas(context);
		context.restore();
	};

	let column = Math.floor(Math.random() * columns);
	let row = Math.floor(Math.random() * rows);
	let c = 0;
	let r = 0;

	if (Math.random() > 0.5) {
		c = column > columns / 2 ? -1 : 1;
	} else {
		r = row > rows / 2 ? -1 : 1;
	}

	box.translate.x = column * gap;
	box.translate.z = row * gap * -1;

	boxes.children[column + row * columns].color = box.bottomFace;

	root.rotate.x = (TAU / 12) * -1;
	root.rotate.y = (TAU / 8) * -1;
	root.translate.y = (Math.max(columns, rows) * gap) / 2 / 2;

	root.updateGraph();
	render();

	let ticker = 0;
	const cycle = 50;

	const animate = () => {
		ticker++;
		if (ticker >= cycle) {
			ticker = ticker % cycle;

			column += c;
			row += r;

			boxes.children[column + row * columns].color = box.bottomFace;

			if (Math.random() > 0.5) {
				const possibleJumps = jumps.filter((d) => {
					const c = d + column;
					return c >= 0 && c < columns;
				});

				c = possibleJumps[Math.floor(Math.random() * possibleJumps.length)];
				r = 0;
			} else {
				const possibleJumps = jumps.filter((d) => {
					const r = d + row;
					return r >= 0 && r < rows;
				});

				c = 0;
				r = possibleJumps[Math.floor(Math.random() * possibleJumps.length)];
			}
		}

		const progress = ticker / cycle;
		const loop = Math.sin(progress * Math.PI);
		const ease = sineOut(progress);

		box.translate.x = column * gap + progress * c * gap;
		box.translate.z = row * gap * -1 + progress * r * gap * -1;
		box.translate.y = loop * lift * -1;
		box.rotate.x = ease * TAU * r;
		box.rotate.z = ease * TAU * c;

		root.updateGraph();
		render();

		requestAnimationFrame(animate);
	};

	requestAnimationFrame(animate);
})();
