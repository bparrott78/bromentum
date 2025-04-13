import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use the service role key for admin operations
);

export async function POST(request: Request) {
  try {
    const { world_id, username } = await request.json();

    if (!world_id || !username) {
      return NextResponse.json({ message: 'Missing world_id or username.' }, { status: 400 });
    }

    // Check if the username already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json({ message: 'Username already taken.' }, { status: 409 });
    }

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking username:', selectError);
      return NextResponse.json({ message: 'Error checking username.' }, { status: 500 });
    }

    // Insert the new user
    const { error: insertError } = await supabase.from('users').insert({
      world_id,
      username,
    });

    if (insertError) {
      console.error('Error inserting user:', insertError);
      return NextResponse.json({ message: 'Error creating user.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User created successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'Unexpected error occurred.' }, { status: 500 });
  }
}
