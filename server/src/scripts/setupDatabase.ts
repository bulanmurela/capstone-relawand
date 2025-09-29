import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const setupDatabase = async () => {
  console.log('🔧 RelaWand Database Setup Wizard');
  console.log('=====================================\n');

  try {
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('📄 Found existing .env file\n');
    } else {
      const exampleEnvPath = path.join(__dirname, '../../.env.example');
      if (fs.existsSync(exampleEnvPath)) {
        envContent = fs.readFileSync(exampleEnvPath, 'utf8');
        console.log('📄 Using .env.example as template\n');
      }
    }

    console.log('Please choose your MongoDB setup:');
    console.log('1. Local MongoDB (localhost:27017)');
    console.log('2. MongoDB Atlas (Cloud)');
    console.log('3. Custom MongoDB URI');

    const choice = await question('\nEnter your choice (1-3): ');

    let mongoUri = '';

    switch (choice) {
      case '1':
        mongoUri = 'mongodb://localhost:27017/relawand';
        console.log('\n✅ Using local MongoDB');
        break;

      case '2':
        console.log('\n🌐 MongoDB Atlas Setup');
        console.log('Please provide your MongoDB Atlas connection details:');

        const username = await question('Username: ');
        const password = await question('Password: ');
        const cluster = await question('Cluster URL (e.g., cluster0.xxxxx.mongodb.net): ');

        mongoUri = `mongodb+srv://${username}:${password}@${cluster}/relawand?retryWrites=true&w=majority`;
        console.log('\n✅ MongoDB Atlas configuration set');
        break;

      case '3':
        mongoUri = await question('\nEnter your custom MongoDB URI: ');
        console.log('\n✅ Custom MongoDB URI set');
        break;

      default:
        console.log('\n❌ Invalid choice. Using default local MongoDB.');
        mongoUri = 'mongodb://localhost:27017/relawand';
        break;
    }

    const updateEnvVariable = (content: string, key: string, value: string): string => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
      } else {
        return content + `\n${key}=${value}`;
      }
    };

    envContent = updateEnvVariable(envContent, 'MONGODB_URI', mongoUri);

    fs.writeFileSync(envPath, envContent);
    console.log(`\n📝 Updated .env file: ${envPath}`);

    const createSampleData = await question('\nWould you like to initialize the database with sample data? (y/n): ');

    if (createSampleData.toLowerCase() === 'y' || createSampleData.toLowerCase() === 'yes') {
      console.log('\n🔄 Initializing database with sample data...');
      const initDatabase = await import('./initDatabase');
      await initDatabase.default();
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your MongoDB service (if using local MongoDB)');
    console.log('2. Run: npm run dev');
    console.log('3. Your API will be available at: http://localhost:5000');
    console.log('\n📚 Available API endpoints:');
    console.log('  - GET  /api/health           - API health check');
    console.log('  - POST /api/users            - Create user');
    console.log('  - GET  /api/users            - Get all users');
    console.log('  - POST /api/devices          - Create device');
    console.log('  - GET  /api/devices          - Get all devices');
    console.log('  - POST /api/sensors          - Create sensor data');
    console.log('  - GET  /api/sensors          - Get sensor data');
    console.log('  - POST /api/alerts           - Create alert');
    console.log('  - GET  /api/alerts           - Get alerts');
    console.log('  - POST /api/image-captures   - Create image capture');
    console.log('  - GET  /api/image-captures   - Get image captures');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
  } finally {
    rl.close();
  }
};

if (require.main === module) {
  setupDatabase();
}

export default setupDatabase;