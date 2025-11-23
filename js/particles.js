document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('#particle-container');
    if (!containers.length) {
        return;
    }

    const colors = ['#009639', '#ffdf00', '#002776'];

    containers.forEach((container) => {
        const densityAttribute = parseInt(container.getAttribute('data-density') || '', 10);
        const bubbleCount = Number.isFinite(densityAttribute) ? Math.max(densityAttribute, 60) : 80;

        for (let index = 0; index < bubbleCount; index += 1) {
            const bubble = document.createElement('span');
            bubble.className = 'particle';

            bubble.style.setProperty('--x', (Math.random() * 100).toFixed(2));
            bubble.style.setProperty('--size', (8 + Math.random() * 22).toFixed(2));
            bubble.style.setProperty('--duration', (22 + Math.random() * 26).toFixed(2));
            bubble.style.setProperty('--delay', (Math.random() * 20).toFixed(2));
            bubble.style.setProperty('--opacity', (0.28 + Math.random() * 0.35).toFixed(2));
            bubble.style.setProperty('--direction', Math.random() > 0.5 ? '1' : '-1');
            bubble.style.setProperty('--blur', (Math.random() * 1.2).toFixed(2));
            bubble.style.setProperty('--glow', (18 + Math.random() * 28).toFixed(2));
            bubble.style.setProperty('--color', colors[index % colors.length]);

            container.appendChild(bubble);
        }
    });
});
