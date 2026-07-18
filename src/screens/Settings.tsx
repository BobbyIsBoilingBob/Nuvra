import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Bell, Map, Shield, LogOut } from 'lucide-react';

export default function Settings() {
  const resetTo = useStore((s) => s.resetTo);
  const { signOut } = useAuth();
  return (
    <div className="pb-24">
      <Header title="Settings" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        <Card className="p-4 flex items-center gap-3"><Bell size={20} className="text-brand-400" /><span className="text-white">Notifications</span></Card>
        <Card className="p-4 flex items-center gap-3"><Map size={20} className="text-brand-400" /><span className="text-white">Map preferences</span></Card>
        <Card className="p-4 flex items-center gap-3"><Shield size={20} className="text-brand-400" /><span className="text-white">Privacy</span></Card>
        <Button variant="danger" className="w-full" onClick={() => { signOut(); resetTo('home'); }}><LogOut size={18} /> Sign Out</Button>
      </div>
    </div>
  );
}
