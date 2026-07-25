const seedTemplates = [
  {
    type: 'tutorial-refresh',
    title: 'Firebase v8 Auth Tutorial (Upgraded to v9+)',
    sourceUrl: 'https://www.youtube.com/watch?v=un9vSDFW8B4',
    topic: 'Firebase Authentication',
    status: 'complete',
    overview: {
      originalStack: [
        { name: 'firebase', version: '^8.10.0', status: 'deprecated', migrationDifficulty: 'medium' },
        { name: 'react', version: '^17.0.2', status: 'updated', migrationDifficulty: 'easy' }
      ],
      currentStack: [
        { name: 'firebase', version: '^10.12.0', docUrl: 'https://firebase.google.com/docs/auth/web/start' },
        { name: 'react', version: '^18.3.1', docUrl: 'https://react.dev' }
      ],
      recommendations: [
        {
          instead: "import firebase from 'firebase/app';",
          use: "import { initializeApp } from 'firebase/app';",
          reason: "Firebase v9+ uses a modular SDK that supports tree-shaking, resulting in up to 80% smaller bundle sizes for authentication."
        },
        {
          instead: "firebase.auth().signInWithEmailAndPassword()",
          use: "signInWithEmailAndPassword(auth, email, password)",
          reason: "Authentication methods are now independent functional imports rather than chained instance methods on the global object."
        }
      ]
    },
    diffs: [
      {
        fileName: 'firebaseConfig.js',
        oldCode: `import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "app-id.firebaseapp.com",
  projectId: "app-id"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export default firebase;`,
        newCode: `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "app-id.firebaseapp.com",
  projectId: "app-id"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and export
export const auth = getAuth(app);`,
        explanation: 'In Firebase v9+, you initialize the application via `initializeApp` and pass the returned app instance to `getAuth` to configure auth modules.'
      },
      {
        fileName: 'Login.js',
        oldCode: `import React, { useState } from 'react';
import { auth } from './firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Logged in:', userCredential.user);
      })
      .catch((error) => console.error(error.message));
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" onChange={e => setEmail(e.target.value)} />
      <input type="password" onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}`,
        newCode: `import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in:', userCredential.user);
    } catch (error) {
      console.error(error.code, error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}`,
        explanation: 'Import `signInWithEmailAndPassword` directly from `firebase/auth` and pass the configured `auth` reference as the first argument, followed by the credentials.'
      }
    ],
    steps: [
      {
        order: 1,
        title: 'Upgrade Firebase Dependency',
        description: 'Upgrade the firebase npm package to the latest modular v10 release.',
        commands: ['npm install firebase@latest'],
        codeBlocks: [],
        docLinks: [
          { title: 'Firebase Web Codegen Guide', url: 'https://firebase.google.com/docs/web/setup' }
        ],
        completed: false
      },
      {
        order: 2,
        title: 'Update Firebase Initialization File',
        description: 'Refactor firebaseConfig.js to export auth utilizing the functional initializeApp and getAuth APIs.',
        commands: [],
        codeBlocks: [
          {
            fileName: 'firebaseConfig.js',
            code: `import { initializeApp } from 'firebase/app';\nimport { getAuth } from 'firebase/auth';\n\nconst app = initializeApp({ ... });\nexport const auth = getAuth(app);`,
            language: 'javascript'
          }
        ],
        docLinks: [
          { title: 'Firebase Authentication modular migration', url: 'https://firebase.google.com/docs/auth/web/modular-upgrade' }
        ],
        completed: false
      },
      {
        order: 3,
        title: 'Rewrite authentication triggers in UI components',
        description: 'Change instances of `auth.signInWithEmailAndPassword(...)` to use the standalone `signInWithEmailAndPassword(auth, ...)` functional API.',
        commands: [],
        codeBlocks: [
          {
            fileName: 'Login.jsx',
            code: `import { signInWithEmailAndPassword } from 'firebase/auth';\nimport { auth } from './firebaseConfig';\n\ntry {\n  const creds = await signInWithEmailAndPassword(auth, email, password);\n} catch (err) {\n  console.error(err);\n}`,
            language: 'javascript'
          }
        ],
        docLinks: [
          { title: 'Firebase Auth Reference', url: 'https://firebase.google.com/docs/reference/js/auth' }
        ],
        completed: false
      }
    ],
    resources: [
      { title: 'Firebase Official Web Setup Docs', url: 'https://firebase.google.com/docs/web/setup', type: 'documentation' },
      { title: 'Firebase Migration Guide (v8 to v9+)', url: 'https://firebase.google.com/docs/web/modular-upgrade', type: 'article' }
    ]
  },
  {
    type: 'tutorial-refresh',
    title: 'React Router v5 SPA (Upgraded to v6)',
    sourceUrl: 'https://www.youtube.com/watch?v=lawju352qrc',
    topic: 'React Router Routing',
    status: 'complete',
    overview: {
      originalStack: [
        { name: 'react-router-dom', version: '^5.3.0', status: 'deprecated', migrationDifficulty: 'medium' }
      ],
      currentStack: [
        { name: 'react-router-dom', version: '^6.23.1', docUrl: 'https://reactrouter.com/en/main' }
      ],
      recommendations: [
        {
          instead: "<Switch>",
          use: "<Routes>",
          reason: "In v6, <Switch> is replaced by <Routes> which matches routes relative to their parents and handles layout hierarchy automatically."
        },
        {
          instead: "<Route component={Home}>",
          use: "<Route element={<Home />}>",
          reason: "Routes now accept JSX elements via the `element` prop instead of component references, allowing easier passing of custom props."
        },
        {
          instead: "const history = useHistory(); history.push('/page')",
          use: "const navigate = useNavigate(); navigate('/page')",
          reason: "The useHistory hook is replaced by useNavigate, consolidating redirect methods and integrating smoothly with concurrent rendering patterns."
        }
      ]
    },
    diffs: [
      {
        fileName: 'App.js',
        oldCode: `import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/profile/:id" component={Profile} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}`,
        newCode: `import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}`,
        explanation: 'Replace `<Switch>` with `<Routes>`, change `component` to `element` passing component instances directly, and use `<Navigate to="/" replace />` instead of `<Redirect>`.'
      }
    ],
    steps: [
      {
        order: 1,
        title: 'Upgrade React Router Dependency',
        description: 'Upgrade your project dependencies to install React Router v6.',
        commands: ['npm install react-router-dom@6'],
        codeBlocks: [],
        docLinks: [
          { title: 'React Router Upgrade FAQ', url: 'https://reactrouter.com/en/main/upgrading/v5' }
        ],
        completed: false
      },
      {
        order: 2,
        title: 'Replace Switch blocks with Routes',
        description: 'Update the main routing wrapper in your main router layout, converting old `<Redirect>` statements to `<Navigate>` components.',
        commands: [],
        codeBlocks: [
          {
            fileName: 'App.jsx',
            code: `<Routes>\n  <Route path="/" element={<Home />} />\n  <Route path="*" element={<Navigate to="/" replace />} />\n</Routes>`,
            language: 'javascript'
          }
        ],
        docLinks: [
          { title: 'Routes API Reference', url: 'https://reactrouter.com/en/main/components/routes' }
        ],
        completed: false
      }
    ],
    resources: [
      { title: 'React Router v6 Official Docs', url: 'https://reactrouter.com/en/main', type: 'documentation' }
    ]
  },
  {
    type: 'tech-guide',
    title: 'Google Antigravity 2.0 Complete Developer Guide',
    sourceUrl: '',
    topic: 'Google Antigravity 2.0 API',
    status: 'complete',
    overview: {
      originalStack: [
        { name: 'antigravity-sdk', version: 'v1.5.0', status: 'deprecated', migrationDifficulty: 'hard' }
      ],
      currentStack: [
        { name: 'google-antigravity-sdk', version: 'v2.0.4', docUrl: 'https://antigravity.google.com/sdk-docs' }
      ],
      recommendations: [
        {
          instead: "antigravity.setupAgent()",
          use: "const agent = new AntigravityAgent({ model: 'gemini-3.5-flash', capabilities: ['skills'] })",
          reason: "Antigravity 2.0 adopts a class-based initialization mechanism which natively mounts system skills and delegates LLM contexts."
        }
      ]
    },
    diffs: [
      {
        fileName: 'agentSetup.js',
        oldCode: `// Antigravity 1.5 setup
const antigravity = require('antigravity');

antigravity.setupAgent({
  type: 'conversational',
  engine: 'standard'
});`,
        newCode: `// Antigravity 2.0 SDK setup
import { AntigravityAgent } from 'google-antigravity-sdk';

const agent = new AntigravityAgent({
  model: 'gemini-3.5-flash',
  capabilities: ['skills', 'mcp'],
  activeWorkspace: './scratch'
});

await agent.initialize();`,
        explanation: 'Import the specific `AntigravityAgent` class and initialize it with explicit capabilities (such as skills or Model Context Protocols) and workspace bounds.'
      }
    ],
    steps: [
      {
        order: 1,
        title: 'Initialize Workspace & Install SDK',
        description: 'Add the Google Antigravity SDK dependency to your project files.',
        commands: ['npm install google-antigravity-sdk'],
        codeBlocks: [],
        docLinks: [
          { title: 'Google Antigravity Core Setup', url: 'https://antigravity.google.com/docs/quickstart' }
        ],
        completed: false
      },
      {
        order: 2,
        title: 'Configure Agent Capabilities & Skills',
        description: 'Define your agent instance, matching the active model parameters to your operational requirements.',
        commands: [],
        codeBlocks: [
          {
            fileName: 'agent.js',
            code: `import { AntigravityAgent } from 'google-antigravity-sdk';\n\nconst agent = new AntigravityAgent({\n  model: 'gemini-3.5-flash',\n  skills: ['read_file', 'write_file', 'run_command']\n});`,
            language: 'javascript'
          }
        ],
        docLinks: [
          { title: 'Antigravity Skills Definition', url: 'https://antigravity.google.com/docs/skills' }
        ],
        completed: false
      }
    ],
    resources: [
      { title: 'Google Antigravity Homepage', url: 'https://antigravity.google.com', type: 'documentation' }
    ]
  }
];

module.exports = seedTemplates;
