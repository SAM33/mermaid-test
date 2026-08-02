# Mermaid Markdown Preview

A small, browser-based Mermaid previewer created with AI-assisted coding for
personal, non-commercial use. Paste Mermaid syntax or a Markdown `mermaid`
code block, preview the diagram locally in the browser, and download it as PNG
or PDF.

No document content is sent to a server. The published site is static; Mermaid
rendering and image/PDF export happen on the user's device.

## Features

- Paste Mermaid Markdown and get an instant diagram preview.
- One-tap clipboard paste, designed for mobile browsers.
- Download the rendered diagram as PNG or PDF.
- Responsive interface with no ads, accounts, or desktop application required.
- Deploy as a static GitHub Pages demo or a Docker container.

## Local development

Node.js 20 or newer is required.

```bash
npm install
npm run dev
```

Open the URL displayed by Vite.

## Docker

```bash
docker build -t markdown-mermaid-preview .
docker run --rm -p 8080:8080 markdown-mermaid-preview
```

Then open `http://localhost:8080`.

## GitHub Pages demo

The `Deploy demo site to GitHub Pages` workflow deploys every push to `main`.
Before the first deployment, open **Settings > Pages** in the GitHub repository
and select **GitHub Actions** as the publishing source. The resulting URL is
normally:

`https://<account-or-organization>.github.io/<repository-name>/`

GitHub Pages serves only the built frontend. It does not run the Docker image.
The workflow automatically configures the correct asset path for the repository
name, so the site also works when hosted below `/<repository-name>/`.

## License and third-party software

This project is intended as a free, personal, non-commercial utility. Its source
code is released under the [MIT License](LICENSE), which permits reuse,
modification, distribution, and commercial use when the license notice is kept.
If you need to prohibit commercial use, this project would need a different,
source-available license rather than an open-source MIT license.

Mermaid and jsPDF are third-party libraries used by this project. They retain
their own licenses (both MIT at the versions bundled here). See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for attribution and the
locations of their license texts in the built site and Docker image. Their
trademarks remain the property of their respective owners.
