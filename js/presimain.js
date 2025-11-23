class PresiDATAApp {
    constructor() {
        this.searchInput = document.getElementById('busca-candidato');
        this.searchButton = document.getElementById('btn-buscar');
        this.areaResultados = document.getElementById('area-resultados');
        this.suggestionsDropdown = document.getElementById('suggestions-dropdown');
        this.tutorialCards = document.getElementById('tutorial-cards');
        this.quickStats = document.getElementById('quick-stats');
        
        this.presidentes = [];
        this.isFirstSearch = true;
        
        this.animationManager = new AnimationManager();
        this.presidentCardManager = new PresidentCardManager();
        this.typewriter = null;
        
        if (this.areaResultados) {
            this.areaResultados.classList.add('is-empty');
        }

        if (!this.searchInput || !this.searchButton) {
            console.warn('Elementos do DOM não foram encontrados');
            return;
        }
        
        this.init();
    }

    async init() {
        await this.loadPresidentes();
        this.initAnimations();
        this.initTypewriter();
        this.initSearch();
        this.initScrollAnimations();
        this.animateStats();
        
        setTimeout(() => {
            this.searchInput?.focus();
        }, 1500);
    }
    
    initTypewriter() {
        setTimeout(() => {
            if (this.searchInput && this.searchInput.value === '') {
                this.typewriter = new TypewriterEffect(this.searchInput);
            }
            
            this.searchInput.addEventListener('focus', () => {
                if (this.typewriter) {
                    this.typewriter.stop();
                    this.typewriter = null;
                }
                const searchContainer = document.querySelector('.search-container');
                if (searchContainer) {
                    searchContainer.classList.add('focused');
                }
            });
            
            this.searchInput.addEventListener('blur', () => {
                const searchContainer = document.querySelector('.search-container');
                if (searchContainer) {
                    searchContainer.classList.remove('focused');
                }
                
                if (this.searchInput.value === '' && !this.typewriter) {
                    setTimeout(() => {
                        if (this.searchInput.value === '') {
                            this.typewriter = new TypewriterEffect(this.searchInput);
                        }
                    }, 1500);
                }
            });
            
            this.searchInput.addEventListener('input', () => {
                if (this.typewriter && this.searchInput.value !== '') {
                    this.typewriter.stop();
                    this.typewriter = null;
                }
            });
        }, 2000);
    }

    async loadPresidentes() {
        try {
            const response = await fetch('./data/presidentes-db.json');
            const data = await response.json();
            this.presidentes = (data.presidentes || []).map((presidente) => ({
                ...presidente,
                _searchMeta: this.buildSearchMeta(presidente)
            }));
            console.log(`Carregados ${this.presidentes.length} presidentes`);
        } catch (error) {
            console.error('Erro ao carregar dados dos presidentes:', error);
        }
    }

    initAnimations() {
        this.animationManager.animatePageEntry();
    }

    initSearch() {
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length >= 1) {
                this.showSuggestions(query);
            } else {
                this.hideSuggestions();
            }
        });

        const performSearch = () => {
            if (this.animationManager.isCurrentlyAnimating()) {
                console.log('⚠️ Animação ativa, ignorando busca...');
                return;
            }
            
            const query = this.searchInput.value.trim();
            if (query.length >= 1) {
                this.searchPresidentes(query);
            }
        };

        this.searchButton.addEventListener('click', performSearch);
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-container')) {
                this.hideSuggestions();
            }
        });
    }

    /**
     * Mostra sugestões de busca
     * @param {string} query - Termo de busca
     */
    showSuggestions(query) {
        const matches = this.findBestMatches(query, 8);

        if (matches.length === 0) {
            this.hideSuggestions();
            return;
        }

        const suggestionsHTML = matches.map(match => `
            <div class="suggestion-item" data-president-id="${match.presidente.id}">
                <img src="${match.presidente.foto}" alt="${match.presidente.nome}" class="suggestion-photo">
                <div class="suggestion-info">
                    <div class="suggestion-name">${match.presidente.nome}</div>
                    <div class="suggestion-details">${match.presidente.inicio_mandato} a ${match.presidente.final_mandato} • ${match.presidente.partido || 'Sem partido'}</div>
                </div>
            </div>
        `).join('');

        this.suggestionsDropdown.innerHTML = suggestionsHTML;
        this.suggestionsDropdown.classList.add('active');

        this.suggestionsDropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const presidentId = item.dataset.presidentId;
                const presidente = this.presidentes.find(pres => pres.id === presidentId);
                this.selectPresident(presidente);
            });
        });
    }


    hideSuggestions() {
        this.suggestionsDropdown.classList.remove('active');
    }

    /**
     * Busca presidentes
     * @param {string} query - Termo de busca
     */
    searchPresidentes(query) {
        if (this.animationManager.isCurrentlyAnimating()) {
            console.log('⚠️ Animação em andamento, ignorando busca...');
            return;
        }
        
        const matches = this.findBestMatches(query, 5);

        if (matches.length > 0) {
            this.selectPresident(matches[0].presidente);
        } else {
            return
        }
    }

    normalizeText(text) {
        if (!text) return '';
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    buildSearchMeta(presidente) {
        const nameNormalized = this.normalizeText(presidente.nome);
        const nameTokens = nameNormalized.split(' ').filter(Boolean);
        const partyRaw = Array.isArray(presidente.partido) ? presidente.partido.join(' ') : (presidente.partido || '');
        const partyNormalized = this.normalizeText(partyRaw);
        const partyTokens = partyNormalized.split(' ').filter(Boolean);

        const altTokens = new Set(nameTokens);
        if (presidente.id) {
            const idTokens = this.normalizeText(String(presidente.id)).split(' ');
            idTokens.forEach(token => token && altTokens.add(token));
        }

        return {
            fullName: nameNormalized,
            tokens: Array.from(altTokens),
            party: partyNormalized,
            partyTokens
        };
    }

    findBestMatches(query, limit = 10) {
        const normalizedQuery = this.normalizeText(query);
        if (!normalizedQuery) {
            return [];
        }

        const queryTokens = normalizedQuery.split(' ').filter(Boolean);
        if (queryTokens.length === 0) {
            return [];
        }

        const scored = this.presidentes.map((presidente) => ({
            presidente,
            score: this.computeMatchScore(presidente, normalizedQuery, queryTokens)
        }));

        return scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    computeMatchScore(presidente, normalizedQuery, queryTokens) {
        if (!presidente || !presidente._searchMeta) {
            return 0;
        }

        const meta = presidente._searchMeta;
        let score = 0;
        let matchedTokens = 0;

        if (meta.fullName === normalizedQuery) {
            score += 200;
        }

        if (meta.fullName.startsWith(normalizedQuery)) {
            score += 120;
        }

        if (meta.fullName.includes(normalizedQuery)) {
            score += 80;
        }

        queryTokens.forEach((token, index) => {
            let tokenScore = 0;

            meta.tokens.forEach((nameToken, tokenIndex) => {
                if (nameToken === token) {
                    tokenScore = Math.max(tokenScore, 70);
                } else if (nameToken.startsWith(token)) {
                    tokenScore = Math.max(tokenScore, 55);
                } else if (token.startsWith(nameToken)) {
                    tokenScore = Math.max(tokenScore, 40);
                } else {
                    const distance = this.calculateLevenshtein(nameToken, token);
                    const tolerance = token.length <= 4 ? 1 : 2;
                    if (distance <= tolerance) {
                        tokenScore = Math.max(tokenScore, 45 - distance * 8);
                    }
                }

                if (index === 0 && tokenIndex === 0 && nameToken.startsWith(token)) {
                    tokenScore += 15;
                }
            });

            if (tokenScore === 0 && meta.partyTokens.length) {
                meta.partyTokens.forEach((partyToken) => {
                    if (partyToken === token) {
                        tokenScore = Math.max(tokenScore, 25);
                    } else if (partyToken.startsWith(token)) {
                        tokenScore = Math.max(tokenScore, 18);
                    } else {
                        const distance = this.calculateLevenshtein(partyToken, token);
                        if (distance <= 1) {
                            tokenScore = Math.max(tokenScore, 12);
                        }
                    }
                });
            }

            if (tokenScore > 0) {
                matchedTokens += 1;
                score += tokenScore;
            }
        });

        if (matchedTokens === 0) {
            const distance = this.calculateLevenshtein(meta.fullName, normalizedQuery);
            if (distance <= Math.ceil(normalizedQuery.length / 3)) {
                score += Math.max(0, 60 - distance * 8);
            }
        } else {
            score += matchedTokens * 10;
        }

        if (queryTokens.length > 1) {
            const allCovered = queryTokens.every((token) =>
                meta.tokens.some(nameToken => nameToken.includes(token))
            );
            if (allCovered) {
                score += 25;
            }
        }

        return score;
    }

    calculateLevenshtein(a, b) {
        if (a === b) return 0;
        if (!a) return b.length;
        if (!b) return a.length;

        const rows = a.length + 1;
        const cols = b.length + 1;
        const matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));

        for (let i = 0; i < rows; i += 1) {
            matrix[i][0] = i;
        }

        for (let j = 0; j < cols; j += 1) {
            matrix[0][j] = j;
        }

        for (let i = 1; i < rows; i += 1) {
            for (let j = 1; j < cols; j += 1) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return matrix[rows - 1][cols - 1];
    }

    /**
     * Seleciona um presidente
     * @param {Object} presidente 
     */
    selectPresident(presidente) {
        if (!presidente) {
            return;
        }

        const presidentList = this.getPresidentMandates(presidente);
        const primaryPresident = presidentList[0] || presidente;

        console.log('🎯 Presidente selecionado:', primaryPresident.nome);
        console.log('🎯 Mandatos encontrados:', presidentList.length);
        console.log('🎯 É primeira pesquisa:', this.isFirstSearch);
        
        if (this.animationManager.isCurrentlyAnimating()) {
            console.log('⚠️ Animação já em andamento, ignorando...');
            return;
        }
        
        this.hideSuggestions();
        this.searchInput.value = primaryPresident.nome;
        
        this.animationManager.animatePresidentSelection(presidentList, this.isFirstSearch, (lista) => {
            console.log('🎯 Callback executado para:', Array.isArray(lista) ? lista.length : 0, 'cards');
            this.presidentCardManager.createPresidentCardInResults(lista);
        });
        
        this.isFirstSearch = false;
    }

    getPresidentMandates(presidente) {
        if (!presidente) {
            return [];
        }

        const normalizedName = this.normalizeText(presidente.nome);

        const duplicates = this.presidentes
            .filter((pres) => pres._searchMeta?.fullName === normalizedName);

        return duplicates
            .slice()
            .sort((a, b) => this.compareMandateStart(a.inicio_mandato, b.inicio_mandato));
    }

    compareMandateStart(aDate, bDate) {
        const aTime = this.parseMandateDate(aDate).getTime();
        const bTime = this.parseMandateDate(bDate).getTime();
        return aTime - bTime;
    }

    parseMandateDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') {
            return new Date(0);
        }

        const parts = dateStr.split('/');
        if (parts.length !== 3) {
            return new Date(0);
        }

        const [day, month, year] = parts.map(part => parseInt(part, 10));
        if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
            return new Date(0);
        }

        return new Date(year, month - 1, day);
    }
   
    initScrollAnimations() {
        this.animationManager.initScrollAnimations();
    }

    animateStats() {
        this.animationManager.animateStats();
    }

    /**
     * Mostra comparação rápida (placeholder)
     * @param {string} presidentId - ID do presidente
     */
    showQuickComparison(presidentId) {
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.presidata = new PresiDATAApp();
});

window.presidata = null;