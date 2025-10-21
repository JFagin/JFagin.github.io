# Personal Website for Astrophysicist

A professional personal website template for astrophysicists applying to postdoctoral positions.

## Features

- **Clean, Professional Design**: Modern layout with a professional color scheme
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Complete Sections**:
  - About Me with key skills
  - Research Interests with visual cards
  - Publications & Projects with links to arXiv, DOI, and ADS
  - Comprehensive CV section
  - Contact information with social media links
- **Smooth Navigation**: Interactive navigation with smooth scrolling
- **Easy to Customize**: All content is clearly marked with placeholders

## How to Customize

### 1. Personal Information
Edit `index.html` and replace the following placeholders:
- `[Your Name]` - Your full name
- `[specific area of astrophysics]` - Your research area
- `[University Name]` - Your institution
- `[Advisor Name]` - Your advisor's name
- And other bracketed placeholders throughout the file

### 2. Research Interests
Update the research cards in the "Research Interests" section with your own areas of focus.

### 3. Publications
Replace the template publications with your actual publications:
- Update titles, authors, journal information
- Add links to arXiv, DOI, and ADS entries
- Update descriptions

### 4. Projects
Add your research projects with:
- Project titles and descriptions
- Relevant tags for technologies/methods used

### 5. CV Information
Update all CV sections:
- Education history
- Research experience
- Awards and honors
- Teaching experience
- Presentations

### 6. Contact Information
Update your contact details:
- Email address
- Institution address
- Links to ORCID, GitHub, LinkedIn, Google Scholar

### 7. CV PDF
Add your CV PDF file as `cv.pdf` in the root directory, or update the link in the CV section.

### 8. Colors and Styling
To customize colors, edit `styles.css` and modify the CSS variables at the top:
```css
:root {
    --primary-color: #1a365d;
    --secondary-color: #2c5282;
    --accent-color: #3182ce;
    /* ... more colors */
}
```

## Testing Locally

To preview your website locally:

```bash
# Using Python 3
python3 -m http.server 8080

# Using Python 2
python -m SimpleHTTPServer 8080

# Then open http://localhost:8080 in your browser
```

## Publishing

This website is designed for GitHub Pages. Once you push your changes to the main branch, it will automatically be published at `https://[yourusername].github.io/`

## Files

- `index.html` - Main HTML file with all content
- `styles.css` - All styling and responsive design
- `script.js` - JavaScript for smooth scrolling and animations
- `README.md` - This file

## Browser Support

Works with all modern browsers including:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

## License

Feel free to use and customize this template for your personal website.