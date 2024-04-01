const { useRef, useEffect, useState, } = React;
const GridLoader = ( props ) => {
	
  const blendEases = (startEase, endEase, blender) => {
	var parse = function(ease) {
					return typeof(ease) === "function" ? ease : gsap.parseEase("power4.inOut");
			},
			s = gsap.parseEase(startEase),
			e = gsap.parseEase(endEase),
			blender = parse(blender);
	return function(v) {
		var b = blender(v);
		return s(v) * (1 - b) + e(v) * b;
	};
}	
	let colorArray =["ff595e","ffca3a","8ac926","279af1","6a4c93"];
	colorArray = colorArray.map(x => Array.from(x)[0] == '#' ? x : `#${x}`);
	const gridTl = gsap.timeline({repeat: -1, defaults: {ease: blendEases('expo.in', 'back(0.93)')}}).timeScale(2);

  const getColor = (value) => {
    return colorArray[value % colorArray.length]
  }
	let mainSVG = useRef();
	let row0 = useRef();
	let row1 = useRef();
	let row2 = useRef();
	let row3 = useRef();
	let whole = useRef();
  const stagger = 0.16;
	useEffect(() => {
		
		let allCircles = gsap.utils.toArray('circle');
		allCircles.forEach((i, c) => {
			gsap.set(i, {
				fill: getColor(c)
			})
		})
		//Executed on start and only once
		gridTl.add('step0')
		.to(row0.current.children, {
			duration: 1.6,
      transformOrigin: '50% 50%',
			x:'-=40',
			stagger: {
				each: stagger,
				from: 'end'
			},
			fill: (i, c) => {				
				return getColor(i+1)
			},
			scale: (i, c) => {
				return i > 7 ? 0 : 1
			},
			}, 'step0')
		.to(row1.current.children, {
			duration: 1.4,
      transformOrigin: '50% 50%',
			x:'-=80',
			stagger: {
				each: stagger,
				from: 'end'
			},
		fill: (i, c) => {
				return getColor(i+1)
			},
			scale: (i, c) => {
				return i > 6 ? 0 : 1
			},
			
		}, 'step0')
		.to(row2.current.children, {
			duration: 1.2,
      transformOrigin: '50% 50%',
			x:'-=120',
			stagger: {
				each: stagger,
				from: 'end'
			},
		fill: (i, c) => {
				return getColor(i+1)
			},
			scale: (i, c) => {
				return i > 5 ? 0 : 1
			}
		}, 'step0')
		.to(row3.current.children, {
			duration: 1,
      transformOrigin: '50% 50%',
			x:'-=160',
			stagger: {
				each: stagger,
				from: 'end'
			},
		fill: (i, c) => {
				return getColor(i+1)
			},
			scale: (i, c) => {
				return i > 4 ? 0 : 1
			}
		}, 'step0')
	}, [])
	
	
	
	return (  
		<svg ref={mainSVG} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
			<defs>
				<clipPath id="mask">
				    <rect
      className="mask"
      x={100}
      y={100}
      width={200}
      height={200}
      fill="#646464"
      strokeWidth={0}
    />
				</clipPath>
			</defs>
	    <g ref={whole} clipPath="url(#mask)">
      <g ref={row0}>
        <circle cx={440} cy={140} r={10} />
        <circle cx={400} cy={140} r={10} />
        <circle cx={360} cy={140} r={10} />
        <circle cx={320} cy={140} r={10} />
        <circle cx={280} cy={140} r={10} />
        <circle cx={240} cy={140} r={10} />
        <circle cx={200} cy={140} r={10} />
        <circle cx={160} cy={140} r={10} />
        <circle cx={120} cy={140} r={10} />
      </g>
      <g ref={row1}>
        <circle cx={440} cy={180} r={10} />
        <circle cx={400} cy={180} r={10} />
        <circle cx={360} cy={180} r={10} />
        <circle cx={320} cy={180} r={10} />
        <circle cx={280} cy={180} r={10} />
        <circle cx={240} cy={180} r={10} />
        <circle cx={200} cy={180} r={10} />
        <circle cx={160} cy={180} r={10} />
        <circle cx={120} cy={180} r={10} />
      </g>
      <g ref={row2}>
        <circle cx={440} cy={220} r={10} />
        <circle cx={400} cy={220} r={10} />
        <circle cx={360} cy={220} r={10} />
        <circle cx={320} cy={220} r={10} />
        <circle cx={280} cy={220} r={10} />
        <circle cx={240} cy={220} r={10} />
        <circle cx={200} cy={220} r={10} />
        <circle cx={160} cy={220} r={10} />
        <circle cx={120} cy={220} r={10} />
      </g>
      <g ref={row3}>
        <circle cx={440} cy={260} r={10} />
        <circle cx={400} cy={260} r={10} />
        <circle cx={360} cy={260} r={10} />
        <circle cx={320} cy={260} r={10} />
        <circle cx={280} cy={260} r={10} />
        <circle cx={240} cy={260} r={10} />
        <circle cx={200} cy={260} r={10} />
        <circle cx={160} cy={260} r={10} />
        <circle cx={120} cy={260} r={10} />
      </g>
    </g>
			
  </svg>
				 )
} 

function App() {

	const [animState, setAnimState] = useState(0);

  return (
    <div  >
			<GridLoader/>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
 
