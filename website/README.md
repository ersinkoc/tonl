# TONL Website

This directory contains the static website for tonl.dev.

## Structure

```
website/
├── index.html      - Homepage
├── docs.html       - Documentation
├── examples.html   - Live playground and examples
└── assets/         - Images, icons, etc.
```

## Technologies

- **Tailwind CSS** - Utility-first CSS framework
- **Alpine.js** - Lightweight JavaScript framework
- **TONL Browser Build** - For live playground functionality

## Development

To preview locally:

```bash
# Option 1: Simple HTTP server
npx serve website

# Option 2: Python
cd website && python -m http.server 8000

# Option 3: PHP
cd website && php -S localhost:8000
```

Then open http://localhost:8000

## Deployment

This site is configured for GitHub Pages:

1. Push to `main` branch
2. GitHub Actions will automatically deploy to gh-pages
3. Site will be available at https://ersinkoc.github.io/tonl (or tonl.dev if custom domain configured)

## Custom Domain Setup

To use tonl.dev custom domain:

1. Create `CNAME` file in this directory with content: `tonl.dev`
2. Configure DNS:
   - Add A records pointing to GitHub Pages IPs
   - Or add CNAME record pointing to `ersinkoc.github.io`
3. Enable custom domain in GitHub repository settings

## License

MIT License - Same as main TONL project
