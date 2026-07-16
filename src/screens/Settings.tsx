import { Icon, GlassCard, SectionTitle, Button, AvatarDisplay } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import type { NotificationSettings, PrivacySettings, AccessibilitySettings } from '../data';

// ------------------------------------------------------------
// Toggle sub-component
// ------------------------------------------------------------
function Toggle({
  label,
  description,
  icon,
  value,
  onToggle,
}: {
  label: string;
  description?: string;
  icon: string;
  value: boolean;
  onToggle: () => void;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-9 h-9 rounded-xl glass flex items-center justify-center text-nova-300 flex-shrink-0">
        <Icon name={icon} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white">{label}</div>
        {description && <div className="text-xs text-white/50">{description}</div>}
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={value}
        aria-label={label}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          value ? 'bg-gradient-to-r from-nova-400 to-cyan-400' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

// ------------------------------------------------------------
// Segmented selector sub-component
// ------------------------------------------------------------
function Segmented<T extends string>({
  label,
  icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}): React.ReactElement {
  return (
    <div className="py-2.5">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-9 h-9 rounded-xl glass flex items-center justify-center text-nova-300 flex-shrink-0">
          <Icon name={icon} size={16} />
        </div>
        <div className="text-sm font-bold text-white">{label}</div>
      </div>
      <div className="flex gap-1.5 p-1 glass rounded-xl">
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 shadow-glow'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Settings screen
// ------------------------------------------------------------
export function Settings(): React.ReactElement {
  const {
    profile,
    setScreen,
    updateProfile,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
    accessibility,
    setAccessibility,
  } = useStore();

  function updateNotifications<K extends keyof NotificationSettings>(key: K, value: boolean): void {
    setNotifications({ ...notifications, [key]: value });
  }
  function updatePrivacy<K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]): void {
    setPrivacy({ ...privacy, [key]: value });
  }
  function updateAccessibility<K extends keyof AccessibilitySettings>(key: K, value: boolean): void {
    setAccessibility({ ...accessibility, [key]: value });
  }

  const notificationItems: { key: keyof NotificationSettings; label: string; desc: string; icon: string }[] = [
    { key: 'dailyRewards', label: 'Daily Rewards', desc: 'Reminders to claim daily rewards', icon: 'Gift' },
    { key: 'seasonalEvents', label: 'Seasonal Events', desc: 'New seasonal events and updates', icon: 'CalendarStar' },
    { key: 'friendActivity', label: 'Friend Activity', desc: 'Friends going on adventures', icon: 'Users' },
    { key: 'adventureReminders', label: 'Adventure Reminders', desc: 'Reminders to stay active', icon: 'Compass' },
    { key: 'achievementUnlocks', label: 'Achievement Unlocks', desc: 'When you unlock achievements', icon: 'Award' },
    { key: 'communityUpdates', label: 'Community Updates', desc: 'News and community highlights', icon: 'Megaphone' },
  ];

  const accessibilityItems: { key: keyof AccessibilitySettings; label: string; desc: string; icon: string }[] = [
    { key: 'highContrast', label: 'High Contrast', desc: 'Increase visual contrast', icon: 'Contrast' },
    { key: 'reducedMotion', label: 'Reduced Motion', desc: 'Minimize animations', icon: 'Wind' },
    { key: 'largeText', label: 'Large Text', desc: 'Increase text size', icon: 'Type' },
    { key: 'colorblindMode', label: 'Colorblind Mode', desc: 'Adjust colors for clarity', icon: 'Eye' },
    { key: 'screenReaderLabels', label: 'Screen Reader Labels', desc: 'Extra labels for assistive tech', icon: 'Volume2' },
    { key: 'minTouchTarget', label: 'Min Touch Target', desc: 'Larger tap areas', icon: 'Pointer' },
  ];

  const helpLinks: { label: string; icon: string }[] = [
    { label: 'FAQ', icon: 'HelpCircle' },
    { label: 'Contact Support', icon: 'Mail' },
    { label: 'Report a Problem', icon: 'Flag' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#40f5cb" />

      <div className="relative z-10">
        <TopBar showBack title="Settings" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Profile section */}
          <GlassCard className="p-5">
            <SectionTitle icon="User" accent="text-nova-300">
              Profile
            </SectionTitle>
            <div className="mt-4 flex items-center gap-4">
              <AvatarDisplay
                emoji={profile.avatar.emoji}
                color={profile.avatar.color}
                size={56}
                ring
              />
              <div className="flex-1 min-w-0">
                <div className="text-base font-black text-white">{profile.username}</div>
                <div className="text-xs text-white/50 mt-0.5">
                  Level {profile.level} · {profile.distanceKm.toFixed(1)} km walked
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon="Edit3"
                onClick={() => setScreen('customise')}
              >
                Edit Profile
              </Button>
            </div>
          </GlassCard>

          {/* Privacy controls */}
          <GlassCard className="p-5">
            <SectionTitle icon="Shield" accent="text-plasma-300">
              Privacy
            </SectionTitle>
            <div className="mt-4 flex flex-col divide-y divide-white/5">
              <Toggle
                label="Location Sharing"
                description="Share location during adventures"
                icon="MapPin"
                value={privacy.locationSharing}
                onToggle={() => updatePrivacy('locationSharing', !privacy.locationSharing)}
              />
              <Segmented
                label="Profile Visibility"
                icon="Eye"
                value={privacy.profileVisibility}
                onChange={(v) => updatePrivacy('profileVisibility', v)}
                options={[
                  { id: 'public', label: 'Public' },
                  { id: 'friends', label: 'Friends' },
                  { id: 'private', label: 'Private' },
                ]}
              />
              <Segmented
                label="Friend Requests"
                icon="UserPlus"
                value={privacy.friendRequests}
                onChange={(v) => updatePrivacy('friendRequests', v)}
                options={[
                  { id: 'everyone', label: 'Everyone' },
                  { id: 'friends_of_friends', label: 'Friends of Friends' },
                  { id: 'nobody', label: 'Nobody' },
                ]}
              />
              <Toggle
                label="Activity Sharing"
                description="Share your activity with friends"
                icon="Activity"
                value={privacy.activitySharing}
                onToggle={() => updatePrivacy('activitySharing', !privacy.activitySharing)}
              />
              <Toggle
                label="Public Adventures"
                description="Allow your adventures to be public"
                icon="Share2"
                value={privacy.publicAdventures}
                onToggle={() => updatePrivacy('publicAdventures', !privacy.publicAdventures)}
              />
            </div>
          </GlassCard>

          {/* Notification settings */}
          <GlassCard className="p-5">
            <SectionTitle icon="Bell" accent="text-nova-300">
              Notifications
            </SectionTitle>
            <div className="mt-4 flex flex-col divide-y divide-white/5">
              {notificationItems.map((item) => (
                <Toggle
                  key={item.key}
                  label={item.label}
                  description={item.desc}
                  icon={item.icon}
                  value={notifications[item.key]}
                  onToggle={() => updateNotifications(item.key, !notifications[item.key])}
                />
              ))}
            </div>
          </GlassCard>

          {/* Accessibility settings */}
          <GlassCard className="p-5">
            <SectionTitle icon="Accessibility" accent="text-ember-300">
              Accessibility
            </SectionTitle>
            <div className="mt-4 flex flex-col divide-y divide-white/5">
              {accessibilityItems.map((item) => (
                <Toggle
                  key={item.key}
                  label={item.label}
                  description={item.desc}
                  icon={item.icon}
                  value={accessibility[item.key]}
                  onToggle={() => updateAccessibility(item.key, !accessibility[item.key])}
                />
              ))}
            </div>
          </GlassCard>

          {/* Units & Language */}
          <GlassCard className="p-5">
            <SectionTitle icon="Settings" accent="text-nova-300">
              Preferences
            </SectionTitle>
            <div className="mt-4 flex flex-col divide-y divide-white/5">
              <Segmented
                label="Units"
                icon="Ruler"
                value={profile.units}
                onChange={(v) => updateProfile({ units: v })}
                options={[
                  { id: 'km', label: 'Kilometers' },
                  { id: 'mi', label: 'Miles' },
                ]}
              />
              <div className="py-2.5">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-xl glass flex items-center justify-center text-nova-300 flex-shrink-0">
                    <Icon name="Globe" size={16} />
                  </div>
                  <div className="text-sm font-bold text-white">Language</div>
                </div>
                <div className="relative">
                  <select
                    value="en"
                    onChange={() => undefined}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl glass text-white text-sm font-semibold outline-none focus:ring-1 focus:ring-nova-400/40 transition-all cursor-pointer"
                  >
                    <option value="en" className="bg-ink-900 text-white">English</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icon name="ChevronDown" size={16} className="text-white/40" />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Help & Support */}
          <GlassCard className="p-5">
            <SectionTitle icon="LifeBuoy" accent="text-cyan-300">
              Help & Support
            </SectionTitle>
            <div className="mt-4 flex flex-col gap-2">
              {helpLinks.map((link) => (
                <button
                  key={link.label}
                  className="flex items-center gap-3 p-2.5 rounded-xl glass hover:bg-white/[0.1] transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-xl glass flex items-center justify-center text-nova-300 flex-shrink-0">
                    <Icon name={link.icon} size={16} />
                  </div>
                  <span className="flex-1 text-sm font-bold text-white">{link.label}</span>
                  <Icon name="ChevronRight" size={16} className="text-white/30 flex-shrink-0" />
                </button>
              ))}
            </div>
          </GlassCard>

          {/* About Nuvra */}
          <GlassCard className="p-5">
            <SectionTitle icon="Info" accent="text-plasma-300">
              About Nuvra
            </SectionTitle>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Version</span>
                <span className="text-sm font-bold text-white">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Build</span>
                <span className="text-sm font-bold text-white">2024.10</span>
              </div>
              <div className="pt-3 border-t border-white/5">
                <p className="text-xs text-white/40 leading-relaxed">
                  Nuvra is a gamified walking adventure app that turns your neighborhood into an
                  explorable world filled with treasures, challenges, and rewards.
                </p>
              </div>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className="text-xs text-white/30">Made with</span>
                <Icon name="Heart" size={12} className="text-rose-400" />
                <span className="text-xs text-white/30">by the Nuvra Team</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
