//author: Ryan Huang

// wait for the html to load before drawing the canvas
// sometimes the canvas will not draw if the html does not load in time
document.addEventListener('DOMContentLoaded', function() {

	// fetch the canvas element from html file
	var canvas = document.getElementById("theCanvas");
	var ctx = canvas.getContext('2d');

	// resize the canvas to the size of the current window
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// simulate particles going past the boundaries
	let padding = 0;

	// canvas dimensions
	let canvasW = canvas.width + padding;
	let canvasH = canvas.height + padding;

	// number of particles to draw
	let n = canvasW / 19;
	// let n = canvasW / canvasW;

	//minimum distance to draw an edge between particles
	let d = 150;

	// depth threshold for color change (will be updated based on scroll position)
	let depthThreshold = canvasH;

	// percent of screen scrolled
	let scrollPercent = 0;



	function getRandomHexColor(minHex, maxHex) {
	    const hexToRGB = hex => ({
	        r: parseInt(hex.substring(1, 3), 16),
	        g: parseInt(hex.substring(3, 5), 16),
	        b: parseInt(hex.substring(5, 7), 16),
	    });

	    const RGBToHex = rgb => `#${(1 << 24 | rgb.r << 16 | rgb.g << 8 | rgb.b).toString(16).slice(1)}`;

	    const minRGB = hexToRGB(minHex);
	    const maxRGB = hexToRGB(maxHex);

	    const randomRGB = () => ({
	        r: Math.floor(Math.random() * (maxRGB.r - minRGB.r + 1) + minRGB.r),
	        g: Math.floor(Math.random() * (maxRGB.g - minRGB.g + 1) + minRGB.g),
	        b: Math.floor(Math.random() * (maxRGB.b - minRGB.b + 1) + minRGB.b),
	    });


	    return RGBToHex(randomRGB());
	}


	class Particle {
		// create a particle object with a random location and random velocity
		constructor(x, y, vx, vy, color) {
			this.x = Math.random() * canvasW;
			this.y = Math.random() * canvasH;
			this.vx = Math.random() * 4 - 2;
			this.vy = Math.random() * 4 - 2;
			this.vxs = Math.random();
			this.vys = Math.random();
			// this.color = Math.floor(Math.random()*16777215).toString(16); // cannot get the color to swap when switching boundaries
			this.colorw = "FFFFFF";
			this.colorb = "000000";
			this.colorg = "787878";
		}

		updateColor() {
		 	// change color if particle moves past the depth threshold
			if (this.y > depthThreshold && this.y < (depthThreshold+0.53*window.innerHeight)) {
				// this.color = this.colorb; // second background -> about me
				this.color = "00000050"; // Using #RRGGBBAA
			}
			else if (this.y > (depthThreshold+0.53*window.innerHeight) && this.y < depthThreshold+window.innerHeight) {
				// this.color = this.colorw; // second background -> skills
				this.color = "FFFFFF20"; // Using #RRGGBBAA
			}
			else if (this.y < depthThreshold) {
				this.color = this.colorw; // first background
			}
			else if (this.y > (depthThreshold+window.innerHeight) && this.x > window.innerWidth/2) {
				this.color = this.colorg; // third background -> projects
			}
			else if (this.y > (depthThreshold+window.innerHeight) && this.x < window.innerWidth/2) {
				this.color = this.colorb; // third background -> experience
			}
		}

		showParticle() {
			// show the particle on the canvas
			ctx.beginPath();
			ctx.fillStyle = "#" + this.color;
			ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2, true);
			ctx.globalAlpha = 1;
			ctx.closePath();
			ctx.fill();
		}

		moveParticle() {

			if (this.x < -padding) {
				this.x = canvasW;
			}
			if (this.x > canvasW) {
				this.x = -padding;
			}
			if (this.y < -padding) {
				this.y = canvasH;
			}
			if (this.y > canvasH) {
				this.y = -padding;
			}

			// modify particle speed depending on how far down the screen you are
			if (scrollPercent > 40) {
				this.x += this.vx * (1.1 - (scrollPercent/100));
				this.y += this.vy * (1.1 - (scrollPercent/100));
				this.updateColor();
			}
			else {
				this.x += this.vx;
				this.y += this.vy;
				this.updateColor();
			}
		}

		connectEdges(index, particles) {
			// measure the distance between a given particle and all other particles
			// connect any particles within a certain distance
			for(let i = 0; i < n; i++) {
				let dist = Math.hypot(particles[index].x - particles[i].x, particles[index].y - particles[i].y);
				if (dist < d) {
					let line = canvas.getContext('2d');
					line.beginPath();
					line.moveTo(particles[index].x, particles[index].y);
					line.lineTo(particles[i].x, particles[i].y);
					line.strokeStyle = "#" + this.color;
					line.globalAlpha = 1 - (dist / d);
					line.stroke();
				}
			}
		}
	}

	// array to store each particle object
	const particles = [];

	// create all initial particle objects and push them to the array
	for(let i = 0; i < n; i++) {
		particles.push(new Particle());
	}

	// Function to update the depth threshold based on scroll position
	function updateDepthThreshold() {
		  const scrollTop = window.scrollY || window.pageYOffset;   // Get the current scroll position
		  const scrollHeight = document.documentElement.scrollHeight;   // Get the total scrollable height
		  const viewportHeight = window.innerHeight;   // Get the viewport height
		  const totalHeight = scrollHeight - viewportHeight;   // Calculate the total height of the document that is scrollable
		  const scrollDepth = (scrollTop / totalHeight) * 100;   // Calculate the scroll depth as a percentage
		  // console.log(`Scroll Depth: ${scrollDepth.toFixed(2)}%`);

		  depthThreshold = viewportHeight - scrollTop;
		  // console.log(scrollTop);
		  scrollPercent = scrollDepth;
	}

	// Update depth threshold on scroll
	window.addEventListener('scroll', updateDepthThreshold);


	// update the positions of all particles every 40 ms
	setInterval(function() {
		//remove the previous particles
		const clear = canvas.getContext("2d");
		clear.clearRect(0, 0, canvasW, canvasH);

		//show, move, and connect all the particles
		for(let i = 0; i < particles.length; i++) {
			particles[i].showParticle();
			particles[i].moveParticle();
			particles[i].connectEdges(i, particles);
		}
	}, 20);

	// Initialize depth threshold
	updateDepthThreshold();

});
