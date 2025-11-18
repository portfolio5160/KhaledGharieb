// --- Configuration ---
const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "expertise", label: "Expertise" },
    { id: "contact", label: "Contact" },
];

// --- Utility Functions ---

/**
 * Smooth scroll to a section and update the active navigation link.
 * @param {string} sectionId - The ID of the section to scroll to.
 */
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        updateActiveSection(sectionId);
        // Close mobile menu after clicking a link
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
            toggleMobileMenu(false);
        }
    }
}

/**
 * Update the 'active' class on navigation links.
 * @param {string} activeId - The ID of the currently active section.
 */
function updateActiveSection(activeId) {
    document.querySelectorAll(".nav-link").forEach(link => {
        const linkId = link.getAttribute("data-section-id");
        if (linkId === activeId) {
            link.classList.add("text-accent");
            link.classList.remove("text-foreground/70", "hover:text-foreground");
        } else {
            link.classList.remove("text-accent");
            link.classList.add("text-foreground/70", "hover:text-foreground");
        }
    });
}

/**
 * Toggle the mobile menu visibility.
 * @param {boolean} [forceState] - Optional boolean to force the menu state (true for open, false for closed).
 */
function toggleMobileMenu(forceState) {
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIconContainer = document.getElementById("mobile-menu-button");
    if (!mobileMenu || !menuIconContainer) return;

    const isCurrentlyOpen = mobileMenu.classList.contains("hidden") === false;
    const shouldOpen = forceState !== undefined ? forceState : !isCurrentlyOpen;

    // Clear existing icon and set new one
    menuIconContainer.innerHTML = shouldOpen 
        ? '<i data-lucide="x" class="w-6 h-6"></i>' 
        : '<i data-lucide="menu" class="w-6 h-6"></i>';

    if (shouldOpen) {
        mobileMenu.classList.remove("hidden");
    } else {
        mobileMenu.classList.add("hidden");
    }
    // Re-render lucide icons after changing the data-lucide attribute
    lucide.createIcons();
}

// --- Main Logic ---

document.addEventListener("DOMContentLoaded", () => {
    // 1. Build Navigation Menus
    const desktopNav = document.getElementById("desktop-nav");
    const mobileNav = document.getElementById("mobile-nav");

    navItems.forEach(item => {
        // Desktop Link
        const desktopLink = document.createElement("button");
        desktopLink.className = "nav-link text-sm font-medium transition-colors";
        desktopLink.setAttribute("data-section-id", item.id);
        desktopLink.textContent = item.label;
        desktopLink.addEventListener("click", () => scrollToSection(item.id));
        desktopNav.appendChild(desktopLink);

        // Mobile Link
        const mobileLink = document.createElement("button");
        mobileLink.className = "nav-link text-left text-sm font-medium text-foreground/70 hover:text-foreground transition-colors";
        mobileLink.setAttribute("data-section-id", item.id);
        mobileLink.textContent = item.label;
        mobileLink.addEventListener("click", () => scrollToSection(item.id));
        mobileNav.appendChild(mobileLink);
    });

    // 2. Mobile Menu Toggle Event
    document.getElementById("mobile-menu-button").addEventListener("click", () => {
        toggleMobileMenu();
    });

    // 3. Smooth Scroll for Hero Buttons
    document.querySelectorAll(".scroll-button").forEach(button => {
        button.addEventListener("click", () => {
            const sectionId = button.getAttribute("data-section-id");
            if (sectionId) {
                scrollToSection(sectionId);
            }
        });
    });

    // 4. Particle Animation (Replicated from Home.tsx useEffect)
    const canvas = document.getElementById("particle-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();

        const particles = [];
        const particleCount = 50;

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.3,
            });
        }

        const animate = () => {
            // Clear canvas with a slight trail effect
            // This color (rgba(13, 20, 40, 0.1)) is derived from the dark background color
            ctx.fillStyle = "rgba(13, 20, 40, 0.1)"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off walls
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Draw particle
                // This color (rgba(102, 153, 255, ...)) is a light blue, similar to the accent color
                ctx.fillStyle = `rgba(102, 153, 255, ${particle.opacity})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();

                // Draw connections
                particles.forEach((other) => {
                    const dx = other.x - particle.x;
                    const dy = other.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(102, 153, 255, ${(1 - distance / 100) * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener("resize", setCanvasSize);
    }

    // 5. Active Section Observer (Intersection Observer API)
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.5, // Trigger when 50% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateActiveSection(entry.target.id);
            }
        });
    }, observerOptions);

    // Observe all sections
    navItems.forEach(item => {
        const section = document.getElementById(item.id);
        if (section) {
            observer.observe(section);
        }
    });

    // Initial active section update
    updateActiveSection("home");

    // 6. Initialize Lucide Icons
    lucide.createIcons();
});
