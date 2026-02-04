document.addEventListener("DOMContentLoaded", () => {
    const bgVideo = document.querySelector('.bg-video');

    if (bgVideo) {
        // 1. Force reset the ink GIF on page load
        const timestamp = new Date().getTime();
        const freshMask = `url('ink.gif?v=${timestamp}')`;
        bgVideo.style.webkitMaskImage = freshMask;
        bgVideo.style.maskImage = freshMask;

        // 2. Instant Swap + Fade-In Sequence
        const videoSequence = ["grinder-1080.mp4", "espresso-2.mp4", "latte.mp4", "final.mp4"];
        let currentVideoIndex = 0;

        bgVideo.addEventListener('ended', () => {
            if (currentVideoIndex < videoSequence.length) {
                gsap.set(bgVideo, { opacity: 0 });

                const nextVideo = videoSequence[currentVideoIndex];
                bgVideo.src = nextVideo;

                // --- UPDATED LOGIC START ---
                
                // 1. Check if the NEXT video is espresso-2.mp4
                if (nextVideo === "espresso-2.mp4") {
                    bgVideo.classList.add('shift-focus');
                } else {
                    bgVideo.classList.remove('shift-focus');
                }

                // 2. NEW: Check for "Zoom Out" (Cinematic Mode) on Mobile
                if (nextVideo === "latte.mp4" || nextVideo === "final.mp4") {
                    bgVideo.classList.add('mobile-cinema-mode');
                } else {
                    bgVideo.classList.remove('mobile-cinema-mode');
                }

                // 3. Loop Logic
                if (currentVideoIndex === videoSequence.length - 1) {
                    bgVideo.loop = true;
                } else {
                    bgVideo.loop = false;
                }
                // --- UPDATED LOGIC END ---

                bgVideo.load();

                bgVideo.onplay = () => {
                    gsap.to(bgVideo, { 
                        opacity: 1, 
                        duration: 0.5, 
                        ease: "power1.out" 
                    });
                };

                bgVideo.play();
                currentVideoIndex++;
            }
        });
    }

    // --- 0. MENU LOGIC ---
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('header nav');
    const navLinks = document.querySelectorAll('header nav ul li a');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle) menuToggle.classList.remove('active');
            if (nav) nav.classList.remove('active');
        });
    });

    // --- GSAP SETUP ---
    gsap.registerPlugin(ScrollTrigger);

    // 1. HERO INTRO
    gsap.timeline()
        .from("header", { y: -50, opacity: 0, duration: 1 })
        .from(".banner .title", { y: 100, opacity: 0, duration: 1 }, "-=0.5")
        .from(".banner p", { y: 20, opacity: 0, duration: 0.8 }, "-=0.5");


    // ==================================================
    // 2. MAIN BREW TIMELINE
    // ==================================================
    const isMobile = window.innerWidth < 768;
    
    // Set initial scale
    gsap.set(".realistic-brew", { scale: isMobile ? 0.7 : 1 });

    // --- BOILING PHYSICS ---
    // Hide bubbles initially
    gsap.set(".boil-bubble", { opacity: 0 });

    // Random Simmer Loop
    gsap.to(".boil-bubble", {
        scale: 1.1,
        y: -5,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.1, from: "random" }
    });

    const brewTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#process",
            start: "top top",
            end: isMobile ? "+=3000" : "+=4000", 
            scrub: 1, 
            pin: true, 
            anticipatePin: 1
        }
    });

    brewTl
        .to(".machine-glow", { opacity: 0.3, duration: 1 })
        .to(".r-bean", { y: 280, rotation: 360, opacity: 1, ease: "power1.in", stagger: 0.1, duration: 1.5 }, "<")
        .to(".r-bean", { opacity: 0, scale: 0, duration: 0.3, stagger: 0.1 }, "-=1.0")
        .to(".machine-glow", { opacity: 0.8, scale: 1.2, duration: 0.5 }, "<")
        
        // Pour & Boil
        .to(".r-stream", { height: 180, duration: 2, ease: "none" })
        .to(".realistic-brew", { scale: isMobile ? 0.85 : 1.1, duration: 4, ease: "none" }, "<")
        .to(".boil-bubble", { 
            scale: 1.5, y: -10, duration: 0.5, 
            ease: "rough({ strength: 2, points: 10, template: none, taper: none, randomize: true, clamp: false })"
        }, "<")

        // Fill Cup
        .to(".r-liquid-fill", { height: "85%", duration: 3, ease: "none" }, "<0.5")
        .to(".boil-bubble", { opacity: 1, duration: 0.5 }, "<")
        .to(".machine-glow", { opacity: 0.5, scale: 1, duration: 2 }, "<")

        // Finish
        .to(".r-stream", { height: 0, opacity: 0, duration: 0.5 })
        .to(".boil-bubble", { scale: 1.0, y: 0, duration: 1, ease: "power2.out" }, "<")
        .to(".steam-puff", { y: -50, opacity: 0.8, scale: 1.5, duration: 2, stagger: 0.3, ease: "power1.out" }, "-=0.2"); 


    // ==================================================
    // 3. ORIGINS SECTION (ASPECT RATIO FIX)
    // ==================================================
    
    // 1. Detect Mobile for Lottie Configuration
    const isMobileOrigin = window.innerWidth < 768;

    // 2. THE GEOMETRY FIX:
    // Desktop ("slice"): Fills the screen, crops the edges (Good for wide screens)
    // Mobile ("meet"): Fits the image inside the screen (Good for tall screens, prevents zooming)
    const aspectRatioSetting = isMobileOrigin ? 'xMidYMid meet' : 'xMidYMid slice';

    let lottieAnim = lottie.loadAnimation({
        container: document.querySelector("#lottie-danm"),
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "danm2.json",
        rendererSettings: {
            preserveAspectRatio: aspectRatioSetting // <--- THIS IS THE FIX
        }
    });

    lottieAnim.addEventListener("DOMLoaded", function() {
        
        let mm = gsap.matchMedia();
        let playhead = { frame: 0 };

        mm.add({
            isMobile: "(max-width: 768px)",
            isDesktop: "(min-width: 769px)"
        }, (context) => {
            
            let { isMobile } = context.conditions;

            // Geometry Config
            const clipStart = isMobile ? "circle(0% at 50% 50%)" : "circle(0% at 0% 50%)";
            const clipEnd   = isMobile ? "circle(150% at 50% 50%)" : "circle(150% at 0% 50%)";
            const scrollDist = isMobile ? "+=2000" : "+=4000";

            // Force initial state
            // Note: We remove 'scale: 1.5' for mobile to prevent double-zooming
            gsap.set("#final-origin-img", { 
                clipPath: clipStart, 
                webkitClipPath: clipStart,
                scale: isMobile ? 1 : 1.5 
            });

            // Refresh Lottie Layout
            lottieAnim.resize();

            let originTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#origins",
                    start: "top top",
                    end: scrollDist, 
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    // Force a recalculation when address bar moves
                    onRefresh: () => lottieAnim.resize() 
                }
            });

            originTl
                // Action 1: Play Lottie
                .to(playhead, {
                    frame: lottieAnim.totalFrames - 1,
                    duration: 4, 
                    ease: "none",
                    onUpdate: () => lottieAnim.goToAndStop(playhead.frame, true)
                })

                // Action 2: Reveal Image
                .to("#final-origin-img", {
                    clipPath: clipEnd, 
                    webkitClipPath: clipEnd,
                    duration: 3.5, 
                    ease: "power2.inOut"
                }, "<1") 

                // Action 3: Scale (Only scale down if we started zoomed in on Desktop)
                .to("#final-origin-img", {
                    scale: 1, 
                    duration: 3.5, 
                    ease: "power1.out"
                }, "<"); 
        });

        gsap.from("#lottie-danm", { opacity: 0, duration: 1 });
    });
    // ==================================================
    // 4. MENU SECTION
    // ==================================================
    gsap.from(".menu-header", {
        scrollTrigger: { trigger: ".menu-section", start: "top 70%", toggleActions: "play none none reverse" },
        y: 50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.set(".menu-card", { opacity: 0, y: 100 }); 

    ScrollTrigger.batch(".menu-card", {
        start: "top 85%",
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.2, duration: 1.2, ease: "power3.out" })
    });
    
    // Magnetic Effect (Desktop Only)
    if (window.matchMedia("(min-width: 769px)").matches) {
        const cards = document.querySelectorAll('.menu-card');
        cards.forEach(card => {
            const image = card.querySelector('.coffee-img');
            const number = card.querySelector('.card-bg-text');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(image, { x: x * 0.2, y: (y * 0.2) - 50, rotation: x * 0.05, duration: 0.6, ease: "power2.out" });
                gsap.to(number, { x: -x * 0.1, y: -y * 0.1, duration: 0.6, ease: "power2.out" });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(image, { x: 0, y: -50, rotation: 0, duration: 1, ease: "elastic.out(1, 0.5)" });
                gsap.to(number, { x: 0, y: 0, duration: 1, ease: "power2.out" });
            });
        });
    }
});