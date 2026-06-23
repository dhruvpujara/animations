// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("frame");
const context = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: false
});

// Set canvas size once
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const frames = {
    currentIndex: 0,
    maxIndex: 479
};

let imagesLoaded = 0;
let images = [];
let lastLoadedIndex = -1;

// Preload all images
function preloadImages() {
    for (var i = 0; i < frames.maxIndex; i++) {
        const imgUrl = `./images/frame_${(i + 1).toString().padStart(4, "0")}.jpeg`;
        const img = new Image();
        img.decoding = 'async';

        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === frames.maxIndex) {
                console.log("All images loaded");
                loadImage(frames.currentIndex);
                startAnimation();
            }
        };

        img.onerror = () => {
            console.error(`Failed to load: ${imgUrl}`);
            imagesLoaded++;
            if (imagesLoaded === frames.maxIndex) {
                console.log("All images loaded (with errors)");
                loadImage(frames.currentIndex);
                startAnimation();
            }
        };

        images[i] = img;
        img.src = imgUrl;
    }
}

// Optimized image loading with caching
function loadImage(index) {
    if (index === lastLoadedIndex) return;
    if (index < 0 || index >= frames.maxIndex) return;

    const image = images[index];
    if (!image || !image.complete) return;

    lastLoadedIndex = index;

    requestAnimationFrame(() => {
        context.fillStyle = '#18181b';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const scaleX = canvas.width / image.width;
        const scaleY = canvas.height / image.height;
        const scale = Math.max(scaleX, scaleY);

        const newWidth = image.width * scale;
        const newHeight = image.height * scale;
        const offsetX = (canvas.width - newWidth) / 2;
        const offsetY = (canvas.height - newHeight) / 2;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, offsetX, offsetY, newWidth, newHeight);

        frames.currentIndex = index;
    });
}

function startAnimation() {
    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".parent",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            markers: false,
            invalidateOnRefresh: true,
            anticipatePin: 1,
        }
    });

    tl.to(frames, {
        currentIndex: frames.maxIndex - 1,
        ease: "none",
        duration: 1,
        onUpdate: () => {
            const index = Math.floor(frames.currentIndex);
            if (index !== lastLoadedIndex) {
                loadImage(index);
            }
        }
    });
}

// Throttled resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        if (images[frames.currentIndex]) {
            loadImage(frames.currentIndex);
        }
    }, 100);
});

// Start preloading
preloadImages();