// Get Framer Motion from the global scope
const { motion, animate } = window.FramerMotion;

// Define common animations
const animations = {
    pageTransition: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3, ease: "easeInOut" }
    },
    popUp: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    slideIn: {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        transition: { duration: 1.2, ease: "easeOut" }
    },
    staggerChildren: {
        transition: { staggerChildren: 0.1 }
    }
};

// Animation functions
function animatePageTransition(fromElement, toElement) {
    // Animate out current element
    animate(fromElement, animations.pageTransition.exit, {
        duration: 0.3,
        onComplete: () => {
            fromElement.classList.add('hidden');
            toElement.classList.remove('hidden');
            
            // Animate in new element
            animate(toElement, animations.pageTransition.animate, {
                duration: 0.3
            });
        }
    });
}

function animatePopup(element, show = true) {
    const animation = show ? animations.popUp.animate : animations.popUp.initial;
    animate(element, animation, {
        duration: 0.3,
        type: "spring",
        onComplete: () => {
            if (!show) {
                element.classList.add('hidden');
            }
        }
    });
}

function animateSetCard(element, index) {
    animate(element, animations.slideIn.animate, {
        delay: index * 0.4,
        duration: 1.2
    });
}

function animateTermPair(element) {
    animate(element, animations.slideIn.animate, {
        duration: 1.2,
        ease: "easeInOut"
    });
}

// Button hover animation
function animateButtonHover(element, isHovering) {
    animate(element, {
        scale: isHovering ? 1.05 : 1,
        y: isHovering ? -3 : 0
    }, {
        type: "spring",
        stiffness: 400,
        damping: 20
    });
}

// Export all functions
window.FramerAnimations = {
    animatePageTransition,
    animatePopup,
    animateSetCard,
    animateTermPair,
    animateButtonHover
};