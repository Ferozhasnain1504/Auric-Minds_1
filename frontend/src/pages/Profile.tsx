import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { User, Mail, Phone, MapPin, Camera, Check, WifiOff, Bell, Moon, Sun } from 'lucide-react';
import { getProfile, updateProfile, deleteAccount } from '../api/user';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.log("Profile load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      await updateProfile(profile);
      alert("✅ Profile Saved!");
      loadProfile();
    } catch (err) {
      alert("❌ Failed to update profile");
    }
  };

  const handleDelete = async () => {
    await deleteAccount();
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Error loading profile ❌</div>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl mb-2">Profile & Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ✅ Profile Card */}
          <GlassCard className="lg:col-span-1" glow>
            <div className="text-center">

              <motion.div className="w-32 h-32 bg-gradient-to-br from-[#3A7AFE] to-[#B517FF] 
              rounded-full flex items-center justify-center mx-auto">
                <User className="w-16 h-16" />
              </motion.div>

              <input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-transparent text-2xl mt-4 text-center border-b border-gray-600 focus:outline-none"
              />

              <p className="text-gray-400">{profile.email}</p>

              <div className="space-y-3 mt-4 text-left">
                <div className="flex gap-3 text-sm">
                  <Phone className="w-4 text-blue-400" />
                  <input
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="bg-transparent focus:outline-none"
                    placeholder="Add Phone"
                  />
                </div>

                <div className="flex gap-3 text-sm">
                  <MapPin className="w-4 text-blue-400" />
                  <input
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="bg-transparent focus:outline-none"
                    placeholder="Add Location"
                  />
                </div>
              </div>

              <button 
                className="mt-5 w-full py-3 rounded-xl bg-blue-500"
                onClick={handleSave}
              >
                ✅ Save Profile
              </button>

            </div>
          </GlassCard>

        {/* ✅ Right Side */}
        <div className="col-span-2 space-y-6">

          {/* ✅ Preferences */}
          <GlassCard>
            <h3 className="text-lg mb-4">Preferences</h3>

            {/* Notifications */}
            <div className="flex justify-between p-3 bg-white/5 rounded-xl mb-2">
              <span>Notifications</span>
              <input
                type="checkbox"
                checked={profile.notifications}
                onChange={() => setProfile({ ...profile, notifications: !profile.notifications })}
              />
            </div>

            {/* Dark Mode */}
            <div className="flex justify-between p-3 bg-white/5 rounded-xl mb-2">
              <span>Dark Mode</span>
              <input
                type="checkbox"
                checked={profile.darkMode}
                onChange={() => setProfile({ ...profile, darkMode: !profile.darkMode })}
              />
            </div>
          </GlassCard>

          {/* ✅ Alerts */}
          <GlassCard>
            <h3 className="mb-4 text-lg">Alert Thresholds</h3>

            {/* Stress */}
            <div className="mb-6">
              <label>Stress Level: {profile.stressAlertLevel}</label>
              <input type="range" min="0" max="100"
                value={profile.stressAlertLevel}
                onChange={(e) => setProfile({ ...profile, stressAlertLevel: Number(e.target.value) })}
              />
            </div>

            {/* Fatigue */}
            <div>
              <label>Fatigue Level: {profile.fatigueAlertLevel}</label>
              <input type="range" min="0" max="100"
                value={profile.fatigueAlertLevel}
                onChange={(e) => setProfile({ ...profile, fatigueAlertLevel: Number(e.target.value) })}
              />
            </div>
          </GlassCard>

          {/* ✅ Delete */}
          <GlassCard className="border-l-4 border-red-500">
            <h3 className="text-red-500 text-lg mb-2">Danger Zone</h3>
            <button
              className="bg-red-600 w-full py-3 rounded-xl"
              onClick={handleDelete}
            >
              ❌ Delete Account
            </button>
          </GlassCard>

        </div>
      </div>
    </div>
    </Layout>
  );
}
