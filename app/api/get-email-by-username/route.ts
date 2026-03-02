import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { username } = await req.json() as { username: string };

        if (!username || username.trim() === '') {
            return NextResponse.json({ error: 'Username wajib diisi' }, { status: 400 });
        }

        // Use service role to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .ilike('full_name', username.trim())
            .limit(1)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Username tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ email: data.email });
    } catch {
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
