#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Mario Charts Registry...\n');

// Verify registry structure
const registryDir = path.join(process.cwd(), 'public', 'r');
const registryFile = path.join(registryDir, 'registry.json');
const componentsDir = path.join(registryDir, 'components');

if (!fs.existsSync(registryDir)) {
  console.error('❌ Registry directory not found: public/r');
  process.exit(1);
}

if (!fs.existsSync(registryFile)) {
  console.error('❌ Registry file not found: public/r/registry.json');
  process.exit(1);
}

// Verify main registry file
try {
  const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
  console.log('✅ Main registry file is valid');
  console.log(`   Name: ${registry.name}`);
  console.log(`   Components: ${registry.items.length}`);
  console.log(`   Schema: ${registry.$schema}\n`);
  
  // Verify each component
  for (const item of registry.items) {
    console.log(`🧩 Verifying component: ${item.name}`);
    
    const componentFile = path.join(componentsDir, `${item.name}.json`);
    if (!fs.existsSync(componentFile)) {
      console.error(`   ❌ Component file not found: ${componentFile}`);
      continue;
    }
    
    try {
      const component = JSON.parse(fs.readFileSync(componentFile, 'utf8'));
      console.log(`   ✅ Component JSON is valid`);
      console.log(`   📝 Title: ${component.title}`);
      console.log(`   📦 Dependencies: ${component.dependencies.length}`);
      console.log(`   📁 Files: ${component.files.length}`);
      
      // Check if documentation exists
      const docFile = path.join(componentsDir, `${item.name}.md`);
      if (fs.existsSync(docFile)) {
        console.log(`   📚 Documentation: ✅`);
      } else {
        console.log(`   📚 Documentation: ❌`);
      }
      
    } catch (error) {
      console.error(`   ❌ Invalid component JSON: ${error.message}`);
    }
    
    console.log('');
  }
  
} catch (error) {
  console.error('❌ Invalid registry JSON:', error.message);
  process.exit(1);
}

console.log('🎉 Registry verification complete!');
console.log('\n📖 Usage:');
console.log('   Add to your project: npx shadcn add https://mariocharts.com/r/bar-chart');
console.log('   Or test locally: npx shadcn add ./public/r/components/bar-chart.json');