const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function deployFirestoreRules() {
  try {
    // Read service account credentials
    const serviceAccountPath = '/tmp/firebase-service-account.json';
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const authClient = await auth.getClient();
    const firestore = google.firestore('v1');
    const projectId = serviceAccount.project_id;

    // Read firestore rules
    const rulesContent = fs.readFileSync(
      path.join(__dirname, 'firestore.rules'),
      'utf8'
    );

    console.log('📋 Deploying Firestore rules...');

    // Get current ruleset
    const name = `projects/${projectId}/databases/(default)`;

    // Create new ruleset
    const createResponse = await firestore.projects.databases.documents.createDocument({
      auth: authClient,
      parent: `${name}/documents`,
      collectionId: 'rulesets',
      requestBody: {
        fields: {
          source: {
            stringValue: rulesContent,
          },
        },
      },
    });

    console.log('✅ Firestore rules deployed successfully!');
    console.log('🔄 Rules will be active within a few seconds.');

  } catch (error) {
    console.error('❌ Error deploying rules:', error.message);

    // Provide manual instructions
    console.log('\n📝 Manual deployment required:');
    console.log('\n1. Go to Firebase Console:');
    console.log('   https://console.firebase.google.com/project/aidoctor-5e9b2/firestore/rules');
    console.log('\n2. Copy the rules from: firestore.rules');
    console.log('\n3. Paste them in the Firebase Console Rules tab');
    console.log('\n4. Click "Publish" button');

    process.exit(1);
  }
}

deployFirestoreRules();
