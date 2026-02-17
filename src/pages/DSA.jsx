import { motion } from 'framer-motion';
import Sidebar from '../components/dsa/Sidebar';
import ContentArea from '../components/dsa/ContentArea';
import RightPanel from '../components/dsa/RightPanel';

export default function DSA() {
  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar />
      <div className="lg:ml-72 p-6 lg:p-8 max-w-[1920px]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sticky top-4 z-30 mb-6 glass-card px-5 py-4">
          <h1 className="text-lg font-bold text-app-text">DSA Practice Workspace</h1>
          <p className="text-sm text-app-muted">Track progress, solve problems, and level up daily.</p>
        </motion.div>
        <div className="flex gap-8">
          <ContentArea />
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
