document.addEventListener('DOMContentLoaded', () => {
    // Check if device supports hover (desktop)
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // ==========================================================================
    // SEAMLESS MARQUEE CLONERS
    // ==========================================================================
    const ticker1 = document.getElementById('ticker-marquee');
    if (ticker1) {
        const content = ticker1.querySelector('.ticker-content');
        const clone = content.cloneNode(true);
        ticker1.appendChild(clone);
    }
    const ticker2 = document.getElementById('ticker-marquee-2');
    if (ticker2) {
        const content = ticker2.querySelector('.ticker-content');
        const clone = content.cloneNode(true);
        ticker2.appendChild(clone);
    }

    // ==========================================================================
    // MOBILE NAVIGATION MENU
    // ==========================================================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when links are clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ==========================================================================
    // SCROLL LISTENERS (NAVBAR & SCROLL PROGRESS)
    // ==========================================================================
    const navbar = document.getElementById('site-header');
    const scrollProgress = document.getElementById('scroll-progress');
    
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        // 1. Navbar scrolled visual class state
        if (navbar) {
            if (winScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // 2. Scroll Progress width
        if (scrollProgress) {
            const scrolled = (winScroll / height) * 100;
            scrollProgress.style.width = scrolled + '%';
        }
    });

    // ==========================================================================
    // COORDINATES TRACKING & GLOW FOLLOWERS (MOUSE MOVE)
    // ==========================================================================
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    let auraX = mouseX;
    let auraY = mouseY;

    const cursorDot = document.getElementById('custom-cursor');
    const cursorFollower = document.getElementById('custom-cursor-follower');
    const glowAura = document.getElementById('glow-aura');

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Move main dot instantly
        if (isDesktop && cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    // LERP animation loop for smooth follow effects
    const renderMotion = () => {
        // LERP: current + (target - current) * factor
        
        // Follower circle inertia
        if (isDesktop && cursorFollower) {
            followerX += (mouseX - followerX) * 0.14;
            followerY += (mouseY - followerY) * 0.14;
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;
        }

        // Background glow aura inertia (moves slightly slower for depth / parallax)
        if (glowAura) {
            auraX += (mouseX - auraX) * 0.06;
            auraY += (mouseY - auraY) * 0.06;
            glowAura.style.left = `${auraX}px`;
            glowAura.style.top = `${auraY}px`;
        }

        requestAnimationFrame(renderMotion);
    };
    requestAnimationFrame(renderMotion);

    // Custom Cursor Hovers on standard interactive items
    if (isDesktop) {
        const hoverTargets = document.querySelectorAll('a, button, input, textarea, .skill-tag, .faq-trigger');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            target.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    } else {
        // Remove cursor elements on mobile / touch devices
        if (cursorDot) cursorDot.remove();
        if (cursorFollower) cursorFollower.remove();
    }

    // ==========================================================================
    // INTERACTIVE PARTICLE CANVAS BACKGROUND
    // ==========================================================================
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const maxParticles = 55; // Optimized for 60fps performance
        
        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4; // Very slow drift
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 0.6;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
                
                // Repel slightly from mouse position
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.hypot(dx, dy);
                const repelDist = 140;
                
                if (dist < repelDist) {
                    const force = (repelDist - dist) / repelDist;
                    const angle = Math.atan2(dy, dx);
                    // Push particle slightly away
                    this.x -= Math.cos(angle) * force * 1.5;
                    this.y -= Math.sin(angle) * force * 1.5;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(197, 255, 46, 0.12)'; /* Subtle neon green tint */
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.hypot(dx, dy);
                    const connectionDist = 115;
                    
                    if (dist < connectionDist) {
                        const alpha = (1 - dist / connectionDist) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }

    // ==========================================================================
    // HERO 3D CARD TILT
    // ==========================================================================
    const heroSection = document.getElementById('hero-section');
    const tiltCard = document.getElementById('hero-interactive-card');

    if (heroSection && tiltCard && isDesktop) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = tiltCard.getBoundingClientRect();
            
            // Get center point of card
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;
            
            // Vector from center to cursor
            const deltaX = e.clientX - cardX;
            const deltaY = e.clientY - cardY;
            
            // Convert to tilt angle
            const rotateY = (deltaX / (window.innerWidth / 2)) * 22; // max tilt 22 deg
            const rotateX = -(deltaY / (window.innerHeight / 2)) * 22;

            tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        // Reset rotation smoothly
        heroSection.addEventListener('mouseleave', () => {
            tiltCard.style.transform = 'rotateX(0) rotateY(0)';
            tiltCard.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        heroSection.addEventListener('mouseenter', () => {
            tiltCard.style.transition = 'none';
        });
    }

    // ==========================================================================
    // PROJECT CARDS: 3D TILT & FLOATING FOLLOW BADGE
    // ==========================================================================
    const projectCards = document.querySelectorAll('.project-card');
    
    if (projectCards.length > 0 && isDesktop) {
        projectCards.forEach(card => {
            const badge = card.querySelector('.project-hover-badge');
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // x coordinates inside card
                const y = e.clientY - rect.top;  // y coordinates inside card
                
                // 1. Position the follow badge
                if (badge) {
                    badge.style.left = `${x}px`;
                    badge.style.top = `${y}px`;
                }

                // 2. Perform 3D card tilt
                const cardCenterX = rect.width / 2;
                const cardCenterY = rect.height / 2;
                const tiltX = -(y - cardCenterY) / cardCenterY * 8; // max 8 degrees
                const tiltY = (x - cardCenterX) / cardCenterX * 8;
                
                card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'none';
                if (badge) badge.style.transition = 'opacity 0.25s ease';
                document.body.classList.add('in-project-card');
            });

            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = 'rotateX(0) rotateY(0)';
                
                if (badge) {
                    badge.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                }
                document.body.classList.remove('in-project-card');
            });
        });
    }

    // ==========================================================================
    // CARDS 3D TILT PHYSICS (SERVICES, METRICS, PROCESS CARDS)
    // ==========================================================================
    const tiltCards = document.querySelectorAll('.service-card, .hud-card, .process-card, .tech-category-card');
    
    if (tiltCards.length > 0 && isDesktop) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const tiltX = -(y - centerY) / centerY * 6; // max 6 degrees for smooth subtle feel
                const tiltY = (x - centerX) / centerX * 6;
                
                card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            });
            
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'none';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = 'rotateX(0) rotateY(0)';
            });
        });
    }

    // ==========================================================================
    // MAGNETIC BUTTON PHYSICS (DESKTOP ONLY)
    // ==========================================================================
    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    
    if (magneticBtns.length > 0 && isDesktop) {
        document.addEventListener('mousemove', (e) => {
            magneticBtns.forEach(btn => {
                const rect = btn.getBoundingClientRect();
                
                // Center of the button
                const btnX = rect.left + rect.width / 2;
                const btnY = rect.top + rect.height / 2;
                
                // Vector distance from cursor to button center
                const deltaX = e.clientX - btnX;
                const deltaY = e.clientY - btnY;
                const distance = Math.hypot(deltaX, deltaY);
                
                const magnetRadius = 70; // Attraction boundary size
                
                if (distance < magnetRadius) {
                    // Pull effect scaling factor
                    const pullX = deltaX * 0.38;
                    const pullY = deltaY * 0.38;
                    btn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
                } else {
                    btn.style.transform = 'translate3d(0, 0, 0)';
                }
            });
        });
    }

    // ==========================================================================
    // FAQ ACCORDION COLLAPSE/EXPAND LOGIC
    // ==========================================================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const trigger = item.querySelector('.faq-trigger');
            const content = item.querySelector('.faq-content');
            const icon = item.querySelector('.faq-icon-box i');
            
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Collapse all other FAQ items first
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.faq-content');
                    const otherIcon = otherItem.querySelector('.faq-icon-box i');
                    if (otherContent) otherContent.style.maxHeight = '0px';
                    if (otherIcon) {
                        otherIcon.className = 'fa-solid fa-plus';
                    }
                });

                // Toggle selected FAQ item state
                if (!isActive) {
                    item.classList.add('active');
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    if (icon) icon.className = 'fa-solid fa-minus';
                } else {
                    item.classList.remove('active');
                    content.style.maxHeight = '0px';
                    if (icon) icon.className = 'fa-solid fa-plus';
                }
            });
        });
    }

    // ==========================================================================
    // SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
    // ==========================================================================
    const fadeSections = document.querySelectorAll('.fade-in-section');
    
    if (fadeSections.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Animate once
                }
            });
        }, observerOptions);

        fadeSections.forEach(section => {
            observer.observe(section);
        });
    }

    // ==========================================================================
    // SKILL BARS PROGRESS ANIMATION (INTERSECTION OBSERVER)
    // ==========================================================================
    const blueprintSection = document.getElementById('blueprint');
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    
    if (blueprintSection && skillBars.length > 0) {
        const blueprintObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillBars.forEach(bar => {
                        const targetWidth = bar.getAttribute('data-width');
                        bar.style.width = targetWidth;
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        blueprintObserver.observe(blueprintSection);
    }

    // ==========================================================================
    // CONTACT FORM INTERACTION
    // ==========================================================================
    const contactForm = document.getElementById('portfolio-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('btn-submit-form');
            const originalBtnText = submitBtn.innerHTML;
            
            // Set loading/sending state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-sync fa-spin" style="margin-right: 8px;"></i> Sending...`;
            
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value;

            // Submit data to FormSubmit AJAX endpoint
            fetch("https://formsubmit.co/ajax/prayagkansara05@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                })
            })
            .then(response => {
                if (response.ok) {
                    contactForm.innerHTML = `
                        <div class="success-message" style="text-align: center; padding: 40px 0;">
                            <i class="fa-solid fa-circle-check" style="font-size: 3.5rem; color: var(--color-accent); margin-bottom: 20px; display: block;"></i>
                            <h3 style="font-family: var(--font-title); font-size: 1.8rem; margin-bottom: 10px; color: #ffffff;">Thank You, ${name}!</h3>
                            <p style="color: var(--color-text-secondary); max-width: 300px; margin: 0 auto;">Your message has been sent successfully. I will get back to you at ${email} shortly.</p>
                        </div>
                    `;
                } else {
                    throw new Error("Failed to deliver submission.");
                }
            })
            .catch(error => {
                console.error("FormSubmit Error:", error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                alert("There was an error sending your message. Please try again or email me directly at prayagkansara05@gmail.com.");
            });
        });
    }

});
