import { 
  Mic, Shield, TrendingUp, Map, Users, Video, 
  Eye, Watch, MapPin, AlertTriangle, MessageSquare, WifiOff 
} from 'lucide-react';

export const FEATURES = [
  {
    id: 'distress',
    title: 'Silent Distress Detection',
    description: 'Hears danger before you can call for help',
    tag: 'AI + Voice',
    icon: Mic,
    path: '/dashboard/distress'
  },
  {
    id: 'score',
    title: 'Behavior Safety Score',
    description: 'Learns your routine. Flags the unusual.',
    tag: 'ML + GPS',
    icon: TrendingUp,
    path: '/dashboard/score'
  },
  {
    id: 'route',
    title: 'Smart Route Navigation',
    description: 'Safest path, not shortest path',
    tag: 'GPS + AI',
    icon: Map,
    path: '/dashboard/route'
  },
  {
    id: 'fakecall',
    title: 'Fake Call Shield',
    description: 'Looks like a call. Works like a lifeline.',
    tag: 'Audio + Camera',
    icon: Shield,
    path: '/dashboard/fakecall'
  },
  {
    id: 'community',
    title: 'Community Shield',
    description: 'Your neighborhood watching out for you',
    tag: 'Real-time',
    icon: Users,
    path: '/dashboard/community'
  },
  {
    id: 'evidence',
    title: 'Evidence Vault',
    description: 'Records everything. Deletes nothing.',
    tag: 'Cloud + Legal',
    icon: Video,
    path: '/dashboard/evidence'
  },
  {
    id: 'shadow',
    title: 'Shadow Mode',
    description: 'Knows when someone is following you',
    tag: 'GPS + ML',
    icon: Eye,
    path: '/dashboard/shadow'
  },
  {
    id: 'wearable',
    title: 'Wearable SOS',
    description: 'One tap on your wrist. Instant alert.',
    tag: 'Bluetooth + IoT',
    icon: Watch,
    path: '/dashboard/wearable'
  },
  {
    id: 'heatmap',
    title: 'Safety Heatmap',
    description: 'See which areas are safe before you go',
    tag: 'Community',
    icon: MapPin,
    path: '/dashboard/community' // Shared with community or separate
  },
  {
    id: 'alerts',
    title: '3-Level Alert System',
    description: 'Escalates automatically if no response',
    tag: 'AI + SMS',
    icon: AlertTriangle,
    path: '/dashboard/alerts'
  },
  {
    id: 'companion',
    title: 'AI Safety Companion',
    description: 'Checks in on you. Escalates if you don’t respond.',
    tag: 'LLM + NLP',
    icon: MessageSquare,
    path: '/dashboard/companion'
  },
  {
    id: 'offline',
    title: 'Offline Emergency Mode',
    description: 'Works with no signal. No exceptions.',
    tag: 'SMS + BLE',
    icon: WifiOff,
    path: '/dashboard/offline'
  }
];
