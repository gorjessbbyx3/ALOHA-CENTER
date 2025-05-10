
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function cleanupNodeModules() {
  console.log('🧹 Cleaning up disk space...');
  
  try {
    // Clear Vite cache
    const viteDepsCachePath = path.join(process.cwd(), 'node_modules', '.vite');
    if (fs.existsSync(viteDepsCachePath)) {
      console.log('Clearing Vite dependencies cache...');
      await execAsync(`rm -rf ${viteDepsCachePath}`);
    }
    
    // Clean npm cache
    console.log('Cleaning npm cache...');
    await execAsync('npm cache clean --force');
    
    // Clear temporary files
    console.log('Removing temporary files...');
    await execAsync('rm -rf /tmp/*');
    
    // Display current disk usage
    console.log('Current disk usage:');
    const { stdout } = await execAsync('df -h');
    console.log(stdout);
    
    console.log('✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupNodeModules();
