
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bibtexParse from 'bibtex-parse-js';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIB_FILE = path.join(process.cwd(), 'citations.bib');
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'content', 'publications');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to clean BibTeX strings (remove braces)
function cleanString(str) {
  if (!str) return '';
  return str.replace(/[{}]/g, '').trim();
}

// Helper to parse authors
function parseAuthors(authorStr) {
  if (!authorStr) return [];
  return authorStr.split(' and ').map(name => {
    const cleanName = cleanString(name);
    // Handle "Last, First" format
    if (cleanName.includes(',')) {
      const parts = cleanName.split(',').map(p => p.trim());
      return `${parts[1]} ${parts[0]}`;
    }
    return cleanName;
  });
}

// Main function
function importBibtex() {
  if (!fs.existsSync(BIB_FILE)) {
    console.error(`Error: BibTeX file not found at ${BIB_FILE}`);
    console.log('Please place your "citations.bib" file in the project root.');
    process.exit(1);
  }

  const bibContent = fs.readFileSync(BIB_FILE, 'utf-8');
  const parsed = bibtexParse.toJSON(bibContent);

  console.log(`Found ${parsed.length} entries. Processing...`);

  let count = 0;
  parsed.forEach(entry => {
    const tags = entry.entryTags;
    
    // Basic validation
    if (!tags.title || !tags.year) {
      console.warn(`Skipping entry ${entry.citationKey}: Missing title or year.`);
      return;
    }

    const title = cleanString(tags.title);
    const year = parseInt(tags.year, 10);
    const authors = parseAuthors(tags.author);
    const venue = cleanString(tags.booktitle || tags.journal || tags.school || 'Unknown Venue');
    const type = entry.entryType === 'book' ? 'book' : 'paper';
    const description = cleanString(tags.abstract || `Published in ${venue}.`);
    
    // Generate filename: year-firstAuthor-titleSlug
    const firstAuthor = authors.length > 0 ? authors[0].split(' ').pop() : 'unknown';
    const titleSlug = slugify(title, { lower: true, strict: true }).slice(0, 30);
    const filename = `${year}-${firstAuthor}-${titleSlug}.md`;
    const filePath = path.join(OUTPUT_DIR, filename);

    // Check if file already exists to avoid overwriting manual edits (optional policy)
    // For now, we overwrite or create new.
    
    const frontmatter = [
      '---',
      `title: "${title.replace(/"/g, '\\"')}"`,
      `authors: [${authors.map(a => `"${a}"`).join(', ')}]`,
      `year: ${year}`,
      `venue: "${venue.replace(/"/g, '\\"')}"`,
      `type: "${type}"`,
      // Default cover
      // `cover: "../../assets/paper-default.jpg"`, 
      'links:',
      `  pdf: "${tags.url || '#'}"`,
      `  code: "#"`,
      `description: "${description.replace(/"/g, '\\"')}"`,
      'featured: false',
      '---',
      '',
      description
    ].join('\n');

    fs.writeFileSync(filePath, frontmatter);
    console.log(`Generated: ${filename}`);
    count++;
  });

  console.log(`\nSuccessfully imported ${count} publications.`);
}

importBibtex();
