import { supabase } from "../lib/supabaseClient";

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
