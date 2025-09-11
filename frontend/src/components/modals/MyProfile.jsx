import { useAuthStore } from '@/store/useAuthStore';
import { Camera, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  const { setShowMyProfile, authUser, logout, updateProfile } = useAuthStore();
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowMyProfile();
    navigate("/onboarding");
  };

  const [formdata, setFormData] = useState({
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    age: authUser.age || "",
  });

  const handleChange = (e) => {
    setIsProfileChanged(true);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setIsProfileChanged(true);
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!isProfileChanged) return;
    try {
      await updateProfile({ ...formdata, profilePic: selectedImage });
      setIsProfileChanged(false);
      setShowMyProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="w-[100vw] fixed inset-0 min-h-[100vh] bg-black/40 flex px-6 py-10 items-center justify-center backdrop-blur-xs z-100">
      <div className="md:w-150 w-full min-h-[80vh] max-h-[80vh] bg-background rounded-3xl px-5 py-5 relative overflow-y-auto md:px-10">
        {/* Close Button */}
        <div className="w-full flex justify-end">
          <button onClick={setShowMyProfile} className="p-3 bg-sidebar rounded-full cursor-pointer">
            <X />
          </button>
        </div>

        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="space-y-2 text-center mb-10">
            <h2 className="text-2xl font-semibold">User Profile</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your profile information and settings.
            </p>
          </div>

          {/* Profile Image */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="relative w-32 h-32 rounded-full border-4 border-foreground/70 flex items-center justify-center bg-transparent">
              <img
                src={selectedImage ? URL.createObjectURL(selectedImage) : authUser?.profilePic || "./images/user.jpeg"}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="avatarUpload" className="absolute bottom-1 -right-1 bg-[#10B981] text-white p-2 rounded-full cursor-pointer shadow-md hover:scale-105 transition">
                <Camera className="h-5 w-5" strokeWidth={2.75} />
              </label>
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="flex w-full items-center py-4 gap-3 border-b border-border">
            <p className="font-medium w-32">Name</p>
            <div className="flex flex-1 gap-3">
              <input
                type="text"
                name="firstName"
                onChange={handleChange}
                className="w-1/2 bg-sidebar border border-border py-2 rounded px-2"
                value={formdata.firstName}
              />
              <input
                type="text"
                name="lastName"
                onChange={handleChange}
                className="w-1/2 bg-sidebar border border-border py-2 rounded px-2"
                value={formdata.lastName}
              />
            </div>
          </div>

          {/* Age Field */}
          <div className="flex w-full justify-between py-4 gap-3 border-b border-border items-center">
            <p className="font-medium w-32">Age</p>
            <div className="flex-1">
              <input
                type="number"
                name="age"
                onChange={handleChange}
                className="w-full bg-sidebar border border-border py-2 rounded px-2"
                value={formdata.age}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex w-full justify-between py-4 gap-3 border-b border-border items-center">
            <p className="font-medium w-32">Email</p>
            <div className="flex-1">
              <input
                type="email"
                className="w-full bg-sidebar border border-border py-2 rounded px-2"
                value={authUser.email}
                disabled
              />
            </div>
          </div>

          {/* Mobile Field */}
          <div className="flex w-full justify-between py-4 gap-3 border-b border-border items-center">
            <p className="font-medium w-32">Mobile No</p>
            <div className="flex-1">
              <input
                type="text"
                className="w-full bg-sidebar border border-border py-2 rounded px-2"
                value={authUser.mobile}
                disabled
              />
            </div>
          </div>

          {/* Account Info */}
          <div className="w-full mt-20">
            <h2 className="text-[17px] font-medium pb-4">Account Information</h2>
            <div className="w-full flex items-center border-b py-2 justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Member since</p>
              <p className="text-xs">{new Date(authUser?.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="w-full flex items-center py-2 justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
              <p className="text-sm font-medium text-green-500">Active</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex mt-10 items-center justify-center py-2 w-full text-white bg-red-600 font-semibold rounded-lg hover:opacity-75 transition-all duration-150 cursor-pointer"
          >
            Logout
          </button>

          {/* Save & Cancel */}
          <div className="mt-10 w-full flex justify-end gap-6">
            <button onClick={setShowMyProfile} className="px-4 py-1 border-2 border-border rounded-lg hover:opacity-80">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isProfileChanged}
              className="px-4 py-1 bg-foreground text-background rounded-lg hover:opacity-80 disabled:cursor-no-drop disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
