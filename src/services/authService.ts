import { supabase } from "../lib/supabaseClient";

export async function signIn(
    email: string,
    password: string
) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;    
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      }, 
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

