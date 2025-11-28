# PresiDATA

Plataforma web para explorar e comparar dados dos presidentes brasileiros desde o início da República. A aplicação entrega uma experiência moderna com busca inteligente, cartões animados e indicadores econômicos interativos.

![Visão geral do PresiDATA futuramente](assets/icons/presidometro.mp4)

## ✨ Recursos
- **Busca instantânea** por nome do presidente com sugestões e cartões dinâmicos.
- **Perfil completo**: foto, partido, período de mandato, assinatura e indicadores econômicos.
- **Comparador interativo** para colocar dois presidentes lado a lado e analisar mandatos, sucessos e polêmicas.
- **Layout responsivo** com animações sutis, tema claro e grid de fundo personalizado.

## 🛠️ Tecnologias
- HTML5 + CSS3 (Playfair Display / Inter)
- JavaScript (GSAP, ScrollTrigger, AOS)
- Dados estáticos em JSON (`data/presidentes-db.json` e `data/presidentes-atualizado.json`)
- API externa (Wikipédia) + uma feita por mim

## 🚀 Como executar
1. Clone o repositório:
   ```bash
   git clone https://github.com/ericdalaporta/presidata.git
   cd presidata
   ```
2. Abra `index.html` diretamente no navegador **ou** utilize a extensão Live Server / Vite para recarregar automaticamente.

## 📁 Estrutura
```
.
├── assets/            # Ícones e imagens
├── css/               # Estilos (home, páginas internas, responsivo)
├── data/              # Bases em JSON com informações dos presidentes
├── js/                # Scripts de busca, animações e comparação
├── index.html         # Página inicial com busca
└── presidente.html    # Página detalhada de cada presidente
```

## 📄 Licença
Projeto distribuído sob a licença [MIT](LICENSE).

Sinta-se à vontade para abrir issues ou pull requests com melhorias. 
