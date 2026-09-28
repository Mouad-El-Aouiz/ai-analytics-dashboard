import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { signOut } from "../services/authService";
import {
  getCompany,
  updateCompany,
  updateProfile,
} from "../services/companyService";
import { getFullName } from "../utils/userUtils";

import Skeleton from "../components/ui/Skeleton";

function Settings() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(
    getFullName(user?.user_metadata?.full_name)
  );
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function loadCompany() {
      try {
        setLoading(true);
        const company = await getCompany();

        if (!ignore) {
          setCompanyName(company.name);
          setIndustry(company.industry ?? "");
        }
      } catch (err) {
        console.error("Failed to load company", err);

        if (!ignore) {
          setError("Unable to load your company details.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCompany();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage(null);
      setError(null);

      await Promise.all([
        updateProfile(fullName, null),
        updateCompany(companyName, industry.trim() || null),
      ]);

      setMessage("Modifications enregistrées.");
    } catch (err) {
      console.error("Failed to save settings", err);
      setError("Unable to save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />

        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez votre profil et votre entreprise.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6"
      >
        {/* Profile */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Profile</h2>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Company */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-gray-900">Company</h2>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Company name
            </label>

            <input
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Industry
            </label>

            <input
              type="text"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              placeholder="E-commerce, SaaS, Retail..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate("/login");
            }}
            className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;