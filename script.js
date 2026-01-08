document.addEventListener("DOMContentLoaded", () => {
    
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
    // 2. GENERATE BEANS (DENSE FLOOR PILE)
    // ==================================================
    const floorContainer = document.querySelector('.bean-floor-container');
    
    if (floorContainer) {
        const beanSVGString = `
            <svg viewBox="0 0 100 100" style="width:100%; height:100%;">
                <path d="M50,90 C20,90 10,50 30,20 C50,-10 90,10 90,40 C90,70 70,90 50,90 M45,25 Q55,50 45,80" 
                fill="#4B3621" stroke="#3E2B1F" stroke-width="3" />
            </svg>`;

        // INCREASE COUNT: 300 beans to remove gaps
        for (let i = 0; i < 300; i++) {
            const div = document.createElement('div');
            div.classList.add('floor-bean');
            div.innerHTML = beanSVGString;
            
            // Random horizontal position
            div.style.left = Math.random() * 100 + "%";
            
            // --- FIX: FLATTER PILE LOGIC ---
            // Force beans to stay very low to form a "Floor"
            let landPosition;
            const randomChance = Math.random();
            
            if (randomChance < 0.9) {
                // 90% of beans land between 0px and 15px (The solid line)
                landPosition = Math.random() * 15; 
            } else {
                // 10% scatter slightly on top (15px to 40px)
                landPosition = 15 + Math.random() * 25; 
            }

            div.style.bottom = landPosition + "px"; 
            
            // Random Rotation and Size
            div.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.7 + Math.random() * 0.5})`;
            
            // Z-Index: Mix them in front and behind the cup (Cup is usually z-index 3)
            // This makes the pile look like it surrounds the cup base
            div.style.zIndex = Math.floor(Math.random() * 6); 
            
            floorContainer.appendChild(div);
        }

        // --- ANIMATION A: THE RAIN ---
        gsap.from(".floor-bean", {
            scrollTrigger: {
                trigger: "#process",
                start: "top 60%", 
                toggleActions: "play none none none"
            },
            y: -window.innerHeight, // Rain from top
            opacity: 1,
            duration: 1.2, // Faster rain for more impact
            ease: "bounce.out",
            stagger: {
                amount: 1, 
                from: "random"
            }
        });
    }

    // ==================================================
    // 3. MAIN BREW TIMELINE (+ WHIRLPOOL ENDING)
    // ==================================================
    const brewTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#process",
            start: "top top",
            end: "+=4000", 
            scrub: 1, 
            pin: true, 
            anticipatePin: 1
        }
    });

    brewTl
        // --- A. Machine Brewing ---
        .to(".r-bean", { y: 200, rotation: 360, ease: "power1.in", stagger: 0.1, duration: 2 })
        .to(".r-bean", { opacity: 0, scale: 0.5, duration: 0.5 }, "-=0.5")
        .to(".r-stream", { height: 180, duration: 2, ease: "none" })
        .to(".r-liquid-fill", { height: "85%", duration: 3, ease: "none" }, "<0.5")
        .to(".r-steam", { opacity: 0.8, y: -50, duration: 2 }, "<")
        .to(".r-stream", { height: 0, opacity: 0, duration: 0.5 })

        // --- B. The Floor Whirlpool Effect ---
        .to(".floor-bean", {
            duration: 3, 
            ease: "expo.in", 
            
            // 1. SUCK INWARDS (Horizontal Center)
            x: (i, target) => {
                const rect = target.getBoundingClientRect();
                const centerX = window.innerWidth / 2;
                return centerX - rect.left - (rect.width/2);
            },
            
            // 2. SINK INTO FLOOR (Stay at bottom 0)
            // We force them to y=0 relative to their container
            // Since they have bottom: XXpx, adding 'y' pushes them visually
            // Ideally, we just want them to converge at bottom center.
            y: (i, target) => {
                // Keep them near the floor, maybe sink slightly (positive Y)
                return 50; 
            },

            scale: 0,       // Shrink
            rotation: 1080, // Spin fast
            opacity: 0,
            
            stagger: {
                amount: 1.5,
                from: "center" 
            }
        }, "+=0.1");


    // 4. ORIGINS SECTION
    gsap.to(".origins-bg-layer", {
        scrollTrigger: { trigger: "#origins", start: "top bottom", end: "bottom top", scrub: true },
        y: 100, ease: "none"
    });
    gsap.to(".fore-leaf", {
        scrollTrigger: { trigger: "#origins", start: "top bottom", end: "bottom top", scrub: true },
        y: -150, ease: "none"
    });

    // 5. MENU SECTION
    ScrollTrigger.batch(".menu-item", {
        start: "top 85%",
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8 })
    });
    gsap.set(".menu-item", { opacity: 0, y: 50 });

});