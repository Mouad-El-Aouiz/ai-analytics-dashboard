import { supabase } from "../lib/supabaseClient";

export interface Company {
  id: string;
  name: string;
  industry: string | null;
}

// Renvoie le company_id de l'utilisateur connecté (via son profil).
export async function getCurrentCompanyId(): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("No authenticated user.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.company_id) {
    throw new Error("User is not associated with a company.");
  }

  return data.company_id;
}

// Charge l'entreprise de l'utilisateur connecté (Settings).
export async function getCompany(): Promise<Company> {
  const companyId = await getCurrentCompanyId();

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, industry")
    .eq("id", companyId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    industry: data.industry,
  };
}

// Met à jour le nom / secteur de l'entreprise. La RLS ("Users can update
// their own company") garantit qu'un utilisateur ne peut modifier que la
// sienne.
export async function updateCompany(
  name: string,
  industry: string | null
): Promise<void> {
  const companyId = await getCurrentCompanyId();

  const { error } = await supabase
    .from("companies")
    .update({ name, industry })
    .eq("id", companyId);

  if (error) {
    throw new Error(error.message);
  }
}

// Met à jour le profil de l'utilisateur (nom affiché, avatar).
// Seules ces colonnes sont modifiables (voir rls.sql : grant update sur
// full_name et avatar_url uniquement).
export async function updateProfile(
  fullName: string,
  avatarUrl: string | null
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("No authenticated user.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}