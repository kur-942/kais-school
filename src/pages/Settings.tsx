import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

interface UserData {
  name: string;
  email: string;
  niveau: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile form state
  const [profileData, setProfileData] = useState<UserData>({
    name: user?.name || "",
    email: user?.email || "",
    niveau: user?.niveau || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const DATABASE_URL = import.meta.env.VITE_URL;
  const sql = neon(DATABASE_URL);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Niveaux options
  const niveaux: { category: string; options: string[] }[] = [
    {
      category: "Baccalauréat",
      options: ["Bac Info"],
    },
  ];

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const checkEmailExists = async (
    email: string,
    currentUserId: number,
  ): Promise<boolean> => {
    try {
      const result = await sql`
        SELECT id FROM users WHERE email = ${email} AND id != ${currentUserId}
      `;
      const typedResult = result as any[];
      return typedResult.length > 0;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!user?.id) throw new Error("Utilisateur non trouvé");

      // Check if email is already in use by another user
      if (profileData.email !== user.email) {
        const emailExists = await checkEmailExists(profileData.email, user.id);
        if (emailExists) {
          throw new Error("Cet email est déjà utilisé par un autre compte");
        }
      }

      // Update user in database
      await sql`
        UPDATE users 
        SET name = ${profileData.name}, 
            email = ${profileData.email}, 
            niveau = ${profileData.niveau}
        WHERE id = ${user.id}
      `;

      // Update local user state
      useAuthStore.setState({
        user: {
          ...user,
          name: profileData.name,
          email: profileData.email,
          niveau: profileData.niveau,
        },
      });

      setSuccessMessage("Profil mis à jour avec succès !");
    } catch (error: any) {
      setErrorMessage(
        error.message || "Erreur lors de la mise à jour du profil",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!user?.id) throw new Error("Utilisateur non trouvé");

      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      // Get current user with password
      const result = await sql`
        SELECT password FROM users WHERE id = ${user.id}
      `;
      const typedResult = result as any[];

      if (typedResult.length === 0) {
        throw new Error("Utilisateur non trouvé");
      }

      const currentHashedPassword = typedResult[0].password;

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        passwordData.currentPassword,
        currentHashedPassword,
      );

      if (!isValidPassword) {
        throw new Error("Mot de passe actuel incorrect");
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, 10);

      // Update password in database
      await sql`
        UPDATE users 
        SET password = ${hashedNewPassword}
        WHERE id = ${user.id}
      `;

      // Clear password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccessMessage("Mot de passe mis à jour avec succès !");
    } catch (error: any) {
      setErrorMessage(
        error.message || "Erreur lors de la mise à jour du mot de passe",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!user?.id) throw new Error("Utilisateur non trouvé");

      // Delete user from database
      await sql`
        DELETE FROM users WHERE id = ${user.id}
      `;

      // Logout and redirect
      logout();
      navigate("/login");
    } catch (error: any) {
      setErrorMessage(
        error.message || "Erreur lors de la suppression du compte",
      );
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                Paramètres
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === "profile"
                ? "text-green-600 border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === "password"
                ? "text-green-600 border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mot de passe
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="Votre nom"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="votre@email.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                Cet email doit être unique. Il sera utilisé pour vous connecter.
              </p>
            </div>

            {/* Niveau */}
            <div>
              <label
                htmlFor="niveau"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Niveau d'étude
              </label>
              <select
                id="niveau"
                name="niveau"
                value={profileData.niveau}
                onChange={handleProfileChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
              >
                <option value="">Sélectionnez votre niveau</option>
                {niveaux.map((category) => (
                  <optgroup key={category.category} label={category.category}>
                    {category.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Mise à jour...
                </span>
              ) : (
                "Mettre à jour le profil"
              )}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe actuel
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="••••••"
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Mise à jour...
                </span>
              ) : (
                "Changer le mot de passe"
              )}
            </button>
          </form>
        )}

        {/* Danger Zone */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Zone dangereuse
          </h2>
          <button
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className="px-6 py-3 bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Supprimer mon compte
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Cette action est irréversible. Toutes vos données seront supprimées.
          </p>
        </div>
      </div>
    </div>
  );
};

// Need to import useAuthStore
import { useAuthStore } from "../store/authStore";
