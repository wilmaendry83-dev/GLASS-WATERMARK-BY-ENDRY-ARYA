import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import official Xiaomi MiSans fonts directly from npm package
import 'misans/lib/Normal/MiSans-Normal.min.css';
import 'misans/lib/Normal/MiSans-Medium.min.css';
import 'misans/lib/Normal/MiSans-Semibold.min.css';
import 'misans/lib/Normal/MiSans-Bold.min.css';

createRoot(document.getElementById('root')!).render(<App />);
