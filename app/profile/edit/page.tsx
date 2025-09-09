'use client'
import PhotoUpload from "@/components/PhotoUpload";
import { getUserProfileDetails, UpdateUserProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function EditProfile() {
    const [formdata, setFormData] = React.useState({
        full_name: "",
        username: "",
        bio: "",
        gender: "male" as "male" | "female",
        birthdate: "",
        avatar_url: "",
    });
    const [loading, setLoading] = React.useState(true);
    const [saving, setsaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>();
    const router = useRouter();

    useEffect(() => {
        async function getUserProfile() {
        try {
            const profileData = await getUserProfileDetails();
            if (profileData) {
            setFormData({
                full_name: profileData.full_name || "",
                username: profileData.username || "",
                bio: profileData.bio || "",
                gender: profileData.gender || "male",
                birthdate: profileData.birthdate || "",
                avatar_url: profileData.avatar_url || "",
            });
            }
        } catch (error) {
            setError("Error occured");
        } finally {
            setLoading(false);
        }
        }
        getUserProfile();
    }, []);
     if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your profile..
          </p>
        </div>
      </div>
    );
  }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setsaving(true);
        setError(null);
        try {
        const details = await UpdateUserProfile(formdata);
        if (details.success) {
            router.push("/profile");
        } else {
            setError(details.error || "Error occured somewhere");
        }
        } catch (error) {
        setError("Failed to update the profile details");
        } finally {
        setsaving(false);
        }
    }

    function handleChange(
        e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({
        ...prev,
        [name]: value,
        }));
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
        <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
            Update your profile information
        </p>
        </header>

        {/* Form */}
        <form
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
        onSubmit={handleSubmit}
        >
          {/* Profile Picture */}
        <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Profile Picture
            </label>
            <div className="flex items-center space-x-6">
            <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                <img
                    src={formdata.avatar_url || "/user-image.jpg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
                </div>
                <PhotoUpload
                onPhotoUploaded={(url) => {
                    setFormData((prev) => ({
                    ...prev,
                    avatar_url: url,
                    }));
                }}
                />
            </div>
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Upload a new profile picture
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                JPG or PNG. Max 10MB.
                </p>
            </div>
            </div>
        </div>

          {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
            <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Full Name *
            </label>
            <input
                type="text"
                onChange={handleChange}
                id="full_name"
                name="full_name"
                value={formdata.full_name}
                required
                className="w-full px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
            />
            </div>
            <div>
            <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Username *
            </label>
            <input
                type="text"
                id="username"
                name="username"
                value={formdata.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Choose a username"
            />
            </div>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Gender *
                </label>
                <select
                    id="gender"
                    name="gender"
                    value={formdata.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    <option value="male" className="rounded-md">
                    Male
                    </option>
                    <option value="female" className="rounded-md">
                    Female
                    </option>
                </select>
                </div>
                <div>
                <label
                    htmlFor="birthdate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Birthday *
                </label>
                <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formdata.birthdate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                </div>
            </div>

            {/* About Me */}
            <div>
                <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                About Me *
                </label>
                <textarea
                id="bio"
                name="bio"
                value={formdata.bio}
                onChange={handleChange}
                required
                rows={2}
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Tell others about yourself..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formdata.bio.length}/200 characters
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                Cancel
                </button>
                <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}
