/**
 * Página de Detalhes do Presidente - PresiDATA
 * Exibe informações detalhadas de um presidente específico
 */
class PresidentePage {
    constructor() {
        this.presidentes = [];
        this.currentPresident = null;
        this.heroTimeline = null;
        this.nameTimeline = null;
        this.scrollTriggers = [];
        this.init();
    }

    async init() {
        await this.loadPresidentes();
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        this.loadPresidentFromURL();
        this.setupHeaderScroll();
    }

    async loadPresidentes() {
        try {
            const response = await fetch('./data/presidentes-db.json');
            const data = await response.json();
            this.presidentes = data.presidentes;
        } catch (error) {
            console.error('Erro ao carregar dados dos presidentes:', error);
            this.showError('Erro ao carregar dados dos presidentes');
        }
    }

    loadPresidentFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const presidentId = urlParams.get('id');
        
        if (presidentId) {
            const president = this.presidentes.find(p => p.id === presidentId);
            if (president) {
                this.displayPresident(president);
                this.currentPresident = president;
            } else {
                this.showError('Presidente não encontrado');
            }
        } else {
            this.showError('ID do presidente não fornecido');
        }
    }

    displayPresident(presidente) {
        document.title = `${presidente.nome} - PresiDATA`;

        if (presidente.id) {
            document.body.dataset.currentPresidentId = presidente.id;
        } else {
            delete document.body.dataset.currentPresidentId;
        }

        document.body.dataset.currentPresidentName = presidente.nome || '';

        // Foto
        document.getElementById('president-photo').src = presidente.foto;
        document.getElementById('president-photo').alt = `Foto de ${presidente.nome}`;

        // Hero Section
        const nameElement = document.getElementById('president-name-display');
        if (nameElement) {
            nameElement.textContent = presidente.nome;
        }
        
        const partyDisplay = Array.isArray(presidente.partido) 
            ? presidente.partido.join(', ') 
            : (presidente.partido || 'Sem partido');
        document.getElementById('president-party-display').textContent = partyDisplay;
        
        document.getElementById('president-mandate-display').textContent = 
            `${presidente.inicio_mandato} até ${presidente.final_mandato}`;

        const signatureWrapper = document.getElementById('president-signature-wrapper');
        const signatureImg = document.getElementById('president-signature');
        if (signatureWrapper && signatureImg) {
            if (presidente.assinatura) {
                signatureImg.src = presidente.assinatura;
                signatureImg.alt = `Assinatura de ${presidente.nome}`;
                signatureWrapper.classList.remove('is-hidden');
            } else {
                signatureImg.removeAttribute('src');
                signatureWrapper.classList.add('is-hidden');
            }
        }

        // Indicadores Econômicos
        document.getElementById('pib-display').textContent = presidente.pib_mandato || '--';
        document.getElementById('inflacao-display').textContent = presidente.inflacao || '--';
        document.getElementById('desemprego-display').textContent = presidente.desemprego || '--';
        document.getElementById('dolar-display').textContent = presidente.dolar || '--';
        document.getElementById('aprovacao-display').textContent = presidente.aprovacao || '--';

        // Sucessos
        const sucessosList = document.getElementById('sucessos-list');
        if (Array.isArray(presidente.sucessos) && presidente.sucessos.length > 0) {
            sucessosList.innerHTML = presidente.sucessos.map(sucesso => `
                <li>
                    <i class="fas fa-check"></i>
                    ${sucesso}
                </li>
            `).join('');
        } else {
            sucessosList.innerHTML = '<li><i class="fas fa-minus"></i> Sem dados registrados</li>';
        }

        // Polêmicas
        const polemicastList = document.getElementById('polemicas-list');
        if (Array.isArray(presidente.polemicas) && presidente.polemicas.length > 0) {
            polemicastList.innerHTML = presidente.polemicas.map(polemica => `
                <li>
                    <i class="fas fa-exclamation"></i>
                    ${polemica}
                </li>
            `).join('');
        } else {
            polemicastList.innerHTML = '<li><i class="fas fa-minus"></i> Sem dados registrados</li>';
        }

        // Informações Pessoais
        document.getElementById('nascimento-display').textContent = presidente.nascimento || '--';
        document.getElementById('estado-display').textContent = presidente.estado || '--';
        
        const morte = presidente.morte && presidente.morte !== '' ? presidente.morte : 'Vivo';
        document.getElementById('morte-display').textContent = morte;

        const profissao = Array.isArray(presidente.profissao) 
            ? presidente.profissao.join(', ') 
            : (presidente.profissao || '--');
        document.getElementById('profissao-display').textContent = profissao;

        const vice = Array.isArray(presidente.vice_presidente) && presidente.vice_presidente.length > 0
            ? presidente.vice_presidente.join(', ')
            : 'Sem vice registrado';
        document.getElementById('vice-display').textContent = vice;

        this.animateHeroName(presidente.nome);
        this.runPageAnimations();
        this.setupScrollAnimations();
    }

    setupHeaderScroll() {
        const header = document.querySelector('.page-header');
        if (!header) {
            return;
        }

        const updateHeaderState = () => {
            const shouldCondense = window.scrollY > 24;
            header.classList.toggle('is-condensed', shouldCondense);
        };

        updateHeaderState();
        window.addEventListener('scroll', updateHeaderState, { passive: true });
    }

    showError(message) {
        const container = document.querySelector('.content-wrapper');
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h1>Erro</h1>
                        <p>${message}</p>
                        <a href="index.html" class="btn-back">Voltar ao Início</a>
                    </div>
                </div>
            `;
        }
    }

        animateHeroName(name) {
            const nameElement = document.getElementById('president-name-display');
            if (!nameElement) return;

            const safeName = name || '';
            nameElement.setAttribute('aria-label', safeName);
            nameElement.innerHTML = '';

            const fragment = document.createDocumentFragment();
            [...safeName].forEach((char) => {
                const span = document.createElement('span');
                span.className = 'hero-name-letter';
                    span.textContent = char === ' ' ? '\u00A0' : char;
                fragment.appendChild(span);
            });
            nameElement.appendChild(fragment);

            if (typeof gsap === 'undefined') {
                return;
            }

            if (this.nameTimeline) {
                this.nameTimeline.kill();
            }

            const letters = nameElement.querySelectorAll('.hero-name-letter');
            this.nameTimeline = gsap.timeline({ delay: 0.15 });
            this.nameTimeline.fromTo(letters, {
                y: 60,
                opacity: 0,
                rotateX: 90
            }, {
                y: 0,
                opacity: 1,
                rotateX: 0,
                duration: 0.8,
                ease: 'back.out(1.8)',
                stagger: 0.045
            });
        }

        runPageAnimations() {
            if (typeof gsap === 'undefined') {
                return;
            }

            if (this.heroTimeline) {
                this.heroTimeline.kill();
            }

            this.heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

            this.heroTimeline.fromTo('.president-card-hero', {
                y: 30,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 0.7
            });

            this.heroTimeline.fromTo('.cardBox', {
                scale: 0.92,
                opacity: 0
            }, {
                scale: 1,
                opacity: 1,
                duration: 0.6
            }, '-=0.55');

            this.heroTimeline.fromTo(['.hero-subtitle', '.president-party-display', '.mandate-period-display'], {
                y: 20,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.08
            }, '-=0.3');

            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }

        setupScrollAnimations() {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                return;
            }

            this.scrollTriggers.forEach(trigger => trigger.kill());
            this.scrollTriggers = [];

            const register = (trigger) => {
                if (trigger) {
                    this.scrollTriggers.push(trigger);
                }
            };

            const createReveal = (selector, options = {}) => {
                const { start = 'top 85%', delayStep = 0 } = options;
                gsap.utils.toArray(selector).forEach((element, index) => {
                    element.classList.add('reveal-on-scroll');
                    element.classList.remove('is-visible');
                    if (delayStep) {
                        element.style.setProperty('--reveal-delay', `${index * delayStep}s`);
                    } else {
                        element.style.removeProperty('--reveal-delay');
                    }

                    const trigger = ScrollTrigger.create({
                        trigger: element,
                        start,
                        once: true,
                        onEnter: () => {
                            element.classList.add('is-visible');
                        }
                    });

                    register(trigger);
                });
            };

            createReveal('.section-title', { start: 'top 92%' });
            createReveal('.indicator-box', { start: 'top 88%', delayStep: 0.08 });
            createReveal('.result-card', { start: 'top 90%', delayStep: 0.1 });
            createReveal('.bio-card', { start: 'top 92%', delayStep: 0.05 });

            const footer = document.querySelector('.page-footer');
            if (footer) {
                footer.classList.add('reveal-on-scroll');
                footer.classList.remove('is-visible');
                const trigger = ScrollTrigger.create({
                    trigger: footer,
                    start: 'top 96%',
                    once: true,
                    onEnter: () => footer.classList.add('is-visible')
                });
                register(trigger);
            }
        }
}

document.addEventListener('DOMContentLoaded', () => {
    new PresidentePage();
});
