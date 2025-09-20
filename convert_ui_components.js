const fs = require('fs');
const path = require('path');

const uiDir = './src/components/ui';

// Get all .tsx files in the UI directory
const files = fs.readdirSync(uiDir).filter(file => file.endsWith('.tsx'));

files.forEach(file => {
  const tsxPath = path.join(uiDir, file);
  const jsxPath = path.join(uiDir, file.replace('.tsx', '.jsx'));
  
  // Read the TypeScript file
  let content = fs.readFileSync(tsxPath, 'utf8');
  
  // Convert TypeScript to JavaScript
  // Remove type annotations from React.forwardRef
  content = content.replace(/React\.forwardRef<[^>]+>/g, 'React.forwardRef');
  
  // Remove interface declarations
  content = content.replace(/export interface \w+[^}]+}/g, '');
  
  // Remove type imports
  content = content.replace(/import { [^}]+type [^}]+ } from/g, (match) => {
    return match.replace(/,?\s*type\s+\w+/g, '');
  });
  
  // Remove VariantProps type usage
  content = content.replace(/& VariantProps<typeof \w+>/g, '');
  
  // Remove React.ComponentPropsWithoutRef and similar types
  content = content.replace(/React\.ComponentPropsWithoutRef<[^>]+>/g, '');
  content = content.replace(/React\.ElementRef<[^>]+>/g, '');
  content = content.replace(/React\.HTMLAttributes<[^>]+>/g, '');
  content = content.replace(/React\.ComponentProps<[^>]+>/g, '');
  
  // Remove type annotations from function parameters
  content = content.replace(/:\s*React\.HTMLAttributes<[^>]+>/g, '');
  content = content.replace(/:\s*React\.ComponentPropsWithoutRef<[^>]+>/g, '');
  content = content.replace(/:\s*React\.ElementRef<[^>]+>/g, '');
  content = content.replace(/:\s*React\.ComponentProps<[^>]+>/g, '');
  content = content.replace(/:\s*React\.TextareaHTMLAttributes<[^>]+>/g, '');
  content = content.replace(/:\s*React\.ButtonHTMLAttributes<[^>]+>/g, '');
  content = content.replace(/:\s*React\.InputHTMLAttributes<[^>]+>/g, '');
  
  // Remove generic type parameters
  content = content.replace(/<[^>]+>/g, (match) => {
    if (match.includes('React.') || match.includes('HTML') || match.includes('Element')) {
      return '';
    }
    return match;
  });
  
  // Clean up any remaining type annotations
  content = content.replace(/:\s*[A-Z][a-zA-Z]*\s*\[\]/g, '');
  content = content.replace(/:\s*[A-Z][a-zA-Z]*/g, '');
  
  // Write the JavaScript file
  fs.writeFileSync(jsxPath, content);
  console.log(`Converted ${file} to ${file.replace('.tsx', '.jsx')}`);
});

console.log('Conversion complete!');
